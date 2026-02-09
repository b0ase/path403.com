/**
 * POST /api/m2m/batch
 *
 * Trigger batch commit of pending events to BSV.
 * Call from cron job or manually.
 */

import { NextRequest, NextResponse } from 'next/server'
import { processPendingBatches, createBatch, commitBatch } from '@/lib/m2m'

export async function POST(request: NextRequest) {
  try {
    // Check for API key (simple auth)
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.M2M_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const maxEvents = body.max_events || 1000

    // Process all pending batches
    const result = await processPendingBatches()

    return NextResponse.json({
      success: true,
      batches_created: result.batchesCreated,
      batches_committed: result.batchesCommitted,
      errors: result.errors
    })
  } catch (error) {
    console.error('Batch processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process batches' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/m2m/batch
 *
 * Get batch statistics.
 */
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')

    const [pendingEvents, pendingBatches, committedBatches, totalAnchors] = await Promise.all([
      prisma.captured_events.count({ where: { status: 'normalised', batch_id: null } }),
      prisma.commit_batches.count({ where: { status: 'pending' } }),
      prisma.commit_batches.count({ where: { status: 'broadcast' } }),
      prisma.anchor_mappings.count()
    ])

    // Recent batches
    const recentBatches = await prisma.commit_batches.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        event_count: true,
        merkle_root: true,
        txid: true,
        status: true,
        created_at: true,
        broadcast_at: true
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        pending_events: pendingEvents,
        pending_batches: pendingBatches,
        committed_batches: committedBatches,
        total_anchors: totalAnchors
      },
      recent_batches: recentBatches.map(b => ({
        id: b.id,
        event_count: b.event_count,
        merkle_root: b.merkle_root,
        txid: b.txid,
        status: b.status,
        created_at: b.created_at?.toISOString(),
        broadcast_at: b.broadcast_at?.toISOString()
      }))
    })
  } catch (error) {
    console.error('Batch stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get batch stats' },
      { status: 500 }
    )
  }
}
