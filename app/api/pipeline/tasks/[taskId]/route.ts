import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH: Update a task (mark complete, edit, etc.)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;
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
        const { data: task } = await supabase
            .from('stage_tasks')
            .select(`
        id,
        pipeline_stages!inner(
          id,
          projects!inner(id, user_id)
        )
      `)
            .eq('id', taskId)
            .single();

        if (!task || (task as any).pipeline_stages?.projects?.user_id !== user.id) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Build update object
        const updateData: Record<string, unknown> = {};

        if (body.action === 'complete') {
            updateData.is_completed = true;
            updateData.completed_at = new Date().toISOString();
            updateData.completed_by = user.id;
        } else if (body.action === 'uncomplete') {
            updateData.is_completed = false;
            updateData.completed_at = null;
            updateData.completed_by = null;
        }

        // Allow direct field updates
        if (body.task_name !== undefined) updateData.task_name = body.task_name;
        if (body.task_description !== undefined) updateData.task_description = body.task_description;
        if (body.is_required !== undefined) updateData.is_required = body.is_required;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid updates' }, { status: 400 });
        }

        const { data: updatedTask, error } = await supabase
            .from('stage_tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
        }

        return NextResponse.json({ task: updatedTask });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;

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
        const { data: task } = await supabase
            .from('stage_tasks')
            .select(`
        id,
        pipeline_stages!inner(
          id,
          projects!inner(id, user_id)
        )
      `)
            .eq('id', taskId)
            .single();

        if (!task || (task as any).pipeline_stages?.projects?.user_id !== user.id) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('stage_tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
