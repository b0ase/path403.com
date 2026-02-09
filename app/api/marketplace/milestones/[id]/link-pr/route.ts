/**
 * Link GitHub PR to Milestone API
 *
 * POST /api/marketplace/milestones/[id]/link-pr
 * Developer links a GitHub PR to a milestone for auto-submission on merge
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';

const linkPrSchema = z.object({
  prUrl: z.string().url().refine(
    url => url.includes('github.com') && url.includes('/pull/'),
    'Must be a valid GitHub PR URL'
  ),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;
    const body = await request.json();
    const data = linkPrSchema.parse(body);

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get milestone
    const milestone = await prisma.contract_milestones.findUnique({
      where: { id: milestoneId },
      include: { marketplace_contracts: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Verify user is the developer
    if (milestone.marketplace_contracts.developer_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the assigned developer can link PRs' },
        { status: 403 }
      );
    }

    // Parse GitHub PR URL
    // Format: https://github.com/owner/repo/pull/123
    const urlMatch = data.prUrl.match(/github\.com\/([^\/]+\/[^\/]+)\/pull\/(\d+)/);
    if (!urlMatch) {
      return NextResponse.json({ error: 'Invalid GitHub PR URL format' }, { status: 400 });
    }

    const [, repoFullName, prNumber] = urlMatch;

    // Check if this PR is already linked
    const { data: existing } = await supabase
      .from('github_pr_milestones')
      .select('*')
      .eq('github_repo', repoFullName)
      .eq('github_pr_number', parseInt(prNumber))
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'This PR is already linked to a milestone',
        existingMilestoneId: existing.milestone_id,
      }, { status: 409 });
    }

    // Create PR-milestone link
    const { data: prLink, error: linkError } = await supabase
      .from('github_pr_milestones')
      .insert({
        github_repo: repoFullName,
        github_pr_number: parseInt(prNumber),
        github_pr_url: data.prUrl,
        contract_id: milestone.contract_id,
        milestone_id: milestoneId,
        status: 'pending',
      })
      .select()
      .single();

    if (linkError) {
      console.error('[link-pr] Error:', linkError);
      return NextResponse.json({ error: 'Failed to link PR' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      link: {
        id: prLink.id,
        repo: repoFullName,
        prNumber: parseInt(prNumber),
        prUrl: data.prUrl,
        milestoneId,
        status: 'pending',
      },
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/github/pr-merge`,
      instructions: `When PR #${prNumber} is merged, this milestone will be auto-submitted for approval.`,
    });
  } catch (error) {
    console.error('[link-pr] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to link PR', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Check if milestone has linked PRs
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;

    const supabase = await createClient();

    const { data: links, error } = await supabase
      .from('github_pr_milestones')
      .select('*')
      .eq('milestone_id', milestoneId);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch PR links' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      links: links || [],
    });
  } catch (error) {
    console.error('[link-pr] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unlink a PR from milestone
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get milestone to verify ownership
    const milestone = await prisma.contract_milestones.findUnique({
      where: { id: milestoneId },
      include: { marketplace_contracts: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestone.marketplace_contracts.developer_user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Delete the link
    const { error: deleteError } = await supabase
      .from('github_pr_milestones')
      .delete()
      .eq('id', linkId)
      .eq('milestone_id', milestoneId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to unlink PR' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'PR unlinked from milestone',
    });
  } catch (error) {
    console.error('[link-pr] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
