/**
 * Exchange Matching API
 * POST - Trigger Kintsugi matching for a token
 *
 * This endpoint can be called:
 * 1. On new order creation (already done in orders/route.ts)
 * 2. By cron job for periodic matching
 * 3. By Kintsugi agent via tool call
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { runMatching, getOrderBook } from '@/lib/exchange'

const MatchRequestSchema = z.object({
  token_id: z.string().min(1),
  max_matches: z.number().int().positive().max(100).optional().default(10)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = MatchRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { token_id, max_matches } = parsed.data

    // Run matching
    const result = await runMatching(token_id, max_matches)

    // Get updated order book
    const orderBook = await getOrderBook(token_id)

    return NextResponse.json({
      success: result.success,
      matches_found: result.matches.length,
      trades_executed: result.tradesExecuted.length,
      trades: result.tradesExecuted,
      errors: result.errors,
      order_book: orderBook
    })
  } catch (error) {
    console.error('Matching API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET - Get order book for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('token_id')

    if (!tokenId) {
      return NextResponse.json({ error: 'token_id is required' }, { status: 400 })
    }

    const orderBook = await getOrderBook(tokenId)

    return NextResponse.json({ order_book: orderBook })
  } catch (error) {
    console.error('Order book API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
