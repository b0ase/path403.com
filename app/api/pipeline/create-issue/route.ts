/**
 * POST /api/pipeline/create-issue
 *
 * Create a work item (issue) in the pipeline.
 * Links work to a funding tranche with a bounty amount.
 *
 * For Kintsugi agent: This is how work gets broken down into claimable items.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createWorkItem, listOpenWorkItems } from '@/lib/pipeline-manager';
import { getAuthenticatedUser } from '@/lib/investors/auth';

const createIssueSchema = z.object({
  projectSlug: z.string().min(1),
  trancheId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  estimatedHours: z.number().positive().optional(),
  bountyAmountGbp: z.number().positive(),
  priority: z.number().int().min(0).max(100).optional(),
  labels: z.array(z.string()).optional(),
  githubIssueId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createIssueSchema.parse(body);

    const workItem = await createWorkItem({
      projectSlug: data.projectSlug,
      trancheId: data.trancheId,
      title: data.title,
      description: data.description,
      estimatedHours: data.estimatedHours,
      bountyAmountGbp: data.bountyAmountGbp,
      priority: data.priority,
      labels: data.labels,
      githubIssueId: data.githubIssueId,
    });

    return NextResponse.json({
      success: true,
      workItem,
    });
  } catch (error) {
    console.error('[pipeline] Create issue error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create work item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pipeline/create-issue
 *
 * List open work items (available for claiming).
 * For developers/agents to find work.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      projectSlug: searchParams.get('projectSlug') || undefined,
      trancheId: searchParams.get('trancheId') || undefined,
      minBounty: searchParams.get('minBounty')
        ? Number(searchParams.get('minBounty'))
        : undefined,
      maxBounty: searchParams.get('maxBounty')
        ? Number(searchParams.get('maxBounty'))
        : undefined,
    };

    const workItems = await listOpenWorkItems(filters);

    return NextResponse.json({
      success: true,
      workItems,
      count: workItems.length,
    });
  } catch (error) {
    console.error('[pipeline] List issues error:', error);

    return NextResponse.json(
      {
        error: 'Failed to list work items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
