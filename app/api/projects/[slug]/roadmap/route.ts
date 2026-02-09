/**
 * GET /api/projects/[slug]/roadmap
 *
 * Returns the full project roadmap with funding tranches and assigned GitHub issues.
 * Public endpoint for displaying project investment roadmaps.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjectRoadmap } from '@/lib/github-issue-sync';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const tranches = await getProjectRoadmap(slug);

    // Calculate aggregate stats
    const totalTarget = tranches.reduce((sum, t) => sum + t.targetAmountGbp, 0);
    const totalRaised = tranches.reduce((sum, t) => sum + t.raisedAmountGbp, 0);
    const totalEquity = tranches.reduce((sum, t) => sum + t.equityOffered, 0);
    const totalIssues = tranches.reduce((sum, t) => sum + t.issues.length, 0);
    const openIssues = tranches.reduce(
      (sum, t) => sum + t.issues.filter(i => i.state === 'open').length,
      0
    );
    const closedIssues = totalIssues - openIssues;

    return NextResponse.json({
      projectSlug: slug,
      summary: {
        totalTranches: tranches.length,
        totalTargetGbp: totalTarget,
        totalRaisedGbp: totalRaised,
        totalEquityPercent: totalEquity,
        fundingProgress: totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0,
        totalIssues,
        openIssues,
        closedIssues,
        issueCompletion: totalIssues > 0 ? (closedIssues / totalIssues) * 100 : 0,
      },
      tranches,
    });
  } catch (error) {
    console.error('Error fetching project roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}
