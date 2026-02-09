/**
 * GET /api/v1/projects - List user's projects
 * POST /api/v1/projects - Create new project
 *
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireAuthAndValidate } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

// Request validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived', 'draft']).default('draft'),
});

type CreateProjectRequest = z.infer<typeof createProjectSchema>;

/**
 * GET /api/v1/projects
 * List all projects for the authenticated user
 */
export const GET = requireAuth(async (req, user) => {
  if (!user?.id) {
    return NextResponse.json(
      { error: 'User ID not found' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Fetch projects for this user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: projects || [],
      count: (projects || []).length,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/projects
 * Create a new project
 */
export const POST = requireAuthAndValidate(
  createProjectSchema,
  async (req, user, body: CreateProjectRequest) => {
    if (!user?.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    try {
      const supabase = await createClient();

      // Create new project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: body.name,
          description: body.description || null,
          status: body.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to create project' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { data: project },
        { status: 201 }
      );
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
);
