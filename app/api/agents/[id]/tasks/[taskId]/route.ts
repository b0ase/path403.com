import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { calculateNextRun, isValidCronExpression } from '@/lib/cron-scheduler';
import { executeAgentTask } from '@/lib/agent-executor';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch a single task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: agentId, taskId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership and fetch task
        const { data: task, error } = await supabase
            .from('agent_tasks')
            .select(`
        *,
        agents!inner(id, user_id)
      `)
            .eq('id', taskId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (error || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Error in GET /api/agents/[id]/tasks/[taskId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update a task
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: agentId, taskId } = await params;
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
        const { data: existingTask } = await supabase
            .from('agent_tasks')
            .select(`
        id,
        agents!inner(id, user_id)
      `)
            .eq('id', taskId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Build update object
        const updateData: Record<string, unknown> = {};
        const allowedFields = [
            'task_name',
            'task_description',
            'task_type',
            'cron_expression',
            'task_config',
            'priority',
            'is_enabled',
            'retry_count',
            'timeout_seconds'
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Update task
        const { data: task, error } = await supabase
            .from('agent_tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
        }

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Error in PATCH /api/agents/[id]/tasks/[taskId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: agentId, taskId } = await params;

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
        const { data: existingTask } = await supabase
            .from('agent_tasks')
            .select(`
        id,
        agents!inner(id, user_id)
      `)
            .eq('id', taskId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Delete task
        const { error } = await supabase
            .from('agent_tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/agents/[id]/tasks/[taskId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Manually execute a task
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: agentId, taskId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership and get task
        const { data: task } = await supabase
            .from('agent_tasks')
            .select(`
                id,
                task_name,
                cron_expression,
                task_type,
                agents!inner(id, user_id, is_active)
            `)
            .eq('id', taskId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        console.log(`[Tasks] Manual execution of task: ${task.task_name} (${taskId})`);

        // Execute the task
        const result = await executeAgentTask(taskId);

        // If it's a cron task, update next_run_at
        if (task.cron_expression && task.task_type === 'cron') {
            const nextRun = calculateNextRun(task.cron_expression);
            if (nextRun) {
                await supabase
                    .from('agent_tasks')
                    .update({ next_run_at: nextRun.toISOString() })
                    .eq('id', taskId);
            }
        }

        return NextResponse.json({
            success: result.success,
            taskId,
            taskName: task.task_name,
            result,
        });
    } catch (error) {
        console.error('Error in POST /api/agents/[id]/tasks/[taskId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
