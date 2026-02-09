/**
 * GET /api/github/repos/[owner]/[repo]/issues
 *
 * Returns cached GitHub issues for a repository.
 * If no cached issues exist, returns empty array (use /sync to populate).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
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

    // Get cached issues
    const issues = await prisma.github_issues.findMany({
      where: { repo_id: tokenizedRepo.id },
      orderBy: [
        { state: 'asc' }, // open first
        { github_issue_id: 'desc' }, // newest first
      ],
    });

    // Get last sync time
    const lastSyncedAt = issues.length > 0
      ? issues.reduce((latest, issue) => {
          const syncTime = issue.last_synced_at;
          return syncTime > latest ? syncTime : latest;
        }, issues[0].last_synced_at)
      : null;

    return NextResponse.json({
      owner,
      repo,
      repoId: tokenizedRepo.id,
      tokenSymbol: tokenizedRepo.token_symbol,
      issueCount: issues.length,
      lastSyncedAt,
      issues: issues.map(issue => ({
        id: issue.id,
        number: issue.github_issue_id,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        htmlUrl: issue.html_url,
        authorLogin: issue.author_login,
        labels: issue.labels,
        assignees: issue.assignees,
        milestone: issue.milestone,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching cached issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}
