/**
 * UTXO Metering Service
 *
 * Tracks every billable action as a meter entry.
 * Each agent action, API call, inscription, etc. gets metered.
 * Enables precise cost attribution and usage-based billing.
 */

import { getPrisma } from '@/lib/prisma'

// Get prisma instance - lazy loaded
const prisma = () => getPrisma()

export type MeterAction =
  | 'task_start'
  | 'task_complete'
  | 'api_call'
  | 'inscription'
  | 'payment'
  | 'transfer'
  | 'compute'
  | 'storage'

export interface MeterInput {
  agentId?: string
  userId?: string
  projectId?: string
  actionType: MeterAction
  actionId?: string
  metadata?: Record<string, any>
  satoshisCost?: number
  billableUnits?: number
}

export interface MeterEntry {
  id: string
  agentId?: string
  userId?: string
  projectId?: string
  actionType: MeterAction
  actionId?: string
  metadata?: Record<string, any>
  satoshisCost: number
  billableUnits: number
  unitPriceUsd?: number
  totalCostUsd?: number
  billed: boolean
  startedAt: Date
  completedAt?: Date
  durationMs?: number
}

export interface UsageSummary {
  actionType: MeterAction
  count: number
  totalUnits: number
  totalCostUsd: number
  totalSatoshis: number
}

// Pricing per action type (USD)
const ACTION_PRICES: Record<MeterAction, number> = {
  task_start: 0.001,
  task_complete: 0.001,
  api_call: 0.0001,
  inscription: 0.01,
  payment: 0.001,
  transfer: 0.001,
  compute: 0.0001,
  storage: 0.0001
}

/**
 * Start metering an action
 */
export async function startMeter(input: MeterInput): Promise<MeterEntry> {
  const unitPrice = ACTION_PRICES[input.actionType] || 0.001
  const billableUnits = input.billableUnits || 1
  const totalCost = unitPrice * billableUnits

  const meter = await prisma().utxo_meters.create({
    data: {
      agent_id: input.agentId,
      user_id: input.userId,
      project_id: input.projectId,
      action_type: input.actionType,
      action_id: input.actionId,
      action_metadata: input.metadata || {},
      satoshis_cost: input.satoshisCost || 0,
      billable_units: billableUnits,
      unit_price_usd: unitPrice,
      total_cost_usd: totalCost,
      started_at: new Date()
    }
  })

  return mapToMeter(meter)
}

/**
 * Complete a metered action
 */
export async function completeMeter(
  meterId: string,
  metadata?: Record<string, any>
): Promise<MeterEntry> {
  const existing = await prisma().utxo_meters.findUnique({
    where: { id: meterId }
  })

  if (!existing) {
    throw new Error(`Meter not found: ${meterId}`)
  }

  const startedAt = new Date(existing.started_at)
  const completedAt = new Date()
  const durationMs = completedAt.getTime() - startedAt.getTime()

  const updated = await prisma().utxo_meters.update({
    where: { id: meterId },
    data: {
      completed_at: completedAt,
      duration_ms: durationMs,
      action_metadata: metadata
        ? { ...(existing.action_metadata as object), ...metadata }
        : existing.action_metadata
    }
  })

  return mapToMeter(updated)
}

/**
 * Quick meter - start and complete in one call
 */
export async function meter(input: MeterInput & { durationMs?: number }): Promise<MeterEntry> {
  const unitPrice = ACTION_PRICES[input.actionType] || 0.001
  const billableUnits = input.billableUnits || 1
  const totalCost = unitPrice * billableUnits

  const now = new Date()
  const startedAt = input.durationMs
    ? new Date(now.getTime() - input.durationMs)
    : now

  const meter = await prisma().utxo_meters.create({
    data: {
      agent_id: input.agentId,
      user_id: input.userId,
      project_id: input.projectId,
      action_type: input.actionType,
      action_id: input.actionId,
      action_metadata: input.metadata || {},
      satoshis_cost: input.satoshisCost || 0,
      billable_units: billableUnits,
      unit_price_usd: unitPrice,
      total_cost_usd: totalCost,
      started_at: startedAt,
      completed_at: now,
      duration_ms: input.durationMs || 0
    }
  })

  return mapToMeter(meter)
}

/**
 * Get usage summary for an agent
 */
export async function getAgentUsage(
  agentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<UsageSummary[]> {
  const where: any = {
    agent_id: agentId,
    billed: false
  }

  if (startDate) {
    where.started_at = { gte: startDate }
  }
  if (endDate) {
    where.started_at = { ...where.started_at, lte: endDate }
  }

  const results = await prisma().utxo_meters.groupBy({
    by: ['action_type'],
    where,
    _count: { id: true },
    _sum: {
      billable_units: true,
      total_cost_usd: true,
      satoshis_cost: true
    }
  })

  return results.map(r => ({
    actionType: r.action_type as MeterAction,
    count: r._count.id,
    totalUnits: Number(r._sum.billable_units) || 0,
    totalCostUsd: Number(r._sum.total_cost_usd) || 0,
    totalSatoshis: Number(r._sum.satoshis_cost) || 0
  }))
}

/**
 * Get unbilled meters for an agent
 */
export async function getUnbilledMeters(
  agentId: string,
  limit: number = 1000
): Promise<MeterEntry[]> {
  const meters = await prisma().utxo_meters.findMany({
    where: {
      agent_id: agentId,
      billed: false
    },
    orderBy: { started_at: 'asc' },
    take: limit
  })

  return meters.map(mapToMeter)
}

/**
 * Mark meters as billed
 */
export async function markBilled(
  meterIds: string[],
  invoiceId: string
): Promise<void> {
  await prisma().utxo_meters.updateMany({
    where: { id: { in: meterIds } },
    data: {
      billed: true,
      invoice_id: invoiceId,
      billed_at: new Date()
    }
  })
}

/**
 * Calculate total cost for a period
 */
export async function calculatePeriodCost(
  agentId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number
  totalUnits: number
  totalCostUsd: number
  breakdown: UsageSummary[]
}> {
  const breakdown = await getAgentUsage(agentId, startDate, endDate)

  const totals = breakdown.reduce(
    (acc, item) => ({
      totalActions: acc.totalActions + item.count,
      totalUnits: acc.totalUnits + item.totalUnits,
      totalCostUsd: acc.totalCostUsd + item.totalCostUsd
    }),
    { totalActions: 0, totalUnits: 0, totalCostUsd: 0 }
  )

  return {
    ...totals,
    breakdown
  }
}

/**
 * Generate invoice for a period
 */
export async function generateInvoice(
  agentId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  invoiceId: string
  totalCostUsd: number
  meterCount: number
}> {
  // Calculate cost
  const cost = await calculatePeriodCost(agentId, startDate, endDate)

  // Create invoice
  const invoice = await prisma().usage_invoices.create({
    data: {
      agent_id: agentId,
      period_start: startDate,
      period_end: endDate,
      total_actions: cost.totalActions,
      total_units: cost.totalUnits,
      total_amount_usd: cost.totalCostUsd,
      breakdown: cost.breakdown as any,
      status: 'draft'
    }
  })

  // Get unbilled meters
  const meters = await prisma().utxo_meters.findMany({
    where: {
      agent_id: agentId,
      started_at: { gte: startDate, lte: endDate },
      billed: false
    },
    select: { id: true }
  })

  // Mark as billed
  if (meters.length > 0) {
    await markBilled(meters.map(m => m.id), invoice.id)
  }

  return {
    invoiceId: invoice.id,
    totalCostUsd: cost.totalCostUsd,
    meterCount: meters.length
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Meter an agent task
 */
export async function meterAgentTask(
  agentId: string,
  taskId: string,
  type: 'start' | 'complete',
  metadata?: Record<string, any>
): Promise<MeterEntry> {
  return meter({
    agentId,
    actionType: type === 'start' ? 'task_start' : 'task_complete',
    actionId: taskId,
    metadata
  })
}

/**
 * Meter an API call
 */
export async function meterApiCall(
  userId: string,
  endpoint: string,
  durationMs: number,
  metadata?: Record<string, any>
): Promise<MeterEntry> {
  return meter({
    userId,
    actionType: 'api_call',
    actionId: endpoint,
    durationMs,
    metadata
  })
}

/**
 * Meter an inscription
 */
export async function meterInscription(
  agentId: string | undefined,
  txid: string,
  satoshisCost: number,
  metadata?: Record<string, any>
): Promise<MeterEntry> {
  return meter({
    agentId,
    actionType: 'inscription',
    actionId: txid,
    satoshisCost,
    metadata
  })
}

/**
 * Meter a payment
 */
export async function meterPayment(
  userId: string,
  paymentId: string,
  amountUsd: number,
  metadata?: Record<string, any>
): Promise<MeterEntry> {
  return meter({
    userId,
    actionType: 'payment',
    actionId: paymentId,
    billableUnits: amountUsd,  // Bill based on payment amount
    metadata
  })
}

// ============================================
// Helpers
// ============================================

function mapToMeter(row: any): MeterEntry {
  return {
    id: row.id,
    agentId: row.agent_id,
    userId: row.user_id,
    projectId: row.project_id,
    actionType: row.action_type,
    actionId: row.action_id,
    metadata: row.action_metadata,
    satoshisCost: Number(row.satoshis_cost) || 0,
    billableUnits: Number(row.billable_units) || 0,
    unitPriceUsd: row.unit_price_usd ? Number(row.unit_price_usd) : undefined,
    totalCostUsd: row.total_cost_usd ? Number(row.total_cost_usd) : undefined,
    billed: row.billed,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationMs: row.duration_ms
  }
}
