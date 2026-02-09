/**
 * GitHub Issue Sync Library
 *
 * Fetches and caches GitHub issues for tokenized repositories.
 * Used for building project roadmaps tied to funding tranches.
 */

import { getPrisma } from './prisma';

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: { login: string } | null;
  labels: Array<{ name: string; color: string }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  milestone: { title: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

/**
 * Fetch all issues from a GitHub repository
 * Uses the GitHub REST API with pagination
 */
export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubIssue[]> {
  const issues: GitHubIssue[] = [];
  let page = 1;
  const perPage = 100;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'b0ase-roadmap-sync',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    const data: GitHubIssue[] = await response.json();

    if (data.length === 0) break;

    // Filter out pull requests (they also appear in /issues endpoint)
    const issuesOnly = data.filter(
      (item: any) => !item.pull_request
    );

    issues.push(...issuesOnly);

    if (data.length < perPage) break;
    page++;
  }

  return issues;
}

/**
 * Sync GitHub issues to local database for a tokenized repository
 */
export async function syncGitHubIssues(
  repoId: string,
  owner: string,
  repo: string,
  token?: string | null
): Promise<SyncResult> {
  const prisma = getPrisma();
  const result: SyncResult = {
    synced: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  try {
    const issues = await fetchGitHubIssues(owner, repo, token);

    for (const issue of issues) {
      try {
        const issueData = {
          repo_id: repoId,
          github_issue_id: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          html_url: issue.html_url,
          author_login: issue.user?.login || null,
          labels: issue.labels.map(l => ({ name: l.name, color: l.color })),
          assignees: issue.assignees.map(a => ({ login: a.login, avatar_url: a.avatar_url })),
          milestone: issue.milestone?.title || null,
          created_at: new Date(issue.created_at),
          updated_at: new Date(issue.updated_at),
          closed_at: issue.closed_at ? new Date(issue.closed_at) : null,
          last_synced_at: new Date(),
        };

        // Upsert: create or update based on repo_id + github_issue_id
        const existing = await prisma.github_issues.findFirst({
          where: {
            repo_id: repoId,
            github_issue_id: issue.number,
          },
        });

        if (existing) {
          await prisma.github_issues.update({
            where: { id: existing.id },
            data: issueData,
          });
          result.updated++;
        } else {
          await prisma.github_issues.create({
            data: issueData,
          });
          result.created++;
        }

        result.synced++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Issue #${issue.number}: ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Fetch failed: ${msg}`);
  }

  return result;
}

/**
 * Get cached issues for a repository
 */
export async function getCachedIssues(repoId: string) {
  const prisma = getPrisma();

  return prisma.github_issues.findMany({
    where: { repo_id: repoId },
    orderBy: [
      { state: 'asc' }, // open first
      { github_issue_id: 'desc' }, // newest first
    ],
  });
}

/**
 * Get issues for a specific funding tranche
 */
export async function getTrancheIssues(trancheId: string) {
  const prisma = getPrisma();

  const assignments = await prisma.github_issue_tranches.findMany({
    where: { tranche_id: trancheId },
    include: {
      github_issue: true,
    },
    orderBy: { priority: 'asc' },
  });

  return assignments.map(a => ({
    ...a.github_issue,
    priority: a.priority,
  }));
}

/**
 * Assign an issue to a tranche
 */
export async function assignIssueToTranche(
  issueId: string,
  trancheId: string,
  priority: number = 0
) {
  const prisma = getPrisma();

  return prisma.github_issue_tranches.upsert({
    where: {
      issue_id_tranche_id: {
        issue_id: issueId,
        tranche_id: trancheId,
      },
    },
    update: { priority },
    create: {
      issue_id: issueId,
      tranche_id: trancheId,
      priority,
    },
  });
}

/**
 * Remove an issue from a tranche
 */
export async function removeIssueFromTranche(issueId: string, trancheId: string) {
  const prisma = getPrisma();

  return prisma.github_issue_tranches.delete({
    where: {
      issue_id_tranche_id: {
        issue_id: issueId,
        tranche_id: trancheId,
      },
    },
  });
}

/**
 * Get full roadmap data for a project
 */
export async function getProjectRoadmap(projectSlug: string) {
  const prisma = getPrisma();

  const tranches = await prisma.funding_tranches.findMany({
    where: { project_slug: projectSlug },
    orderBy: { tranche_number: 'asc' },
    include: {
      issue_assignments: {
        include: {
          github_issue: true,
        },
        orderBy: { priority: 'asc' },
      },
    },
  });

  return tranches.map(tranche => ({
    id: tranche.id,
    trancheNumber: tranche.tranche_number,
    name: tranche.name,
    description: tranche.description,
    targetAmountGbp: Number(tranche.target_amount_gbp),
    raisedAmountGbp: Number(tranche.raised_amount_gbp),
    pricePerPercent: Number(tranche.price_per_percent),
    equityOffered: Number(tranche.equity_offered),
    status: tranche.status,
    milestoneSummary: tranche.milestone_summary,
    issues: tranche.issue_assignments.map(a => ({
      id: a.github_issue.id,
      number: a.github_issue.github_issue_id,
      title: a.github_issue.title,
      body: a.github_issue.body,
      state: a.github_issue.state,
      htmlUrl: a.github_issue.html_url,
      authorLogin: a.github_issue.author_login,
      labels: a.github_issue.labels as Array<{ name: string; color: string }>,
      assignees: a.github_issue.assignees as Array<{ login: string; avatar_url: string }>,
      milestone: a.github_issue.milestone,
      priority: a.priority,
    })),
  }));
}

/**
 * Create a new funding tranche
 */
export async function createFundingTranche(data: {
  projectSlug: string;
  trancheNumber: number;
  name: string;
  description?: string;
  targetAmountGbp: number;
  pricePerPercent: number;
  equityOffered: number;
  status?: string;
  milestoneSummary?: string;
  fundraisingRoundId?: string;
}) {
  const prisma = getPrisma();

  return prisma.funding_tranches.create({
    data: {
      project_slug: data.projectSlug,
      tranche_number: data.trancheNumber,
      name: data.name,
      description: data.description,
      target_amount_gbp: data.targetAmountGbp,
      price_per_percent: data.pricePerPercent,
      equity_offered: data.equityOffered,
      status: data.status || 'upcoming',
      milestone_summary: data.milestoneSummary,
      fundraising_round_id: data.fundraisingRoundId,
    },
  });
}

/**
 * Update a funding tranche
 */
export async function updateFundingTranche(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    targetAmountGbp: number;
    raisedAmountGbp: number;
    pricePerPercent: number;
    equityOffered: number;
    status: string;
    milestoneSummary: string;
    fundraisingRoundId: string | null;
  }>
) {
  const prisma = getPrisma();

  return prisma.funding_tranches.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.targetAmountGbp !== undefined && { target_amount_gbp: data.targetAmountGbp }),
      ...(data.raisedAmountGbp !== undefined && { raised_amount_gbp: data.raisedAmountGbp }),
      ...(data.pricePerPercent !== undefined && { price_per_percent: data.pricePerPercent }),
      ...(data.equityOffered !== undefined && { equity_offered: data.equityOffered }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.milestoneSummary !== undefined && { milestone_summary: data.milestoneSummary }),
      ...(data.fundraisingRoundId !== undefined && { fundraising_round_id: data.fundraisingRoundId }),
    },
  });
}

/**
 * Delete a funding tranche
 */
export async function deleteFundingTranche(id: string) {
  const prisma = getPrisma();

  return prisma.funding_tranches.delete({
    where: { id },
  });
}

/**
 * Get all tranches for a project
 */
export async function getProjectTranches(projectSlug: string) {
  const prisma = getPrisma();

  return prisma.funding_tranches.findMany({
    where: { project_slug: projectSlug },
    orderBy: { tranche_number: 'asc' },
  });
}

/**
 * Get single tranche by ID
 */
export async function getTranche(id: string) {
  const prisma = getPrisma();

  return prisma.funding_tranches.findUnique({
    where: { id },
    include: {
      issue_assignments: {
        include: { github_issue: true },
        orderBy: { priority: 'asc' },
      },
    },
  });
}
