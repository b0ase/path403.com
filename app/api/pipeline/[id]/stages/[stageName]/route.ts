import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch a single stage with tasks
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageName: string }> }
) {
    try {
        const { id: projectId, stageName } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('id, name, user_id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch stage with tasks
        const { data: stage, error } = await supabase
            .from('pipeline_stages')
            .select(`
        *,
        tasks:stage_tasks(*),
        deliverables:stage_deliverables(*),
        payments:stage_payments(*)
      `)
            .eq('project_id', projectId)
            .eq('stage_name', stageName)
            .single();

        if (error || !stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        return NextResponse.json({ stage, project });
    } catch (error) {
        console.error('Error in GET /api/pipeline/[projectId]/stages/[stageName]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update stage (start, complete, assign agent)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageName: string }> }
) {
    try {
        const { id: projectId, stageName } = await params;
        const body = await request.json();

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Get current stage
        const { data: currentStage } = await supabase
            .from('pipeline_stages')
            .select('*')
            .eq('project_id', projectId)
            .eq('stage_name', stageName)
            .single();

        if (!currentStage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        // Build update object
        const updateData: Record<string, unknown> = {};

        // Handle status change
        if (body.action === 'start') {
            updateData.status = 'in_progress';
            updateData.started_at = new Date().toISOString();
        } else if (body.action === 'complete') {
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
        } else if (body.action === 'block') {
            updateData.status = 'blocked';
        }

        // Allow direct status update
        if (body.status && ['not_started', 'in_progress', 'blocked', 'completed', 'skipped'].includes(body.status)) {
            updateData.status = body.status;
        }

        // Agent assignment
        if (body.agent_id !== undefined) {
            updateData.agent_id = body.agent_id;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
        }

        const { data: stage, error } = await supabase
            .from('pipeline_stages')
            .update(updateData)
            .eq('id', currentStage.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating stage:', error);
            return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 });
        }

        return NextResponse.json({ stage });
    } catch (error) {
        console.error('Error in PATCH /api/pipeline/[projectId]/stages/[stageName]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
