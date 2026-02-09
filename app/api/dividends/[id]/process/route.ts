import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params

    const { data: distribution, error: distError } = await supabase
      .from('dividend_distributions')
      .select('*')
      .eq('id', id)
      .single()

    if (distError) {
      return NextResponse.json({ error: 'Distribution not found' }, { status: 404 })
    }

    if (distribution.status === 'completed') {
      return NextResponse.json({ error: 'Distribution already processed' }, { status: 400 })
    }

    const { data: shareholders, error: shareholdersError } = await supabase
      .from('cap_table_shareholders')
      .select('*')
      .eq('kyc_status', 'verified')
      .eq('status', 'active')

    if (shareholdersError) {
      console.error('Shareholders fetch error:', shareholdersError)
      return NextResponse.json({ error: 'Failed to fetch shareholders' }, { status: 500 })
    }

    const payments = shareholders.map((sh) => {
      const eligibleTokens = Number(sh.vested_tokens || sh.token_balance)
      const paymentAmount = eligibleTokens * Number(distribution.per_token_amount)

      return {
        distribution_id: id,
        shareholder_id: sh.id,
        eligible_tokens: eligibleTokens,
        payment_amount: paymentAmount,
        currency: distribution.currency,
        status: 'pending',
        payment_method: 'bank_transfer',
      }
    })

    const { error: paymentsInsertError } = await supabase
      .from('dividend_payments')
      .insert(payments)

    if (paymentsInsertError) {
      console.error('Payments insert error:', paymentsInsertError)
      return NextResponse.json({ error: 'Failed to create payments' }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from('dividend_distributions')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Distribution update error:', updateError)
      return NextResponse.json({ error: 'Failed to update distribution' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentsCreated: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.payment_amount, 0),
    })
  } catch (error) {
    console.error('Dividend process error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
