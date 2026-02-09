/**
 * POST /api/m2m/capture
 *
 * Generic event capture endpoint.
 * Captures any external event for BSV anchoring.
 */

import { NextRequest, NextResponse } from 'next/server'
import { captureAndNormalise, type EventSource } from '@/lib/m2m'
import { z } from 'zod'

const CaptureSchema = z.object({
  source: z.enum(['stripe', 'paypal', 'eth', 'sol', 'bsv', 'handcash', 'webhook', 'agent', 'api']),
  source_id: z.string().min(1),
  event_type: z.string().min(1),
  payload: z.record(z.any()),
  timestamp: z.string().datetime().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CaptureSchema.parse(body)

    const event = await captureAndNormalise({
      source: validated.source as EventSource,
      sourceId: validated.source_id,
      eventType: validated.event_type,
      payload: validated.payload,
      timestamp: validated.timestamp ? new Date(validated.timestamp) : undefined
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        source: event.source,
        source_id: event.sourceId,
        status: event.status,
        content_hash: event.contentHash,
        captured_at: event.capturedAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Capture error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to capture event' },
      { status: 500 }
    )
  }
}
