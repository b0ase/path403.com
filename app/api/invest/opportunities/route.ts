/**
 * GET /api/invest/opportunities
 *
 * Returns all projects with funding tranches available for investment.
 * Combines data from funding_tranches, tokenized_repositories, and portfolioData.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { portfolioData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();

    // Get all tranches grouped by project
    let tranches: any[] = [];
    try {
      tranches = await prisma.funding_tranches.findMany({
        orderBy: [
          { project_slug: 'asc' },
          { tranche_number: 'asc' },
        ],
        include: {
          issue_assignments: {
            include: {
              github_issue: true,
            },
          },
        },
      });
    } catch (dbError) {
      // Table may not exist or have data - return empty
      console.error('Error querying funding_tranches:', dbError);
      tranches = [];
    }

    // Group tranches by project
    const projectTranches = tranches.reduce((acc, tranche) => {
      if (!acc[tranche.project_slug]) {
        acc[tranche.project_slug] = [];
      }
      acc[tranche.project_slug].push(tranche);
      return acc;
    }, {} as Record<string, typeof tranches>);

    // Get tokenized repositories for additional data
    let tokenizedRepos: any[] = [];
    try {
      tokenizedRepos = await prisma.tokenized_repositories.findMany({
        where: {
          is_tokenized: true,
        },
      });
    } catch (dbError) {
      console.error('Error querying tokenized_repositories:', dbError);
      tokenizedRepos = [];
    }

    // If no tranches, return empty response early
    if (tranches.length === 0) {
      return NextResponse.json({
        opportunities: [],
        summary: {
          totalProjects: 0,
          openProjects: 0,
          upcomingProjects: 0,
          totalTargetGbp: 0,
          totalRaisedGbp: 0,
        },
      });
    }

    // Build opportunities list
    const opportunities = Object.entries(projectTranches).map(([slug, projectTranches]) => {
      // Find matching portfolio data (static)
      const portfolioProject = portfolioData.projects.find(
        p => p.slug === slug || p.slug === slug.replace(/-/g, '')
      );

      // Find matching tokenized repo
      const tokenizedRepo = tokenizedRepos.find(r =>
        r.github_repo_name?.toLowerCase() === slug.toLowerCase() ||
        r.github_repo_name?.toLowerCase().replace(/-/g, '') === slug.toLowerCase().replace(/-/g, '') ||
        r.token_symbol?.toLowerCase().replace('$', '') === slug.toLowerCase().replace(/-/g, '')
      );

      // Calculate totals
      const totalTarget = projectTranches.reduce((sum, t) => sum + Number(t.target_amount_gbp), 0);
      const totalRaised = projectTranches.reduce((sum, t) => sum + Number(t.raised_amount_gbp), 0);
      const totalEquity = projectTranches.reduce((sum, t) => sum + Number(t.equity_offered), 0);

      // Count issues across all tranches
      const totalIssues = projectTranches.reduce(
        (sum, t) => sum + t.issue_assignments.length,
        0
      );
      const openIssues = projectTranches.reduce(
        (sum, t) => sum + t.issue_assignments.filter(a => a.github_issue.state === 'open').length,
        0
      );

      // Find current open tranche
      const openTranche = projectTranches.find(t => t.status === 'open');
      const currentTranche = openTranche || projectTranches.find(t => t.status === 'upcoming');

      return {
        slug,
        name: portfolioProject?.title || tokenizedRepo?.github_repo_name || slug.replace(/-/g, ' '),
        description: portfolioProject?.description || tokenizedRepo?.github_description || null,
        tokenSymbol: portfolioProject?.tokenName || (tokenizedRepo?.token_symbol ? `$${tokenizedRepo.token_symbol}` : null),
        githubUrl: portfolioProject?.githubUrl || tokenizedRepo?.github_url || null,
        liveUrl: portfolioProject?.liveUrl || null,
        imageUrl: portfolioProject?.imageUrl || null,

        // Funding summary
        totalTargetGbp: totalTarget,
        totalRaisedGbp: totalRaised,
        totalEquityPercent: totalEquity,
        fundingProgress: totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0,

        // Issue progress
        totalIssues,
        openIssues,
        closedIssues: totalIssues - openIssues,
        issueProgress: totalIssues > 0 ? ((totalIssues - openIssues) / totalIssues) * 100 : 0,

        // Tranche info
        trancheCount: projectTranches.length,
        openTrancheCount: projectTranches.filter(t => t.status === 'open').length,
        completedTrancheCount: projectTranches.filter(t => t.status === 'funded' || t.status === 'completed').length,

        // All tranches summary
        tranches: projectTranches.map(t => ({
          id: t.id,
          number: t.tranche_number,
          name: t.name,
          status: t.status,
          targetGbp: Number(t.target_amount_gbp),
          raisedGbp: Number(t.raised_amount_gbp),
          equityOffered: Number(t.equity_offered),
          issueCount: t.issue_assignments.length,
        })),

        // Current investment opportunity
        currentTranche: currentTranche ? {
          id: currentTranche.id,
          number: currentTranche.tranche_number,
          name: currentTranche.name,
          status: currentTranche.status,
          targetGbp: Number(currentTranche.target_amount_gbp),
          raisedGbp: Number(currentTranche.raised_amount_gbp),
          pricePerPercent: Number(currentTranche.price_per_percent),
          equityOffered: Number(currentTranche.equity_offered),
          milestoneSummary: currentTranche.milestone_summary,
          issueCount: currentTranche.issue_assignments.length,
        } : null,

        // Status flags
        isOpen: projectTranches.some(t => t.status === 'open'),
        isUpcoming: !projectTranches.some(t => t.status === 'open') && projectTranches.some(t => t.status === 'upcoming'),
        isFullyFunded: projectTranches.every(t => t.status === 'funded' || t.status === 'completed'),
      };
    });

    // Sort: open first, then upcoming, then funded
    opportunities.sort((a, b) => {
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
      return a.slug.localeCompare(b.slug);
    });

    return NextResponse.json({
      opportunities,
      summary: {
        totalProjects: opportunities.length,
        openProjects: opportunities.filter(o => o.isOpen).length,
        upcomingProjects: opportunities.filter(o => o.isUpcoming).length,
        totalTargetGbp: opportunities.reduce((sum, o) => sum + o.totalTargetGbp, 0),
        totalRaisedGbp: opportunities.reduce((sum, o) => sum + o.totalRaisedGbp, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching investment opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
