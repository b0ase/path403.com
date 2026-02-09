/**
 * POST /api/pipeline/complete-issue
 *
 * Mark a work item as complete and trigger payout.
 * Called by project owner after reviewing the work.
 *
 * Flow:
 * 1. Project owner approves the work
 * 2. Work item marked as complete
 * 3. Payout triggered to developer
 *
 * For Kintsugi agent: This closes the loop on work items.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  completeWorkItem,
  payoutWorkItem,
  getWorkItem,
  getProjectPipelineStats,
} from '@/lib/pipeline-manager';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { getPrisma } from '@/lib/prisma';

const completeIssueSchema = z.object({
  workItemId: z.string().uuid(),
  prUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
  triggerPayout: z.boolean().default(true),
  paymentMethod: z.enum(['stripe', 'paypal', 'crypto']).default('stripe'),
});

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = completeIssueSchema.parse(body);

    // Get the work item to verify ownership
    const workItem = await getWorkItem(data.workItemId);
    if (!workItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      );
    }

    // Verify the user is the project owner
    const prisma = getPrisma();
    const project = await prisma.projects.findFirst({
      where: { slug: workItem.projectSlug },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.owner_user_id !== authContext.unifiedUser.id) {
      return NextResponse.json(
        { error: 'Only the project owner can approve completions' },
        { status: 403 }
      );
    }

    // Mark as complete
    const completed = await completeWorkItem({
      workItemId: data.workItemId,
      developerUserId: workItem.claimedBy || '',
      prUrl: data.prUrl,
      notes: data.notes,
    });

    let payoutResult = null;

    // Trigger payout if requested
    if (data.triggerPayout) {
      payoutResult = await payoutWorkItem(data.workItemId, data.paymentMethod);
    }

    return NextResponse.json({
      success: true,
      workItem: completed,
      payout: payoutResult,
    });
  } catch (error) {
    console.error('[pipeline] Complete issue error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to complete work item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pipeline/complete-issue?projectSlug=...
 *
 * Get pipeline stats for a project.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'projectSlug is required' },
        { status: 400 }
      );
    }

    const stats = await getProjectPipelineStats(projectSlug);

    return NextResponse.json({
      success: true,
      projectSlug,
      stats,
    });
  } catch (error) {
    console.error('[pipeline] Get stats error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get pipeline stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
