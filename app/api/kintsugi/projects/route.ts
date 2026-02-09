/**
 * GET /api/kintsugi/projects
 *
 * Lists all portfolio projects that Kintsugi can reference.
 * Returns projects with GitHub repos prioritized.
 */

import { NextResponse } from 'next/server';
import { portfolioData } from '@/lib/data';

interface ProjectSummary {
  slug: string;
  title: string;
  description: string;
  tokenName: string;
  status: string;
  hasGitHub: boolean;
  githubUrl: string | null;
  tech: string[];
}

export async function GET() {
  try {
    // Map portfolio to simplified format
    const projects: ProjectSummary[] = portfolioData.map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      tokenName: p.tokenName,
      status: p.status,
      hasGitHub: p.githubUrl !== '#' && !!p.githubUrl,
      githubUrl: p.githubUrl !== '#' ? p.githubUrl : null,
      tech: p.tech,
    }));

    // Sort: projects with GitHub first, then by title
    projects.sort((a, b) => {
      if (a.hasGitHub && !b.hasGitHub) return -1;
      if (!a.hasGitHub && b.hasGitHub) return 1;
      return a.title.localeCompare(b.title);
    });

    // Summary stats
    const stats = {
      total: projects.length,
      withGitHub: projects.filter(p => p.hasGitHub).length,
      byStatus: {
        active: projects.filter(p => p.status === 'active').length,
        development: projects.filter(p => p.status === 'development').length,
        concept: projects.filter(p => p.status === 'concept').length,
      },
    };

    return NextResponse.json({ projects, stats });
  } catch (error) {
    console.error('Projects list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
