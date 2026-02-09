/**
 * POST /api/pipeline/claim-issue
 *
 * Claim a work item as a developer.
 * Prevents others from claiming the same work.
 *
 * For Kintsugi agent: This is how the agent or developers reserve work.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  claimWorkItem,
  startWorkItem,
  submitForReview,
  releaseWorkItem,
  getDeveloperWorkItems,
} from '@/lib/pipeline-manager';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { authenticatePipelineRequest } from '@/lib/pipeline-auth';

// Kintsugi agent user ID (used when agent authenticates via API key)
const KINTSUGI_AGENT_USER_ID = process.env.KINTSUGI_AGENT_USER_ID || 'kintsugi-agent';

const claimIssueSchema = z.object({
  workItemId: z.string().uuid(),
  estimatedCompletionDate: z.string().datetime().optional(),
});

const startWorkSchema = z.object({
  workItemId: z.string().uuid(),
});

const submitReviewSchema = z.object({
  workItemId: z.string().uuid(),
  prUrl: z.string().url().optional(),
});

const releaseSchema = z.object({
  workItemId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check for API key auth first (Kintsugi agent)
    const pipelineAuth = authenticatePipelineRequest(request);
    let userId: string;

    if (pipelineAuth.authenticated && pipelineAuth.isAgent) {
      // Agent authenticated via API key
      userId = KINTSUGI_AGENT_USER_ID;
    } else {
      // Fall back to user session auth
      const authContext = await getAuthenticatedUser();
      if (!authContext) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      userId = userId;
    }

    const body = await request.json();
    const { action = 'claim', ...data } = body;

    switch (action) {
      case 'claim': {
        const validated = claimIssueSchema.parse(data);
        const workItem = await claimWorkItem({
          workItemId: validated.workItemId,
          developerUserId: userId,
          estimatedCompletionDate: validated.estimatedCompletionDate
            ? new Date(validated.estimatedCompletionDate)
            : undefined,
        });

        return NextResponse.json({
          success: true,
          action: 'claimed',
          workItem,
        });
      }

      case 'start': {
        const validated = startWorkSchema.parse(data);
        const workItem = await startWorkItem(
          validated.workItemId,
          userId
        );

        return NextResponse.json({
          success: true,
          action: 'started',
          workItem,
        });
      }

      case 'submit': {
        const validated = submitReviewSchema.parse(data);
        const workItem = await submitForReview(
          validated.workItemId,
          userId,
          validated.prUrl
        );

        return NextResponse.json({
          success: true,
          action: 'submitted_for_review',
          workItem,
        });
      }

      case 'release': {
        const validated = releaseSchema.parse(data);
        const workItem = await releaseWorkItem(
          validated.workItemId,
          validated.reason
        );

        return NextResponse.json({
          success: true,
          action: 'released',
          workItem,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: claim, start, submit, release` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[pipeline] Claim issue error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process claim',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pipeline/claim-issue
 *
 * Get all work items claimed by the current developer.
 */
export async function GET(request: NextRequest) {
  try {
    // Check for API key auth first (Kintsugi agent)
    const pipelineAuth = authenticatePipelineRequest(request);
    let userId: string;

    if (pipelineAuth.authenticated && pipelineAuth.isAgent) {
      userId = KINTSUGI_AGENT_USER_ID;
    } else {
      const authContext = await getAuthenticatedUser();
      if (!authContext) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      userId = authContext.unifiedUser.id;
    }

    const workItems = await getDeveloperWorkItems(userId);

    return NextResponse.json({
      success: true,
      workItems,
      count: workItems.length,
    });
  } catch (error) {
    console.error('[pipeline] Get developer work items error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get work items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
