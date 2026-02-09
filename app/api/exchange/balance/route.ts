/**
 * Exchange Balance API
 * GET - Get user's clearing and token balances
 * POST - Deposit sats or tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  getClearingBalance,
  getTokenBalances,
  depositSats,
  depositTokens
} from '@/lib/exchange'

const DepositSchema = z.object({
  type: z.enum(['sats', 'tokens']),
  amount: z.number().int().positive(),
  token_id: z.string().optional(),
  token_symbol: z.string().optional()
}).refine(
  data => data.type !== 'tokens' || (data.token_id && data.token_symbol),
  { message: 'token_id and token_symbol required for token deposits' }
)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get clearing balance
    const clearingBalance = await getClearingBalance(user.id)

    // Get token balances
    const tokenBalances = await getTokenBalances(user.id)

    return NextResponse.json({
      clearing: clearingBalance || {
        available_sats: 0,
        locked_sats: 0,
        total_sats: 0
      },
      tokens: tokenBalances
    })
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user handle
    const { data: profile } = await supabase
      .from('profiles')
      .select('handcash_handle')
      .eq('id', user.id)
      .single()

    const userHandle = profile?.handcash_handle || null

    // Parse body
    const body = await request.json()
    const parsed = DepositSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, amount, token_id, token_symbol } = parsed.data

    if (type === 'sats') {
      // Note: In production, this would be triggered by actual BSV deposit
      // For now, this is an admin/testing endpoint
      const result = await depositSats(user.id, userHandle, amount)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      const balance = await getClearingBalance(user.id)
      return NextResponse.json({
        success: true,
        message: `Deposited ${amount} sats`,
        balance
      })
    } else {
      // Token deposit
      const result = await depositTokens(
        user.id,
        userHandle,
        token_id!,
        token_symbol!,
        amount
      )

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      const tokens = await getTokenBalances(user.id)
      return NextResponse.json({
        success: true,
        message: `Deposited ${amount} ${token_symbol}`,
        tokens
      })
    }
  } catch (error) {
    console.error('Deposit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
