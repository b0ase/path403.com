/**
 * GitHub PR Merge Webhook
 *
 * POST /api/webhooks/github/pr-merge
 * Triggered when a PR is merged - auto-submits the linked milestone
 *
 * Flow:
 * 1. Developer creates PR linked to milestone
 * 2. PR gets merged
 * 3. This webhook fires
 * 4. Milestone is auto-submitted for approval
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { sendNotification, NotificationType } from '@/lib/notification-service';

// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyGitHubSignature(payload, signature)) {
        console.error('[github-webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Only process pull_request events
    if (event !== 'pull_request') {
      return NextResponse.json({ message: 'Event ignored', event }, { status: 200 });
    }

    const body = JSON.parse(payload);
    const { action, pull_request, repository } = body;

    // Only process merged PRs
    if (action !== 'closed' || !pull_request?.merged) {
      return NextResponse.json({ message: 'PR not merged, ignoring' }, { status: 200 });
    }

    const repoFullName = repository.full_name;
    const prNumber = pull_request.number;
    const prUrl = pull_request.html_url;
    const mergeCommit = pull_request.merge_commit_sha;
    const prTitle = pull_request.title;
    const prBody = pull_request.body || '';

    console.log(`[github-webhook] PR #${prNumber} merged in ${repoFullName}`);

    const supabase = await createClient();
    const prisma = getPrisma();

    // Find linked milestone by PR number in github_pr_milestones table
    const { data: prMilestone, error: prError } = await supabase
      .from('github_pr_milestones')
      .select('*')
      .eq('github_repo', repoFullName)
      .eq('github_pr_number', prNumber)
      .eq('status', 'pending')
      .single();

    if (prError || !prMilestone) {
      // Also check if PR body contains milestone reference: #milestone-uuid
      const milestoneMatch = prBody.match(/#milestone-([a-f0-9-]{36})/i);

      if (!milestoneMatch) {
        console.log(`[github-webhook] No linked milestone found for PR #${prNumber}`);
        return NextResponse.json({ message: 'No linked milestone found' }, { status: 200 });
      }

      // Found milestone ID in PR body
      const milestoneId = milestoneMatch[1];

      // Create the link
      await supabase.from('github_pr_milestones').insert({
        github_repo: repoFullName,
        github_pr_number: prNumber,
        github_pr_url: prUrl,
        github_merge_commit: mergeCommit,
        contract_id: '', // Will be filled from milestone
        milestone_id: milestoneId,
        status: 'merged',
        merged_at: new Date().toISOString(),
      });

      // Get the milestone
      const milestone = await prisma.contract_milestones.findUnique({
        where: { id: milestoneId },
        include: { marketplace_contracts: true },
      });

      if (!milestone) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
      }

      // Auto-submit the milestone
      await prisma.contract_milestones.update({
        where: { id: milestoneId },
        data: {
          status: 'submitted',
          deliverable_description: `PR merged: ${prTitle}\n\n${prUrl}`,
          deliverable_urls: [prUrl],
          developer_notes: `Automatically submitted via GitHub PR merge.\nCommit: ${mergeCommit}`,
          submitted_at: new Date(),
        },
      });

      // Notify client
      const clientProfile = await prisma.profiles.findUnique({
        where: { id: milestone.marketplace_contracts.client_user_id },
        select: { email: true, full_name: true },
      });

      if (clientProfile?.email) {
        await sendNotification(NotificationType.MILESTONE_SUBMITTED, {
          recipientEmail: clientProfile.email,
          recipientName: clientProfile.full_name || 'Client',
          contractId: milestone.contract_id,
          contractTitle: milestone.marketplace_contracts.service_title || 'Service Contract',
          contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${milestone.contract_id}`,
          additionalData: {
            milestoneTitle: milestone.title,
            deliverableDescription: `PR #${prNumber} merged: ${prTitle}`,
            prUrl,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Milestone auto-submitted from PR body reference',
        milestoneId,
        prNumber,
      });
    }

    // Update the existing PR milestone link
    await supabase
      .from('github_pr_milestones')
      .update({
        github_merge_commit: mergeCommit,
        status: 'merged',
        merged_at: new Date().toISOString(),
      })
      .eq('id', prMilestone.id);

    // Get the milestone
    const milestone = await prisma.contract_milestones.findUnique({
      where: { id: prMilestone.milestone_id },
      include: { marketplace_contracts: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Only auto-submit if milestone is pending
    if (milestone.status !== 'pending') {
      return NextResponse.json({
        message: `Milestone already ${milestone.status}, skipping auto-submit`,
        milestoneId: milestone.id,
      }, { status: 200 });
    }

    // Auto-submit the milestone
    await prisma.contract_milestones.update({
      where: { id: milestone.id },
      data: {
        status: 'submitted',
        deliverable_description: `PR merged: ${prTitle}\n\n${prUrl}`,
        deliverable_urls: [prUrl],
        developer_notes: `Automatically submitted via GitHub PR merge.\nCommit: ${mergeCommit}`,
        submitted_at: new Date(),
      },
    });

    // Notify client
    const clientProfile = await prisma.profiles.findUnique({
      where: { id: milestone.marketplace_contracts.client_user_id },
      select: { email: true, full_name: true },
    });

    if (clientProfile?.email) {
      await sendNotification(NotificationType.MILESTONE_SUBMITTED, {
        recipientEmail: clientProfile.email,
        recipientName: clientProfile.full_name || 'Client',
        contractId: milestone.contract_id,
        contractTitle: milestone.marketplace_contracts.service_title || 'Service Contract',
        contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${milestone.contract_id}`,
        additionalData: {
          milestoneTitle: milestone.title,
          deliverableDescription: `PR #${prNumber} merged: ${prTitle}`,
          prUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone auto-submitted on PR merge',
      milestoneId: milestone.id,
      prNumber,
      mergeCommit,
    });
  } catch (error) {
    console.error('[github-webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
