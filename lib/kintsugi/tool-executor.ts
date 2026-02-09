/**
 * Kintsugi Tool Executor
 *
 * Handles execution of tool calls from the Kimi agent.
 * Connects to database, M2M layer, and external services.
 */

import { captureEvent } from '@/lib/m2m'
import OpenAI from 'openai'

export interface ToolExecutionResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface ToolExecutionContext {
  userId?: string
  sessionId: string
  contractId?: string
}

/**
 * Execute a tool call and return the result
 */
export async function executeTool(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { name, arguments: argsString } = toolCall.function

  let args: Record<string, unknown>
  try {
    args = JSON.parse(argsString)
  } catch {
    return { success: false, error: 'Invalid tool arguments' }
  }

  // Capture the tool call for M2M metering
  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'tool_call',
    externalId: toolCall.id,
    payload: { tool: name, args, context },
    metadata: { sessionId: context.sessionId }
  }).catch(console.error)

  // Route to appropriate handler
  switch (name) {
    // Contract Tools
    case 'create_contract':
      return executeCreateContract(args, context)
    case 'get_contract':
      return executeGetContract(args, context)
    case 'sign_contract':
      return executeSignContract(args, context)
    case 'list_contracts':
      return executeListContracts(args, context)

    // Milestone Tools
    case 'submit_milestone':
      return executeSubmitMilestone(args, context)
    case 'approve_milestone':
      return executeApproveMilestone(args, context)
    case 'reject_milestone':
      return executeRejectMilestone(args, context)
    case 'get_milestone_status':
      return executeGetMilestoneStatus(args, context)

    // Payment Tools
    case 'fund_escrow':
      return executeFundEscrow(args, context)
    case 'release_payment':
      return executeReleasePayment(args, context)
    case 'get_escrow_balance':
      return executeGetEscrowBalance(args, context)
    case 'request_refund':
      return executeRequestRefund(args, context)

    // Dispute Tools
    case 'raise_dispute':
      return executeRaiseDispute(args, context)
    case 'respond_to_dispute':
      return executeRespondToDispute(args, context)
    case 'resolve_dispute':
      return executeResolveDispute(args, context)

    // Negotiation Tools
    case 'propose_terms':
      return executeProposeTerms(args, context)
    case 'accept_terms':
      return executeAcceptTerms(args, context)
    case 'counter_terms':
      return executeCounterTerms(args, context)

    // Exchange Matching Tools
    case 'match_exchange_orders':
      return executeMatchExchangeOrders(args, context)
    case 'execute_trade':
      return executeExchangeTrade(args, context)
    case 'get_order_book':
      return executeGetOrderBook(args, context)
    case 'get_exchange_trades':
      return executeGetExchangeTrades(args, context)
    case 'process_match_queue':
      return executeProcessMatchQueue(args, context)

    default:
      return { success: false, error: `Unknown tool: ${name}` }
  }
}

/**
 * Execute multiple tool calls in parallel
 */
export async function executeTools(
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  context: ToolExecutionContext
): Promise<Map<string, ToolExecutionResult>> {
  const results = new Map<string, ToolExecutionResult>()

  await Promise.all(
    toolCalls.map(async (toolCall) => {
      const result = await executeTool(toolCall, context)
      results.set(toolCall.id, result)
    })
  )

  return results
}

// ============================================================================
// Contract Handlers
// ============================================================================

async function executeCreateContract(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  // TODO: Implement with Prisma
  // For now, return mock success
  const contractId = `contract_${Date.now()}`

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'contract_created',
    externalId: contractId,
    payload: args,
    metadata: { sessionId: context.sessionId, createdBy: context.userId }
  })

  return {
    success: true,
    data: {
      contract_id: contractId,
      status: 'draft',
      created_at: new Date().toISOString(),
      ...args
    }
  }
}

async function executeGetContract(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id } = args

  // TODO: Fetch from database
  return {
    success: true,
    data: {
      contract_id,
      status: 'active',
      message: 'Contract details would be fetched from database'
    }
  }
}

async function executeSignContract(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, user_id, role } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'contract_signed',
    externalId: `sig_${Date.now()}`,
    payload: { contract_id, user_id, role },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      signed_by: user_id,
      role,
      signed_at: new Date().toISOString()
    }
  }
}

async function executeListContracts(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { user_id, status, role } = args

  // TODO: Query database
  return {
    success: true,
    data: {
      contracts: [],
      filters: { user_id, status, role },
      message: 'Contracts would be fetched from database'
    }
  }
}

// ============================================================================
// Milestone Handlers
// ============================================================================

async function executeSubmitMilestone(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, milestone_id, deliverables } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'milestone_submitted',
    externalId: `sub_${Date.now()}`,
    payload: { contract_id, milestone_id, deliverables },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      milestone_id,
      status: 'pending_review',
      submitted_at: new Date().toISOString()
    }
  }
}

async function executeApproveMilestone(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, milestone_id, approver_id } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'milestone_approved',
    externalId: `appr_${Date.now()}`,
    payload: { contract_id, milestone_id, approver_id },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      milestone_id,
      status: 'approved',
      approved_by: approver_id,
      approved_at: new Date().toISOString(),
      payment_released: true
    }
  }
}

async function executeRejectMilestone(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, milestone_id, rejector_id, reason } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'milestone_rejected',
    externalId: `rej_${Date.now()}`,
    payload: { contract_id, milestone_id, rejector_id, reason },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      milestone_id,
      status: 'rejected',
      rejected_by: rejector_id,
      reason,
      rejected_at: new Date().toISOString()
    }
  }
}

async function executeGetMilestoneStatus(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id } = args

  // TODO: Fetch from database
  return {
    success: true,
    data: {
      contract_id,
      milestones: [],
      message: 'Milestone status would be fetched from database'
    }
  }
}

// ============================================================================
// Payment Handlers
// ============================================================================

async function executeFundEscrow(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, funder_id, amount_usd, payment_method } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'escrow_funded',
    externalId: `fund_${Date.now()}`,
    payload: { contract_id, funder_id, amount_usd, payment_method },
    metadata: { sessionId: context.sessionId }
  })

  // TODO: Integrate with payment router
  return {
    success: true,
    data: {
      contract_id,
      funded_by: funder_id,
      amount_usd,
      payment_method,
      escrow_balance: amount_usd,
      funded_at: new Date().toISOString()
    }
  }
}

async function executeReleasePayment(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, milestone_id, recipient_id } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'payment_released',
    externalId: `pay_${Date.now()}`,
    payload: { contract_id, milestone_id, recipient_id },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      milestone_id,
      recipient_id,
      status: 'released',
      released_at: new Date().toISOString()
    }
  }
}

async function executeGetEscrowBalance(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id } = args

  // TODO: Fetch from database
  return {
    success: true,
    data: {
      contract_id,
      balance_usd: 0,
      total_funded: 0,
      total_released: 0,
      message: 'Escrow balance would be fetched from database'
    }
  }
}

async function executeRequestRefund(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, requester_id, reason, amount_usd } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'refund_requested',
    externalId: `refund_${Date.now()}`,
    payload: { contract_id, requester_id, reason, amount_usd },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      contract_id,
      refund_request_id: `refund_${Date.now()}`,
      requester_id,
      reason,
      amount_usd,
      status: 'pending_review',
      requested_at: new Date().toISOString()
    }
  }
}

// ============================================================================
// Dispute Handlers
// ============================================================================

async function executeRaiseDispute(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { contract_id, disputer_id, dispute_type, description } = args
  const disputeId = `dispute_${Date.now()}`

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'dispute_raised',
    externalId: disputeId,
    payload: { contract_id, disputer_id, dispute_type, description },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      dispute_id: disputeId,
      contract_id,
      status: 'open',
      raised_by: disputer_id,
      dispute_type,
      raised_at: new Date().toISOString()
    }
  }
}

async function executeRespondToDispute(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { dispute_id, responder_id, response } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'dispute_response',
    externalId: `resp_${Date.now()}`,
    payload: { dispute_id, responder_id, response },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      dispute_id,
      responder_id,
      status: 'response_received',
      responded_at: new Date().toISOString()
    }
  }
}

async function executeResolveDispute(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { dispute_id, resolution_type, outcome } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'dispute_resolved',
    externalId: `resolve_${Date.now()}`,
    payload: { dispute_id, resolution_type, outcome },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      dispute_id,
      status: 'resolved',
      resolution_type,
      outcome,
      resolved_at: new Date().toISOString()
    }
  }
}

// ============================================================================
// Negotiation Handlers
// ============================================================================

async function executeProposeTerms(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { negotiation_id, proposer_id, terms } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'terms_proposed',
    externalId: `prop_${Date.now()}`,
    payload: { negotiation_id, proposer_id, terms },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      negotiation_id,
      proposal_id: `prop_${Date.now()}`,
      proposed_by: proposer_id,
      terms,
      status: 'pending',
      proposed_at: new Date().toISOString()
    }
  }
}

async function executeAcceptTerms(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { negotiation_id, accepter_id } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'terms_accepted',
    externalId: `accept_${Date.now()}`,
    payload: { negotiation_id, accepter_id },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      negotiation_id,
      status: 'accepted',
      accepted_by: accepter_id,
      accepted_at: new Date().toISOString(),
      next_step: 'Contract will be generated'
    }
  }
}

async function executeCounterTerms(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { negotiation_id, proposer_id, counter_terms } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'terms_countered',
    externalId: `counter_${Date.now()}`,
    payload: { negotiation_id, proposer_id, counter_terms },
    metadata: { sessionId: context.sessionId }
  })

  return {
    success: true,
    data: {
      negotiation_id,
      counter_proposal_id: `counter_${Date.now()}`,
      proposed_by: proposer_id,
      counter_terms,
      status: 'counter_proposed',
      proposed_at: new Date().toISOString()
    }
  }
}

// ============================================================================
// Exchange Matching Handlers
// ============================================================================

async function executeMatchExchangeOrders(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { token_id, max_matches = 10 } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'exchange_matching_started',
    externalId: `match_${Date.now()}`,
    payload: { token_id, max_matches },
    metadata: { sessionId: context.sessionId }
  })

  try {
    // Dynamic import to avoid circular dependencies
    const { runMatching } = await import('@/lib/exchange/matching')
    const result = await runMatching(token_id as string, max_matches as number)

    await captureEvent({
      source: 'kintsugi_agent',
      eventType: 'exchange_matching_completed',
      externalId: `match_done_${Date.now()}`,
      payload: {
        token_id,
        matches_found: result.matches.length,
        trades_executed: result.tradesExecuted.length,
        errors: result.errors
      },
      metadata: { sessionId: context.sessionId }
    })

    return {
      success: result.success,
      data: {
        token_id,
        matches_found: result.matches.length,
        trades_executed: result.tradesExecuted.length,
        trades: result.tradesExecuted,
        errors: result.errors
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Matching failed'
    return { success: false, error: message }
  }
}

async function executeExchangeTrade(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { buy_order_id, sell_order_id, amount } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'exchange_trade_requested',
    externalId: `trade_${Date.now()}`,
    payload: { buy_order_id, sell_order_id, amount },
    metadata: { sessionId: context.sessionId }
  })

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { executeMatch } = await import('@/lib/exchange/matching')

    const supabase = await createClient()

    // Fetch both orders
    const { data: buyOrder, error: buyError } = await supabase
      .from('exchange_orders')
      .select('*')
      .eq('id', buy_order_id)
      .single()

    if (buyError || !buyOrder) {
      return { success: false, error: 'Buy order not found' }
    }

    const { data: sellOrder, error: sellError } = await supabase
      .from('exchange_orders')
      .select('*')
      .eq('id', sell_order_id)
      .single()

    if (sellError || !sellOrder) {
      return { success: false, error: 'Sell order not found' }
    }

    // Execute the match
    const result = await executeMatch({
      buyOrder,
      sellOrder,
      matchAmount: amount as number,
      matchPrice: sellOrder.price_sats
    })

    if (result.success) {
      await captureEvent({
        source: 'kintsugi_agent',
        eventType: 'exchange_trade_executed',
        externalId: result.trade?.id || `trade_${Date.now()}`,
        payload: { buy_order_id, sell_order_id, amount },
        metadata: { sessionId: context.sessionId }
      })
    }

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Trade execution failed'
    return { success: false, error: message }
  }
}

async function executeGetOrderBook(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { token_id } = args

  try {
    const { getOrderBook } = await import('@/lib/exchange/matching')
    const orderBook = await getOrderBook(token_id as string)

    return {
      success: true,
      data: orderBook
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get order book'
    return { success: false, error: message }
  }
}

async function executeGetExchangeTrades(
  args: Record<string, unknown>,
  _context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { token_id, limit = 20 } = args

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: trades, error } = await supabase
      .from('exchange_trades')
      .select('*')
      .eq('token_id', token_id)
      .order('executed_at', { ascending: false })
      .limit(limit as number)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        token_id,
        trades,
        count: trades?.length || 0
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get trades'
    return { success: false, error: message }
  }
}

async function executeProcessMatchQueue(
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { token_id } = args

  await captureEvent({
    source: 'kintsugi_agent',
    eventType: 'match_queue_processing',
    externalId: `queue_${Date.now()}`,
    payload: { token_id },
    metadata: { sessionId: context.sessionId }
  })

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { runMatching } = await import('@/lib/exchange/matching')

    const supabase = await createClient()

    // Get pending items from queue
    const { data: queueItems, error } = await supabase
      .from('exchange_match_queue')
      .select('*')
      .eq('token_id', token_id)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) {
      return { success: false, error: error.message }
    }

    if (!queueItems?.length) {
      return {
        success: true,
        data: {
          token_id,
          message: 'No pending items in queue',
          processed: 0
        }
      }
    }

    // Mark items as processing
    await supabase
      .from('exchange_match_queue')
      .update({ status: 'processing', last_attempt_at: new Date().toISOString() })
      .in('id', queueItems.map(q => q.id))

    // Run matching
    const result = await runMatching(token_id as string, 20)

    // Mark items as completed
    await supabase
      .from('exchange_match_queue')
      .update({ status: 'completed' })
      .in('id', queueItems.map(q => q.id))

    return {
      success: true,
      data: {
        token_id,
        queue_items_processed: queueItems.length,
        matches_found: result.matches.length,
        trades_executed: result.tradesExecuted.length
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Queue processing failed'
    return { success: false, error: message }
  }
}
