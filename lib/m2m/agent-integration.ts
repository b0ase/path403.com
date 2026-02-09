/**
 * Agent-M2M Integration
 *
 * Wraps agent execution with metering and event capture.
 * Every agent action gets:
 * 1. Metered for billing
 * 2. Captured for BSV anchoring
 */

import { meterAgentTask, meterInscription, captureAgentAction } from './index'
import { executeAgentTask as originalExecuteTask, type TaskExecutionResult } from '@/lib/agent-executor'

/**
 * Metered version of executeAgentTask
 *
 * Use this instead of the original to track usage.
 */
export async function executeAgentTaskMetered(
  taskId: string,
  options?: {
    captureEvent?: boolean  // Also capture for BSV anchoring
    skipMeter?: boolean     // Skip metering (for testing)
  }
): Promise<TaskExecutionResult & { meterId?: string }> {
  const { captureEvent = true, skipMeter = false } = options || {}
  const startTime = Date.now()

  // Start meter
  let meterId: string | undefined
  if (!skipMeter) {
    const startMeter = await meterAgentTask(
      taskId.split('-')[0], // Extract agent ID (assuming taskId format)
      taskId,
      'start'
    )
    meterId = startMeter.id
  }

  try {
    // Execute the original task
    const result = await originalExecuteTask(taskId)

    const durationMs = Date.now() - startTime

    // Complete meter
    if (!skipMeter && meterId) {
      await meterAgentTask(
        taskId.split('-')[0],
        taskId,
        'complete',
        {
          success: result.success,
          tokens_used: result.tokens_used,
          duration_ms: durationMs
        }
      )
    }

    // Capture event for BSV anchoring
    if (captureEvent) {
      await captureAgentAction(
        taskId.split('-')[0],
        'task_complete',
        {
          task_id: taskId,
          success: result.success,
          output_length: result.output?.length || 0,
          tokens_used: result.tokens_used,
          error: result.error
        },
        durationMs
      )
    }

    return { ...result, meterId }
  } catch (error) {
    // Still complete the meter on error
    if (!skipMeter) {
      await meterAgentTask(
        taskId.split('-')[0],
        taskId,
        'complete',
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now() - startTime
        }
      )
    }

    throw error
  }
}

/**
 * Meter an inscription action
 *
 * Call this after any BSV inscription to track costs.
 */
export async function meterAgentInscription(
  agentId: string,
  txid: string,
  satoshisCost: number,
  metadata?: Record<string, any>
): Promise<void> {
  await meterInscription(agentId, txid, satoshisCost, {
    ...metadata,
    source: 'agent'
  })

  // Also capture for anchoring
  await captureAgentAction(
    agentId,
    'inscription',
    {
      txid,
      satoshis: satoshisCost,
      ...metadata
    }
  )
}

/**
 * Meter a custom agent action
 */
export async function meterAgentAction(
  agentId: string,
  actionType: 'api_call' | 'compute' | 'storage' | 'transfer',
  actionId: string,
  metadata?: Record<string, any>,
  options?: {
    billableUnits?: number
    satoshisCost?: number
    captureEvent?: boolean
  }
): Promise<string> {
  const { startMeter } = await import('./utxo-meter')

  const meter = await startMeter({
    agentId,
    actionType,
    actionId,
    metadata,
    billableUnits: options?.billableUnits,
    satoshisCost: options?.satoshisCost
  })

  if (options?.captureEvent !== false) {
    await captureAgentAction(agentId, actionType, {
      action_id: actionId,
      ...metadata
    })
  }

  return meter.id
}

/**
 * Get usage stats for dashboard
 */
export async function getAgentDashboardStats(agentId: string): Promise<{
  today: { actions: number; cost: number }
  thisMonth: { actions: number; cost: number }
  lastInvoice?: { amount: number; date: string }
}> {
  const { getAgentUsage } = await import('./utxo-meter')
  const { prisma } = await import('@/lib/prisma')

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayUsage, monthUsage, lastInvoice] = await Promise.all([
    getAgentUsage(agentId, startOfDay, now),
    getAgentUsage(agentId, startOfMonth, now),
    prisma.usage_invoices.findFirst({
      where: { agent_id: agentId },
      orderBy: { created_at: 'desc' }
    })
  ])

  const todayTotals = todayUsage.reduce(
    (acc, u) => ({ actions: acc.actions + u.count, cost: acc.cost + u.totalCostUsd }),
    { actions: 0, cost: 0 }
  )

  const monthTotals = monthUsage.reduce(
    (acc, u) => ({ actions: acc.actions + u.count, cost: acc.cost + u.totalCostUsd }),
    { actions: 0, cost: 0 }
  )

  return {
    today: todayTotals,
    thisMonth: monthTotals,
    lastInvoice: lastInvoice ? {
      amount: Number(lastInvoice.total_amount_usd),
      date: lastInvoice.created_at.toISOString()
    } : undefined
  }
}

/**
 * Hook to call after every agent task execution
 *
 * Add this to the agent executor for automatic metering.
 */
export function createMeteringHook() {
  return {
    onTaskStart: async (agentId: string, taskId: string) => {
      return meterAgentTask(agentId, taskId, 'start')
    },

    onTaskComplete: async (
      agentId: string,
      taskId: string,
      result: TaskExecutionResult
    ) => {
      await meterAgentTask(agentId, taskId, 'complete', {
        success: result.success,
        tokens_used: result.tokens_used,
        duration_ms: result.duration_ms,
        error: result.error
      })

      await captureAgentAction(agentId, 'task_complete', {
        task_id: taskId,
        ...result
      }, result.duration_ms)
    },

    onInscription: async (
      agentId: string,
      txid: string,
      satoshis: number
    ) => {
      await meterAgentInscription(agentId, txid, satoshis)
    }
  }
}
