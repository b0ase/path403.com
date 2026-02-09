import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to verify stage ownership
async function verifyStageOwnership(stageId: string, userId: string) {
    const { data } = await supabase
        .from('pipeline_stages')
        .select(`
      id,
      projects!inner(id, user_id)
    `)
        .eq('id', stageId)
        .eq('projects.user_id', userId)
        .single();
    return data;
}

// GET: Fetch all tasks for a stage
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
    try {
        const { stageId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stage = await verifyStageOwnership(stageId, user.id);
        if (!stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        const { data: tasks, error } = await supabase
            .from('stage_tasks')
            .select('*')
            .eq('stage_id', stageId)
            .order('task_order', { ascending: true });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        return NextResponse.json({ tasks: tasks || [] });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new task for a stage
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ stageId: string }> }
) {
    try {
        const { stageId } = await params;
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

        const stage = await verifyStageOwnership(stageId, user.id);
        if (!stage) {
            return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
        }

        const { task_name, task_description, is_required } = body;

        if (!task_name?.trim()) {
            return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
        }

        // Get highest order
        const { data: lastTask } = await supabase
            .from('stage_tasks')
            .select('task_order')
            .eq('stage_id', stageId)
            .order('task_order', { ascending: false })
            .limit(1)
            .single();

        const newOrder = (lastTask?.task_order || 0) + 1;

        const { data: task, error } = await supabase
            .from('stage_tasks')
            .insert({
                stage_id: stageId,
                task_name: task_name.trim(),
                task_description: task_description?.trim() || null,
                task_order: newOrder,
                is_required: is_required ?? true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
        }

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
