/**
 * AI API Key Funding
 *
 * POST - Fund an API key with satoshis (via HandCash)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { handcashService } from '@/lib/handcash-service'
import { z } from 'zod'

const FundSchema = z.object({
  amount_sats: z.number().int().min(100).max(1000000)  // 100 sats to 1M sats
})

// Platform destination for payments
const PLATFORM_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'b0ase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: keyId } = await params
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify user owns this key
    const { data: apiKey, error: keyError } = await supabase
      .from('ai_api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single()

    if (keyError || !apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    if (!apiKey.is_active) {
      return NextResponse.json({ error: 'API key is revoked' }, { status: 400 })
    }

    // Parse body
    const body = await request.json()
    const parsed = FundSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid amount. Min 100 sats, max 1,000,000 sats.' },
        { status: 400 }
      )
    }

    const { amount_sats } = parsed.data

    // Get HandCash auth token
    const cookieStore = await cookies()
    const authToken = cookieStore.get('b0ase_handcash_token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'HandCash authentication required', code: 'HANDCASH_REQUIRED' },
        { status: 401 }
      )
    }

    // Convert sats to USD (approximate: 1 sat ≈ $0.0004 at ~$40k BTC)
    // In production, fetch real-time rate
    const satsPerDollar = 2500  // Rough estimate
    const amountUSD = amount_sats / satsPerDollar

    // Process payment via HandCash
    let paymentResult
    try {
      paymentResult = await handcashService.sendPayment(authToken, {
        destination: PLATFORM_HANDLE,
        amount: Math.max(0.01, amountUSD),  // HandCash min is $0.01
        currency: 'USD',
        description: `b0ase AI API - ${amount_sats} sats for key ${apiKey.key_prefix}`,
      })
    } catch (error: any) {
      console.error('HandCash payment failed:', error)
      return NextResponse.json(
        { error: error.message || 'Payment failed', code: 'PAYMENT_FAILED' },
        { status: 400 }
      )
    }

    // Update key balance
    const newBalance = apiKey.balance_sats + amount_sats
    const { error: updateError } = await supabase
      .from('ai_api_keys')
      .update({
        balance_sats: newBalance,
        total_funded_sats: apiKey.total_funded_sats + amount_sats
      })
      .eq('id', keyId)

    if (updateError) {
      console.error('Failed to update balance:', updateError)
      return NextResponse.json(
        { error: 'Payment processed but balance update failed. Contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Added ${amount_sats} sats to API key`,
      key_prefix: apiKey.key_prefix,
      amount_funded: amount_sats,
      new_balance: newBalance,
      transaction_id: paymentResult.transactionId
    })
  } catch (error) {
    console.error('Fund API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
