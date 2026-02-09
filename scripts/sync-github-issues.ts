/**
 * Sync GitHub Issues Script
 *
 * Fetches issues from GitHub repos and assigns them to appropriate tranches.
 * For Bitcoin apps, issues are fetched from bitcoin-apps-suite organization.
 *
 * Run: npx ts-node scripts/sync-github-issues.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GitHub repo mapping for Bitcoin apps
const bitcoinAppRepos: Record<string, { owner: string; repo: string; tokenSymbol: string }> = {
  'bitcoin-email': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-email', tokenSymbol: '$bMail' },
  'bitcoin-os': { owner: 'bitcoin-corp', repo: 'bitcoin-OS', tokenSymbol: '$bOS' },
  'bitcoin-drive': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-drive', tokenSymbol: '$bDrive' },
  'bitcoin-spreadsheets': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-spreadsheet', tokenSymbol: '$bSheets' },
  'bitcoin-writer': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-writer', tokenSymbol: '$bWriter' },
  'bitcoin-music': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-music', tokenSymbol: '$bMusic' },
  'bitcoin-art': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-art', tokenSymbol: '$bArt' },
  'bitcoin-paint': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-paint', tokenSymbol: '$bPaint' },
  'bitcoin-radio': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-radio', tokenSymbol: '$bRadio' },
  'bitcoin-code': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-code', tokenSymbol: '$bCode' },
  'bitcoin-chat': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-chat', tokenSymbol: '$bChat' },
  'bitcoin-education': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-education', tokenSymbol: '$bEdu' },
  'bitcoin-identity': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-identity', tokenSymbol: '$bID' },
  'bitcoin-maps': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-maps', tokenSymbol: '$bMaps' },
  'bitcoin-photos': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-photos', tokenSymbol: '$bPhotos' },
  'bitcoin-jobs': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-jobs', tokenSymbol: '$bJobs' },
  'bitcoin-calendar': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-calendar', tokenSymbol: '$bCalendar' },
  'bitcoin-3d': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-3d', tokenSymbol: '$b3D' },
  'bitcoin-browser': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-browser', tokenSymbol: '$bBrowser' },
  'bitcoin-gaming': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-gaming', tokenSymbol: '$bGaming' },
  'bitcoin-social': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-social', tokenSymbol: '$bSocial' },
  'bitcoin-books': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-books', tokenSymbol: '$bBooks' },
  'bitcoin-marketplace': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-crm', tokenSymbol: '$bCRM' },
  'bitcoin-exchange-app': { owner: 'bitcoin-apps-suite', repo: 'bitcoin-exchange', tokenSymbol: '$bExchange' },
};

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

// Fetch issues from GitHub
async function fetchGitHubIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
  const token = process.env.GITHUB_TOKEN;
  const issues: GitHubIssue[] = [];
  let page = 1;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'b0ase-roadmap-sync',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&page=${page}&per_page=100`;

    try {
      const response = await fetch(url, { headers });

      if (response.status === 404) {
        console.log(`   ⚠️  Repo not found: ${owner}/${repo}`);
        return [];
      }

      if (!response.ok) {
        const error = await response.text();
        console.log(`   ⚠️  API error for ${owner}/${repo}: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.length === 0) break;

      // Filter out pull requests
      const issuesOnly = data.filter((item: any) => !item.pull_request);
      issues.push(...issuesOnly);

      if (data.length < 100) break;
      page++;
    } catch (error) {
      console.log(`   ⚠️  Fetch error for ${owner}/${repo}:`, error);
      return [];
    }
  }

  return issues;
}

// Determine which tranche an issue belongs to based on labels/title
function determineTrancheNumber(issue: GitHubIssue): number {
  const title = issue.title.toLowerCase();
  const labels = issue.labels.map(l => l.name.toLowerCase());

  // Check labels first
  for (const label of labels) {
    if (label.includes('foundation') || label.includes('setup') || label.includes('infrastructure')) return 1;
    if (label.includes('core') || label.includes('mvp') || label.includes('feature')) return 2;
    if (label.includes('ui') || label.includes('ux') || label.includes('design')) return 3;
    if (label.includes('data') || label.includes('database') || label.includes('storage')) return 4;
    if (label.includes('auth') || label.includes('security') || label.includes('permission')) return 5;
    if (label.includes('api') || label.includes('integration')) return 6;
    if (label.includes('blockchain') || label.includes('bsv') || label.includes('token')) return 7;
    if (label.includes('test') || label.includes('bug') || label.includes('fix')) return 8;
    if (label.includes('doc') || label.includes('documentation')) return 9;
    if (label.includes('deploy') || label.includes('launch') || label.includes('production')) return 10;
  }

  // Check title keywords
  if (title.includes('setup') || title.includes('init') || title.includes('scaffold')) return 1;
  if (title.includes('feature') || title.includes('implement') || title.includes('add')) return 2;
  if (title.includes('ui') || title.includes('style') || title.includes('design')) return 3;
  if (title.includes('data') || title.includes('database') || title.includes('persist')) return 4;
  if (title.includes('auth') || title.includes('login') || title.includes('user')) return 5;
  if (title.includes('api') || title.includes('endpoint') || title.includes('integrate')) return 6;
  if (title.includes('blockchain') || title.includes('bsv') || title.includes('wallet')) return 7;
  if (title.includes('test') || title.includes('bug') || title.includes('fix')) return 8;
  if (title.includes('doc') || title.includes('readme') || title.includes('guide')) return 9;
  if (title.includes('deploy') || title.includes('release') || title.includes('publish')) return 10;

  // Default to tranche 2 (core features) for unclassified issues
  return 2;
}

// Ensure a tokenized_repositories record exists for this repo
async function ensureTokenizedRepo(projectSlug: string, owner: string, repo: string, tokenSymbol: string): Promise<string> {
  // Generate a numeric ID from the repo name (hash-like)
  const githubRepoId = BigInt(Math.abs(hashCode(`${owner}/${repo}`)));

  // Check if already exists
  let tokenizedRepo = await prisma.tokenized_repositories.findFirst({
    where: { github_repo_id: githubRepoId },
  });

  if (!tokenizedRepo) {
    // Get or create a system user for unclaimed repos
    let systemUser = await prisma.unified_users.findFirst({
      where: { display_name: 'System' },
    });

    if (!systemUser) {
      systemUser = await prisma.unified_users.create({
        data: {
          display_name: 'System',
          primary_email: 'system@b0ase.com',
        },
      });
    }

    // Create the tokenized repo entry
    tokenizedRepo = await prisma.tokenized_repositories.create({
      data: {
        unified_user_id: systemUser.id,
        github_repo_id: githubRepoId,
        github_owner: owner,
        github_repo_name: repo,
        github_full_name: `${owner}/${repo}`,
        github_url: `https://github.com/${owner}/${repo}`,
        token_symbol: tokenSymbol.replace('$', ''),
        token_supply: BigInt(21000000),
        is_claimed: true,
        is_tokenized: true,
      },
    });
    console.log(`   📝 Created tokenized_repositories entry for ${owner}/${repo}`);
  }

  return tokenizedRepo.id;
}

// Simple hash function for generating numeric IDs
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

async function syncProjectIssues(projectSlug: string, owner: string, repo: string, tokenSymbol: string) {
  console.log(`\n📦 Syncing ${projectSlug} (${owner}/${repo})...`);

  // Get tranches for this project
  const tranches = await prisma.funding_tranches.findMany({
    where: { project_slug: projectSlug },
    orderBy: { tranche_number: 'asc' },
  });

  if (tranches.length === 0) {
    console.log(`   ⚠️  No tranches found for ${projectSlug}`);
    return { synced: 0, assigned: 0 };
  }

  // Create a map of tranche number to tranche ID
  const trancheMap = new Map(tranches.map(t => [t.tranche_number, t.id]));

  // Fetch issues from GitHub
  const issues = await fetchGitHubIssues(owner, repo);
  console.log(`   Found ${issues.length} issues`);

  if (issues.length === 0) return { synced: 0, assigned: 0 };

  let synced = 0;
  let assigned = 0;

  // Ensure tokenized_repositories entry exists and get its ID
  const repoId = await ensureTokenizedRepo(projectSlug, owner, repo, tokenSymbol);

  for (const issue of issues) {
    try {
      // Check if issue already exists
      let dbIssue = await prisma.github_issues.findFirst({
        where: {
          repo_id: repoId,
          github_issue_id: issue.number,
        },
      });

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

      if (dbIssue) {
        await prisma.github_issues.update({
          where: { id: dbIssue.id },
          data: issueData,
        });
      } else {
        dbIssue = await prisma.github_issues.create({
          data: issueData,
        });
      }
      synced++;

      // Determine which tranche this issue belongs to
      const trancheNumber = determineTrancheNumber(issue);
      const trancheId = trancheMap.get(trancheNumber);

      if (trancheId) {
        // Check if assignment already exists
        const existingAssignment = await prisma.github_issue_tranches.findUnique({
          where: {
            issue_id_tranche_id: {
              issue_id: dbIssue.id,
              tranche_id: trancheId,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.github_issue_tranches.create({
            data: {
              issue_id: dbIssue.id,
              tranche_id: trancheId,
              priority: issue.state === 'open' ? 0 : 100, // Open issues first
            },
          });
          assigned++;
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error processing issue #${issue.number}:`, error);
    }
  }

  console.log(`   ✅ Synced: ${synced}, Assigned to tranches: ${assigned}`);
  return { synced, assigned };
}

async function main() {
  console.log('🔄 Starting GitHub Issues Sync...');
  console.log('================================\n');

  let totalSynced = 0;
  let totalAssigned = 0;

  for (const [projectSlug, { owner, repo, tokenSymbol }] of Object.entries(bitcoinAppRepos)) {
    const result = await syncProjectIssues(projectSlug, owner, repo, tokenSymbol);
    totalSynced += result.synced;
    totalAssigned += result.assigned;

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n================================');
  console.log(`✨ Sync Complete!`);
  console.log(`   Total issues synced: ${totalSynced}`);
  console.log(`   Total tranche assignments: ${totalAssigned}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
