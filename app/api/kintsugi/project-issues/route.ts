/**
 * GET /api/kintsugi/project-issues
 *
 * Fetches GitHub issues for a portfolio project.
 * Used by Kintsugi chat to show real work items.
 *
 * Query params:
 *   - slug: Project slug (e.g., "bitcoin-email")
 *   - state: "open" | "closed" | "all" (default: "open")
 *   - limit: Max issues to return (default: 10)
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioData } from '@/lib/data';
import { fetchGitHubIssues } from '@/lib/github-issue-sync';

interface SimplifiedIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  url: string;
  labels: string[];
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const state = searchParams.get('state') || 'open';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    // Find project in portfolio
    const project = portfolioData.find(p => p.slug === slug);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if project has a valid GitHub URL
    const githubUrl = project.githubUrl;
    if (!githubUrl || githubUrl === '#') {
      return NextResponse.json({
        project: {
          title: project.title,
          slug: project.slug,
          description: project.description,
        },
        issues: [],
        message: 'This project does not have a linked GitHub repository yet.',
      });
    }

    // Parse GitHub URL to get owner/repo
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({
        project: {
          title: project.title,
          slug: project.slug,
          description: project.description,
        },
        issues: [],
        message: 'Invalid GitHub URL format.',
      });
    }

    const [, owner, repo] = match;

    // Fetch issues from GitHub
    // Use GITHUB_TOKEN for higher rate limits if available
    const token = process.env.GITHUB_TOKEN || null;

    try {
      const allIssues = await fetchGitHubIssues(owner, repo, token);

      // Filter by state
      let filtered = allIssues;
      if (state !== 'all') {
        filtered = allIssues.filter(i => i.state === state);
      }

      // Limit results
      const limited = filtered.slice(0, limit);

      // Simplify for chat context
      const issues: SimplifiedIssue[] = limited.map(i => ({
        number: i.number,
        title: i.title,
        body: i.body ? i.body.slice(0, 500) + (i.body.length > 500 ? '...' : '') : null,
        state: i.state,
        url: i.html_url,
        labels: i.labels.map(l => l.name),
        createdAt: i.created_at,
      }));

      return NextResponse.json({
        project: {
          title: project.title,
          slug: project.slug,
          description: project.description,
          tokenName: project.tokenName,
          githubUrl: project.githubUrl,
        },
        issues,
        totalOpen: allIssues.filter(i => i.state === 'open').length,
        totalClosed: allIssues.filter(i => i.state === 'closed').length,
      });
    } catch (githubError) {
      // GitHub API might fail (rate limit, private repo, etc.)
      console.error('GitHub API error:', githubError);
      return NextResponse.json({
        project: {
          title: project.title,
          slug: project.slug,
          description: project.description,
        },
        issues: [],
        message: 'Could not fetch GitHub issues. The repository may be private or unavailable.',
      });
    }
  } catch (error) {
    console.error('Project issues error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project issues' },
      { status: 500 }
    );
  }
}
