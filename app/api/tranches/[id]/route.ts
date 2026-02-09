/**
 * /api/tranches/[id]
 *
 * GET - Get a single tranche with its issues
 * PUT - Update a tranche
 * DELETE - Delete a tranche
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTranche, updateFundingTranche, deleteFundingTranche } from '@/lib/github-issue-sync';

export const dynamic = 'force-dynamic';

const updateTrancheSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  targetAmountGbp: z.number().positive().optional(),
  raisedAmountGbp: z.number().min(0).optional(),
  pricePerPercent: z.number().positive().optional(),
  equityOffered: z.number().positive().max(100).optional(),
  status: z.enum(['upcoming', 'open', 'funded', 'completed']).optional(),
  milestoneSummary: z.string().optional(),
  fundraisingRoundId: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tranche = await getTranche(id);

    if (!tranche) {
      return NextResponse.json(
        { error: 'Tranche not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tranche: {
        id: tranche.id,
        projectSlug: tranche.project_slug,
        trancheNumber: tranche.tranche_number,
        name: tranche.name,
        description: tranche.description,
        targetAmountGbp: Number(tranche.target_amount_gbp),
        raisedAmountGbp: Number(tranche.raised_amount_gbp),
        pricePerPercent: Number(tranche.price_per_percent),
        equityOffered: Number(tranche.equity_offered),
        status: tranche.status,
        milestoneSummary: tranche.milestone_summary,
        fundraisingRoundId: tranche.fundraising_round_id,
        createdAt: tranche.created_at,
        issues: tranche.issue_assignments.map(a => ({
          id: a.github_issue.id,
          number: a.github_issue.github_issue_id,
          title: a.github_issue.title,
          state: a.github_issue.state,
          htmlUrl: a.github_issue.html_url,
          labels: a.github_issue.labels,
          priority: a.priority,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching tranche:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tranche' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateTrancheSchema.parse(body);

    const tranche = await updateFundingTranche(id, validated);

    return NextResponse.json({ tranche });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating tranche:', error);
    return NextResponse.json(
      { error: 'Failed to update tranche' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteFundingTranche(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tranche:', error);
    return NextResponse.json(
      { error: 'Failed to delete tranche' },
      { status: 500 }
    );
  }
}
