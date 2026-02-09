/**
 * /api/tranches/[id]/issues
 *
 * GET - List issues assigned to this tranche
 * POST - Assign an issue to this tranche
 * DELETE - Remove an issue from this tranche
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTrancheIssues, assignIssueToTranche, removeIssueFromTranche } from '@/lib/github-issue-sync';

export const dynamic = 'force-dynamic';

const assignIssueSchema = z.object({
  issueId: z.string().uuid(),
  priority: z.number().int().min(0).optional(),
});

const removeIssueSchema = z.object({
  issueId: z.string().uuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trancheId } = await params;

  try {
    const issues = await getTrancheIssues(trancheId);

    return NextResponse.json({
      trancheId,
      issueCount: issues.length,
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
        priority: issue.priority,
      })),
    });
  } catch (error) {
    console.error('Error fetching tranche issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trancheId } = await params;

  try {
    const body = await request.json();
    const validated = assignIssueSchema.parse(body);

    const assignment = await assignIssueToTranche(
      validated.issueId,
      trancheId,
      validated.priority ?? 0
    );

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error assigning issue to tranche:', error);
    return NextResponse.json(
      { error: 'Failed to assign issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trancheId } = await params;

  try {
    const body = await request.json();
    const validated = removeIssueSchema.parse(body);

    await removeIssueFromTranche(validated.issueId, trancheId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error removing issue from tranche:', error);
    return NextResponse.json(
      { error: 'Failed to remove issue' },
      { status: 500 }
    );
  }
}
