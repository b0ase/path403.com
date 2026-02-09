/**
 * POST /api/pipeline/create-project
 *
 * Create a new project in the pipeline.
 * Used by founders/investors to initiate a project.
 *
 * For Kintsugi agent: This is how new projects enter the pipeline.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPipelineProject } from '@/lib/pipeline-manager';
import { getAuthenticatedUser } from '@/lib/investors/auth';

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  budget: z.number().positive().optional(),
  targetCompletionDate: z.string().datetime().optional(),
  githubRepoUrl: z.string().url().optional(),
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
    const data = createProjectSchema.parse(body);

    const project = await createPipelineProject({
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      ownerUserId: authContext.unifiedUser.id,
      budget: data.budget,
      targetCompletionDate: data.targetCompletionDate
        ? new Date(data.targetCompletionDate)
        : undefined,
      githubRepoUrl: data.githubRepoUrl,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('[pipeline] Create project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
