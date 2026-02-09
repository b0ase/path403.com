/**
 * POST /api/github/repos/[owner]/[repo]/sync
 *
 * Syncs GitHub issues for a tokenized repository.
 * Fetches all issues from GitHub API and caches them locally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { syncGitHubIssues } from '@/lib/github-issue-sync';
import { getUserGitHubToken } from '@/lib/github-token';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;

  try {
    const prisma = getPrisma();

    // Find the tokenized repository
    const tokenizedRepo = await prisma.tokenized_repositories.findFirst({
      where: {
        github_owner: owner,
        github_repo_name: repo,
      },
    });

    if (!tokenizedRepo) {
      return NextResponse.json(
        { error: 'Repository not found in tokenized_repositories' },
        { status: 404 }
      );
    }

    // Try to get a GitHub token for authenticated requests (higher rate limit)
    let token: string | null = null;

    // Check if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      token = await getUserGitHubToken(user.id);
    }

    // Sync issues
    const result = await syncGitHubIssues(
      tokenizedRepo.id,
      owner,
      repo,
      token
    );

    // Update last_synced_at on the repository
    await prisma.tokenized_repositories.update({
      where: { id: tokenizedRepo.id },
      data: { last_synced_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      owner,
      repo,
      repoId: tokenizedRepo.id,
      ...result,
    });
  } catch (error) {
    console.error('Error syncing issues:', error);
    return NextResponse.json(
      { error: 'Failed to sync issues', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
