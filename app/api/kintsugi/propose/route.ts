/**
 * POST /api/kintsugi/propose
 *
 * Simple proposal capture - no auth required.
 * Stores accepted proposals from Kintsugi conversations for follow-up.
 *
 * Use cases:
 * - User accepts a proposal but isn't logged in
 * - Developer wants to work on a GitHub issue
 * - Investor interested in funding a project
 * - General feedback/interest
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

interface ProposeRequest {
  // Session info
  sessionId: string;
  sessionCode?: string;

  // Contact (at least one required)
  email?: string;
  walletAddress?: string;

  // What type of proposal
  proposalType: 'new_project' | 'developer' | 'investor' | 'feedback';

  // Details
  title: string;
  description?: string;

  // If for existing project
  projectSlug?: string;
  githubIssueNumber?: number;
  githubIssueUrl?: string;

  // Terms discussed (flexible JSON)
  terms?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProposeRequest = await request.json();

    // Validate
    if (!body.sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!body.email && !body.walletAddress) {
      return NextResponse.json({ error: 'email or walletAddress is required' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Create proposal
    const proposal = await prisma.kintsugi_proposals.create({
      data: {
        session_id: body.sessionId,
        session_code: body.sessionCode,
        email: body.email,
        wallet_address: body.walletAddress,
        project_slug: body.projectSlug,
        github_issue_number: body.githubIssueNumber,
        github_issue_url: body.githubIssueUrl,
        proposal_type: body.proposalType || 'new_project',
        title: body.title,
        description: body.description,
        terms: body.terms || {},
        status: 'pending',
      },
    });

    console.log('📝 New Kintsugi proposal:', {
      id: proposal.id,
      type: proposal.proposal_type,
      title: proposal.title,
      email: proposal.email,
      project: proposal.project_slug,
      issue: proposal.github_issue_number,
    });

    // Determine next steps based on type
    let nextSteps = '';
    switch (body.proposalType) {
      case 'developer':
        nextSteps = body.email
          ? `We'll email ${body.email} with the developer agreement within 24 hours.`
          : 'Connect your wallet to sign the developer agreement.';
        break;
      case 'investor':
        nextSteps = body.email
          ? `We'll send investment details to ${body.email}.`
          : 'We\'ll prepare the investment terms for you.';
        break;
      case 'new_project':
        nextSteps = 'We\'ll review your project proposal and get back to you with next steps.';
        break;
      default:
        nextSteps = 'Thanks for your interest! We\'ll be in touch.';
    }

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      message: 'Proposal recorded successfully.',
      nextSteps,
    });
  } catch (error) {
    console.error('Propose error:', error);
    return NextResponse.json(
      { error: 'Failed to record proposal' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kintsugi/propose?sessionId=xxx
 *
 * Check if there are proposals for this session
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  try {
    const prisma = getPrisma();

    const proposals = await prisma.kintsugi_proposals.findMany({
      where: { session_id: sessionId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        proposal_type: true,
        title: true,
        status: true,
        project_slug: true,
        github_issue_number: true,
        created_at: true,
      },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Get proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
