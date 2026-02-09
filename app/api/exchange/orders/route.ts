/**
 * Exchange Orders API
 * POST - Create buy/sell order
 * GET - List orders (user's orders or order book for token)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  lockSatsForBuyOrder,
  lockTokensForSellOrder,
  queueForMatching,
  runMatching
} from '@/lib/exchange'

const CreateOrderSchema = z.object({
  token_id: z.string().min(1),
  token_symbol: z.string().min(1).max(20),
  side: z.enum(['buy', 'sell']),
  amount: z.number().int().positive(),
  price_sats: z.number().int().positive(),
  expires_at: z.string().datetime().optional()
})

const ListOrdersSchema = z.object({
  token_id: z.string().optional(),
  side: z.enum(['buy', 'sell']).optional(),
  status: z.enum(['open', 'partial', 'filled', 'cancelled']).optional(),
  user_orders_only: z.coerce.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user handle from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single()

    const userHandle = profile?.handcash_handle || null

    // Parse and validate body
    const body = await request.json()
    const parsed = CreateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { token_id, token_symbol, side, amount, price_sats, expires_at } = parsed.data
    const totalSats = amount * price_sats

    // Validate and lock funds based on order side
    if (side === 'buy') {
      const lockResult = await lockSatsForBuyOrder(user.id, totalSats)
      if (!lockResult.success) {
        return NextResponse.json({ error: lockResult.error }, { status: 400 })
      }
    } else {
      const lockResult = await lockTokensForSellOrder(user.id, token_id, token_symbol, amount)
      if (!lockResult.success) {
        return NextResponse.json({ error: lockResult.error }, { status: 400 })
      }
    }

    // Create the order
    const { data: order, error: createError } = await supabase
      .from('exchange_orders')
      .insert({
        user_id: user.id,
        user_handle: userHandle,
        token_id,
        token_symbol,
        side,
        amount,
        price_sats,
        filled_amount: 0,
        status: 'open',
        expires_at: expires_at || null
      })
      .select()
      .single()

    if (createError) {
      console.error('Order creation failed:', createError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Queue for matching and immediately try to match
    await queueForMatching(order.id, token_id)

    // Run matching synchronously for immediate execution
    const matchResult = await runMatching(token_id, 10)

    return NextResponse.json({
      success: true,
      order,
      matching: {
        matches_found: matchResult.matches.length,
        trades_executed: matchResult.tradesExecuted.length
      }
    })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query params
    const params = ListOrdersSchema.safeParse({
      token_id: searchParams.get('token_id'),
      side: searchParams.get('side'),
      status: searchParams.get('status'),
      user_orders_only: searchParams.get('user_orders_only')
    })

    let query = supabase
      .from('exchange_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    // If user_orders_only, require auth and filter by user
    if (params.success && params.data.user_orders_only) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      query = query.eq('user_id', user.id)
    }

    // Apply filters
    if (params.success) {
      if (params.data.token_id) {
        query = query.eq('token_id', params.data.token_id)
      }
      if (params.data.side) {
        query = query.eq('side', params.data.side)
      }
      if (params.data.status) {
        query = query.eq('status', params.data.status)
      }
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
