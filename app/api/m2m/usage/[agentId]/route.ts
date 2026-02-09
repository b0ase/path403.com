/**
 * GET /api/m2m/usage/:agentId
 *
 * Get usage stats for an agent.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAgentUsage, calculatePeriodCost, generateInvoice } from '@/lib/m2m'

interface RouteParams {
  params: Promise<{
    agentId: string
  }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { agentId } = await context.params

    // Parse date range from query params
    const startParam = request.nextUrl.searchParams.get('start')
    const endParam = request.nextUrl.searchParams.get('end')

    const startDate = startParam ? new Date(startParam) : undefined
    const endDate = endParam ? new Date(endParam) : undefined

    const usage = await getAgentUsage(agentId, startDate, endDate)

    // Calculate totals
    const totals = usage.reduce(
      (acc, item) => ({
        totalActions: acc.totalActions + item.count,
        totalUnits: acc.totalUnits + item.totalUnits,
        totalCostUsd: acc.totalCostUsd + item.totalCostUsd,
        totalSatoshis: acc.totalSatoshis + item.totalSatoshis
      }),
      { totalActions: 0, totalUnits: 0, totalCostUsd: 0, totalSatoshis: 0 }
    )

    return NextResponse.json({
      success: true,
      agent_id: agentId,
      period: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString()
      },
      totals: {
        actions: totals.totalActions,
        units: totals.totalUnits,
        cost_usd: totals.totalCostUsd.toFixed(4),
        satoshis: totals.totalSatoshis
      },
      breakdown: usage.map(u => ({
        action_type: u.actionType,
        count: u.count,
        units: u.totalUnits,
        cost_usd: u.totalCostUsd.toFixed(4)
      }))
    })
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get usage' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/m2m/usage/:agentId
 *
 * Generate invoice for an agent's usage.
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { agentId } = await context.params
    const body = await request.json()

    const startDate = new Date(body.start_date || new Date().setDate(1))
    const endDate = new Date(body.end_date || new Date())

    const invoice = await generateInvoice(agentId, startDate, endDate)

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.invoiceId,
        agent_id: agentId,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        total_cost_usd: invoice.totalCostUsd.toFixed(2),
        meter_count: invoice.meterCount
      }
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
