/**
 * POST /api/github/webhooks
 *
 * GitHub webhook handler for PR merges and issue closures.
 * When issues assigned to a tranche are closed (via merged PRs),
 * this triggers escrow release for that tranche's investors.
 *
 * Webhook events to configure in GitHub:
 * - pull_request (for PR merges)
 * - issues (for issue closures)
 *
 * Security: Validates GitHub signature using GITHUB_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[github/webhooks] No GITHUB_WEBHOOK_SECRET configured');
    return false;
  }

  if (!signature) {
    return false;
  }

  const sig = signature.replace('sha256=', '');
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');

  return sig === digest;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyGitHubSignature(payload, signature)) {
        console.error('[github/webhooks] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(payload);
    const supabase = await createClient();

    // Handle issue events
    if (event === 'issues') {
      const action = data.action;
      const issue = data.issue;
      const repo = data.repository;

      console.log(`[github/webhooks] Issue ${action}: #${issue.number} in ${repo.full_name}`);

      if (action === 'closed') {
        // Update our cached issue state
        await supabase
          .from('github_issues')
          .update({
            state: 'closed',
            closed_at: issue.closed_at,
            updated_at: issue.updated_at,
          })
          .eq('github_issue_id', issue.number)
          .eq('repo_id', await getRepoId(supabase, repo.id));

        // Check if this closes out any tranches
        await checkTrancheCompletion(supabase, repo.full_name, issue.number);
      }

      if (action === 'reopened') {
        await supabase
          .from('github_issues')
          .update({
            state: 'open',
            closed_at: null,
            updated_at: issue.updated_at,
          })
          .eq('github_issue_id', issue.number)
          .eq('repo_id', await getRepoId(supabase, repo.id));
      }

      return NextResponse.json({ success: true, event: 'issues', action });
    }

    // Handle pull request events
    if (event === 'pull_request') {
      const action = data.action;
      const pr = data.pull_request;
      const repo = data.repository;

      console.log(`[github/webhooks] PR ${action}: #${pr.number} in ${repo.full_name}`);

      // Only process merged PRs
      if (action === 'closed' && pr.merged) {
        console.log(`[github/webhooks] PR #${pr.number} merged - checking for linked issues`);

        // Extract issue numbers from PR body (e.g., "Fixes #123", "Closes #456")
        const linkedIssues = extractLinkedIssues(pr.body || '');

        if (linkedIssues.length > 0) {
          console.log(`[github/webhooks] Found linked issues: ${linkedIssues.join(', ')}`);

          // Mark linked issues as closed in our cache
          for (const issueNumber of linkedIssues) {
            await supabase
              .from('github_issues')
              .update({
                state: 'closed',
                closed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('github_issue_id', issueNumber)
              .eq('repo_id', await getRepoId(supabase, repo.id));

            // Check tranche completion for each linked issue
            await checkTrancheCompletion(supabase, repo.full_name, issueNumber);
          }
        }
      }

      return NextResponse.json({ success: true, event: 'pull_request', action, merged: pr.merged });
    }

    // Handle ping event (sent when webhook is first configured)
    if (event === 'ping') {
      console.log('[github/webhooks] Received ping event');
      return NextResponse.json({ success: true, event: 'ping', zen: data.zen });
    }

    return NextResponse.json({ success: true, event, message: 'Event ignored' });

  } catch (error) {
    console.error('[github/webhooks] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Extract issue numbers from PR body that use GitHub's linking keywords
function extractLinkedIssues(body: string): number[] {
  const patterns = [
    /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi,
    /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:[\w-]+\/[\w-]+)?#(\d+)/gi,
  ];

  const issues = new Set<number>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      issues.add(parseInt(match[1], 10));
    }
  }

  return Array.from(issues);
}

// Get our internal repo ID from GitHub's repo ID
async function getRepoId(supabase: any, githubRepoId: number): Promise<string | null> {
  const { data } = await supabase
    .from('tokenized_repositories')
    .select('id')
    .eq('github_repo_id', githubRepoId)
    .single();

  return data?.id || null;
}

// Check if closing this issue completes a tranche
async function checkTrancheCompletion(supabase: any, repoFullName: string, issueNumber: number) {
  try {
    // Find the issue in our cache
    const { data: issue } = await supabase
      .from('github_issues')
      .select(`
        id,
        repo_id,
        tranche_assignments (
          tranche_id,
          funding_tranches (
            id,
            name,
            project_slug,
            status
          )
        )
      `)
      .eq('github_issue_id', issueNumber)
      .single();

    if (!issue?.tranche_assignments?.length) {
      console.log(`[github/webhooks] Issue #${issueNumber} not assigned to any tranche`);
      return;
    }

    // Check each tranche this issue is assigned to
    for (const assignment of issue.tranche_assignments) {
      const tranche = assignment.funding_tranches;
      if (!tranche || tranche.status !== 'open') continue;

      // Get all issues in this tranche
      const { data: trancheIssues } = await supabase
        .from('github_issue_tranches')
        .select(`
          github_issue (
            id,
            state
          )
        `)
        .eq('tranche_id', tranche.id);

      if (!trancheIssues?.length) continue;

      // Check if all issues are closed
      const allClosed = trancheIssues.every((ti: any) => ti.github_issue?.state === 'closed');

      if (allClosed) {
        console.log(`[github/webhooks] All issues in tranche "${tranche.name}" are closed!`);

        // Update tranche status to completed
        await supabase
          .from('funding_tranches')
          .update({ status: 'completed' })
          .eq('id', tranche.id);

        // Trigger escrow release for investors in this tranche
        await releaseTrancheEscrow(supabase, tranche.id, tranche.project_slug);

        console.log(`[github/webhooks] Tranche "${tranche.name}" marked as completed, escrow released`);
      } else {
        const closedCount = trancheIssues.filter((ti: any) => ti.github_issue?.state === 'closed').length;
        console.log(`[github/webhooks] Tranche "${tranche.name}": ${closedCount}/${trancheIssues.length} issues closed`);
      }
    }
  } catch (error) {
    console.error('[github/webhooks] Error checking tranche completion:', error);
  }
}

// Release escrow for all investors in a completed tranche
// AND allocate equity to b0ase for completed work (Kintsugi model)
async function releaseTrancheEscrow(supabase: any, trancheId: string, projectSlug: string) {
  try {
    // Get all investor allocations for this tranche
    const { data: allocations } = await supabase
      .from('investor_allocations')
      .select('*')
      .eq('tranche_id', trancheId)
      .eq('escrow_status', 'pending');

    if (!allocations?.length) {
      console.log(`[github/webhooks] No pending escrow allocations for tranche ${trancheId}`);
      return;
    }

    console.log(`[github/webhooks] Releasing escrow for ${allocations.length} investors`);

    // Update each allocation to release escrow
    for (const allocation of allocations) {
      await supabase
        .from('investor_allocations')
        .update({
          escrow_status: 'released',
          escrow_released_at: new Date().toISOString(),
        })
        .eq('id', allocation.id);

      console.log(`[github/webhooks] Released escrow for allocation ${allocation.id}`);
    }

    // KINTSUGI MODEL: Allocate equity to b0ase for completed work
    // Each completed tranche = 1% equity earned by b0ase
    await allocateEquityToB0ase(supabase, projectSlug, trancheId, 1.0);

    // Create notification for project admin
    // TODO: Send email/notification to project owner

  } catch (error) {
    console.error('[github/webhooks] Error releasing escrow:', error);
  }
}

// Allocate equity to b0ase.com for completed development work
async function allocateEquityToB0ase(
  supabase: any,
  projectSlug: string,
  trancheId: string,
  equityPercent: number
) {
  try {
    // b0ase system user ID (create or use existing)
    const B0ASE_SYSTEM_USER_ID = process.env.B0ASE_SYSTEM_USER_ID || 'b0ase-system';

    // Get the project
    const { data: project } = await supabase
      .from('projects')
      .select('id, owner_user_id, social_links')
      .eq('slug', projectSlug)
      .single();

    if (!project) {
      console.error(`[github/webhooks] Project not found: ${projectSlug}`);
      return;
    }

    // Check if this is a Kintsugi project
    const isKintsugi = project.social_links?.createdVia === 'kintsugi-engine';
    if (!isKintsugi) {
      console.log(`[github/webhooks] Not a Kintsugi project, skipping equity allocation`);
      return;
    }

    // Get the tranche details
    const { data: tranche } = await supabase
      .from('funding_tranches')
      .select('tranche_number, name')
      .eq('id', trancheId)
      .single();

    // Record equity allocation to b0ase
    const { error: allocationError } = await supabase
      .from('equity_allocations')
      .insert({
        project_slug: projectSlug,
        project_id: project.id,
        recipient_id: B0ASE_SYSTEM_USER_ID,
        recipient_type: 'platform',
        equity_percent: equityPercent,
        allocation_type: 'development_completion',
        tranche_id: trancheId,
        notes: `Earned ${equityPercent}% equity for completing Tranche ${tranche?.tranche_number}: ${tranche?.name}`,
        created_at: new Date().toISOString(),
      });

    if (allocationError) {
      // Table might not exist, log and continue
      console.warn('[github/webhooks] Could not record equity allocation:', allocationError.message);

      // Fallback: Update project_members if equity_allocations doesn't exist
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', B0ASE_SYSTEM_USER_ID)
        .single();

      if (existingMember) {
        // Update existing share
        const currentShare = parseFloat(existingMember.equity_share) || 0;
        await supabase
          .from('project_members')
          .update({ equity_share: currentShare + equityPercent })
          .eq('id', existingMember.id);
      } else {
        // Create new member record for b0ase
        await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            user_id: B0ASE_SYSTEM_USER_ID,
            role: 'developer',
            equity_share: equityPercent,
          });
      }
    }

    // Update owner's equity (decrease proportionally)
    if (project.owner_user_id) {
      const { data: ownerMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', project.owner_user_id)
        .single();

      if (ownerMember) {
        const currentShare = parseFloat(ownerMember.equity_share) || 100;
        const newShare = Math.max(0, currentShare - equityPercent);
        await supabase
          .from('project_members')
          .update({ equity_share: newShare })
          .eq('id', ownerMember.id);
      }
    }

    console.log(`[github/webhooks] Allocated ${equityPercent}% equity to b0ase for ${projectSlug} tranche completion`);

  } catch (error) {
    console.error('[github/webhooks] Error allocating equity to b0ase:', error);
  }
}

// GET endpoint for verification and status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    events: ['issues', 'pull_request', 'ping'],
    description: 'GitHub webhook for PR merge → escrow release automation',
    docs: 'Configure this URL in your GitHub repository webhook settings',
  });
}
