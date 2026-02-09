/**
 * Agent Tasks Cron Endpoint
 *
 * This endpoint is called by Vercel Cron to execute scheduled agent tasks.
 * Runs every minute to check for due tasks.
 *
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAllDueTasks, executeAgentTask } from '@/lib/agent-executor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time

/**
 * GET /api/cron/agent-tasks
 *
 * Execute all due agent tasks. Called by Vercel Cron.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this automatically for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron:AgentTasks] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron:AgentTasks] Starting scheduled task execution');

    const results = await executeAllDueTasks();

    console.log(`[Cron:AgentTasks] Completed: ${results.executed} tasks (${results.succeeded} succeeded, ${results.failed} failed)`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error('[Cron:AgentTasks] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/agent-tasks
 *
 * Manually trigger execution of a specific task.
 * Requires authentication and task ID in body.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or admin authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron:AgentTasks] Unauthorized manual trigger');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    console.log(`[Cron:AgentTasks] Manual execution of task: ${taskId}`);

    const result = await executeAgentTask(taskId);

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      taskId,
      result,
    });
  } catch (error) {
    console.error('[Cron:AgentTasks] Manual execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
