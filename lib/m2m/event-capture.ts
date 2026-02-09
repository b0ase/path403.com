/**
 * Event Capture Service
 *
 * The CAPTURE layer of: capture → normalise → commit → prove → settle
 *
 * Captures events from any source (Stripe, PayPal, ETH, SOL, webhooks, agents)
 * and queues them for normalisation and BSV commitment.
 */

import { getPrisma } from '@/lib/prisma'

// Get prisma instance - lazy loaded
const prisma = () => getPrisma()
import { createHash } from 'crypto'

export type EventSource =
  | 'stripe'
  | 'paypal'
  | 'eth'
  | 'sol'
  | 'bsv'
  | 'handcash'
  | 'webhook'
  | 'agent'
  | 'api'

export type EventStatus =
  | 'captured'
  | 'normalised'
  | 'queued'
  | 'batched'
  | 'committed'
  | 'failed'

export interface CaptureEventInput {
  source: EventSource
  sourceId: string  // External ID (payment_intent, tx_hash, etc.)
  eventType: string  // payment.completed, tx.confirmed, etc.
  payload: Record<string, any>
  timestamp?: Date
}

export interface NormalisedEvent {
  // Standard fields across all event types
  source: EventSource
  sourceId: string
  eventType: string
  amount?: number
  currency?: string
  sender?: string
  recipient?: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface CapturedEvent {
  id: string
  source: EventSource
  sourceId: string
  eventType: string
  rawPayload: Record<string, any>
  normalisedPayload?: NormalisedEvent
  contentHash?: string
  status: EventStatus
  batchId?: string
  commitTxid?: string
  capturedAt: Date
}

/**
 * Capture an external event for later commitment to BSV
 */
export async function captureEvent(input: CaptureEventInput): Promise<CapturedEvent> {
  const { source, sourceId, eventType, payload, timestamp } = input

  // Check for duplicate
  const existing = await prisma().captured_events.findUnique({
    where: {
      source_source_id: { source, source_id: sourceId }
    }
  })

  if (existing) {
    return mapToEvent(existing)
  }

  // Insert new event
  const event = await prisma().captured_events.create({
    data: {
      source,
      source_id: sourceId,
      event_type: eventType,
      raw_payload: payload,
      event_timestamp: timestamp || new Date(),
      status: 'captured'
    }
  })

  return mapToEvent(event)
}

/**
 * Normalise a captured event based on its source
 */
export async function normaliseEvent(eventId: string): Promise<CapturedEvent> {
  const event = await prisma().captured_events.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error(`Event not found: ${eventId}`)
  }

  const rawPayload = event.raw_payload as Record<string, any>
  let normalised: NormalisedEvent

  // Normalise based on source
  switch (event.source) {
    case 'stripe':
      normalised = normaliseStripeEvent(event.source_id, event.event_type, rawPayload)
      break
    case 'paypal':
      normalised = normalisePayPalEvent(event.source_id, event.event_type, rawPayload)
      break
    case 'eth':
      normalised = normaliseEthEvent(event.source_id, event.event_type, rawPayload)
      break
    case 'sol':
      normalised = normaliseSolEvent(event.source_id, event.event_type, rawPayload)
      break
    case 'agent':
      normalised = normaliseAgentEvent(event.source_id, event.event_type, rawPayload)
      break
    default:
      normalised = normaliseGenericEvent(event.source, event.source_id, event.event_type, rawPayload)
  }

  // Hash the normalised payload for merkle tree
  const contentHash = hashPayload(normalised)

  // Update event
  const updated = await prisma().captured_events.update({
    where: { id: eventId },
    data: {
      normalised_payload: normalised as any,
      content_hash: contentHash,
      status: 'normalised',
      normalised_at: new Date()
    }
  })

  return mapToEvent(updated)
}

/**
 * Get events ready for batching
 */
export async function getPendingEvents(limit: number = 1000): Promise<CapturedEvent[]> {
  const events = await prisma().captured_events.findMany({
    where: {
      status: 'normalised',
      batch_id: null
    },
    orderBy: { captured_at: 'asc' },
    take: limit
  })

  return events.map(mapToEvent)
}

/**
 * Mark events as batched
 */
export async function markEventsBatched(eventIds: string[], batchId: string): Promise<void> {
  await prisma().captured_events.updateMany({
    where: { id: { in: eventIds } },
    data: {
      batch_id: batchId,
      status: 'batched'
    }
  })
}

/**
 * Mark events as committed (after BSV inscription)
 */
export async function markEventsCommitted(
  batchId: string,
  txid: string
): Promise<void> {
  await prisma().captured_events.updateMany({
    where: { batch_id: batchId },
    data: {
      commit_txid: txid,
      status: 'committed',
      committed_at: new Date()
    }
  })
}

// ============================================
// Normalisation Functions
// ============================================

function normaliseStripeEvent(
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  return {
    source: 'stripe',
    sourceId,
    eventType,
    amount: payload.amount ? payload.amount / 100 : undefined,  // Stripe uses cents
    currency: payload.currency?.toUpperCase(),
    sender: payload.customer || payload.customer_email,
    recipient: payload.metadata?.recipient || 'b0ase',
    metadata: {
      payment_intent: payload.id || payload.payment_intent,
      status: payload.status,
      description: payload.description
    },
    timestamp: new Date(payload.created ? payload.created * 1000 : Date.now())
  }
}

function normalisePayPalEvent(
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  const resource = payload.resource || payload
  return {
    source: 'paypal',
    sourceId,
    eventType,
    amount: parseFloat(resource.amount?.value || resource.gross_amount?.value || '0'),
    currency: resource.amount?.currency_code || resource.gross_amount?.currency_code,
    sender: resource.payer?.email_address,
    recipient: resource.payee?.email_address || 'b0ase',
    metadata: {
      order_id: resource.id,
      status: resource.status
    },
    timestamp: new Date(resource.create_time || resource.update_time || Date.now())
  }
}

function normaliseEthEvent(
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  return {
    source: 'eth',
    sourceId,
    eventType,
    amount: payload.value ? parseFloat(payload.value) / 1e18 : undefined,  // Wei to ETH
    currency: payload.tokenSymbol || 'ETH',
    sender: payload.from,
    recipient: payload.to,
    metadata: {
      tx_hash: payload.hash || sourceId,
      block_number: payload.blockNumber,
      gas_used: payload.gasUsed,
      contract_address: payload.contractAddress
    },
    timestamp: new Date(payload.timestamp ? payload.timestamp * 1000 : Date.now())
  }
}

function normaliseSolEvent(
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  return {
    source: 'sol',
    sourceId,
    eventType,
    amount: payload.lamports ? payload.lamports / 1e9 : undefined,  // Lamports to SOL
    currency: payload.tokenSymbol || 'SOL',
    sender: payload.source || payload.from,
    recipient: payload.destination || payload.to,
    metadata: {
      signature: payload.signature || sourceId,
      slot: payload.slot,
      program_id: payload.programId
    },
    timestamp: new Date(payload.blockTime ? payload.blockTime * 1000 : Date.now())
  }
}

function normaliseAgentEvent(
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  return {
    source: 'agent',
    sourceId,
    eventType,
    metadata: {
      agent_id: payload.agent_id,
      task_id: payload.task_id,
      action: payload.action,
      result: payload.result,
      duration_ms: payload.duration_ms
    },
    timestamp: new Date(payload.timestamp || Date.now())
  }
}

function normaliseGenericEvent(
  source: EventSource,
  sourceId: string,
  eventType: string,
  payload: Record<string, any>
): NormalisedEvent {
  return {
    source,
    sourceId,
    eventType,
    metadata: payload,
    timestamp: new Date(payload.timestamp || Date.now())
  }
}

// ============================================
// Helpers
// ============================================

function hashPayload(payload: any): string {
  const json = JSON.stringify(payload, Object.keys(payload).sort())
  return createHash('sha256').update(json).digest('hex')
}

function mapToEvent(row: any): CapturedEvent {
  return {
    id: row.id,
    source: row.source,
    sourceId: row.source_id,
    eventType: row.event_type,
    rawPayload: row.raw_payload,
    normalisedPayload: row.normalised_payload,
    contentHash: row.content_hash,
    status: row.status,
    batchId: row.batch_id,
    commitTxid: row.commit_txid,
    capturedAt: row.captured_at
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Capture and normalise in one step
 */
export async function captureAndNormalise(input: CaptureEventInput): Promise<CapturedEvent> {
  const captured = await captureEvent(input)
  if (captured.status === 'captured') {
    return normaliseEvent(captured.id)
  }
  return captured
}

/**
 * Quick capture for Stripe webhook
 */
export async function captureStripeWebhook(event: any): Promise<CapturedEvent> {
  return captureAndNormalise({
    source: 'stripe',
    sourceId: event.id,
    eventType: event.type,
    payload: event.data?.object || event,
    timestamp: new Date(event.created * 1000)
  })
}

/**
 * Quick capture for agent action
 */
export async function captureAgentAction(
  agentId: string,
  actionType: string,
  result: any,
  durationMs?: number
): Promise<CapturedEvent> {
  const actionId = `${agentId}-${Date.now()}`
  return captureAndNormalise({
    source: 'agent',
    sourceId: actionId,
    eventType: actionType,
    payload: {
      agent_id: agentId,
      action: actionType,
      result,
      duration_ms: durationMs,
      timestamp: new Date()
    }
  })
}
