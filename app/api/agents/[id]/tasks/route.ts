import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { calculateNextRun, isValidCronExpression } from '@/lib/cron-scheduler';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all tasks for an agent
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: agentId } = await params;

        // Get auth token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this agent
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Fetch tasks
        const { data: tasks, error } = await supabase
            .from('agent_tasks')
            .select('*')
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Error in GET /api/agents/[id]/tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new task for an agent
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: agentId } = await params;
        const body = await request.json();

        // Get auth token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this agent
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Validate required fields
        const { task_name, task_description, task_type, cron_expression, task_config, priority } = body;

        if (!task_name?.trim()) {
            return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
        }

        // Validate and calculate next_run_at from cron expression
        let next_run_at: string | null = null;
        if (cron_expression && task_type === 'cron') {
            if (!isValidCronExpression(cron_expression)) {
                return NextResponse.json({ error: 'Invalid cron expression' }, { status: 400 });
            }
            const nextRun = calculateNextRun(cron_expression);
            next_run_at = nextRun ? nextRun.toISOString() : null;
        }

        // Create task
        const { data: task, error } = await supabase
            .from('agent_tasks')
            .insert({
                agent_id: agentId,
                task_name: task_name.trim(),
                task_description: task_description?.trim() || null,
                task_type: task_type || 'manual',
                cron_expression: cron_expression || null,
                next_run_at,
                task_config: task_config || {},
                priority: priority || 5,
                is_enabled: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
        }

        return NextResponse.json({ task }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/agents/[id]/tasks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
