/**
 * Exchange Trades API
 * GET - List trades for a token or user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ListTradesSchema = z.object({
  token_id: z.string().optional(),
  user_trades_only: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const params = ListTradesSchema.safeParse({
      token_id: searchParams.get('token_id'),
      user_trades_only: searchParams.get('user_trades_only'),
      limit: searchParams.get('limit')
    })

    if (!params.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: params.error.flatten() },
        { status: 400 }
      )
    }

    const { token_id, user_trades_only, limit } = params.data

    let query = supabase
      .from('exchange_trades')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit)

    // Filter by token
    if (token_id) {
      query = query.eq('token_id', token_id)
    }

    // Filter by user (buyer or seller)
    if (user_trades_only) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    }

    const { data: trades, error } = await query

    if (error) {
      console.error('Trades fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }

    // Calculate summary stats
    let volume24h = 0
    let tradeCount24h = 0
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    for (const trade of trades || []) {
      if (new Date(trade.executed_at) > oneDayAgo) {
        volume24h += trade.total_sats
        tradeCount24h++
      }
    }

    return NextResponse.json({
      trades,
      stats: {
        volume_24h_sats: volume24h,
        trade_count_24h: tradeCount24h,
        last_trade: trades?.[0] || null
      }
    })
  } catch (error) {
    console.error('Trades API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
