import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transactions, error: fetchError } = await supabase
      .from('token_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      console.error('Transactions fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Transfers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      from_shareholder_id,
      to_shareholder_id,
      token_amount,
      transaction_type,
      purpose,
      notes,
      price_per_token,
      execute_on_chain,
      blockchain,
      from_address,
      to_address,
    } = body

    if (!from_shareholder_id || !to_shareholder_id) {
      return NextResponse.json({ error: 'From and to shareholder IDs required' }, { status: 400 })
    }

    if (!token_amount || typeof token_amount !== 'number' || token_amount <= 0) {
      return NextResponse.json({ error: 'Valid token amount required' }, { status: 400 })
    }

    if (!transaction_type || typeof transaction_type !== 'string') {
      return NextResponse.json({ error: 'Transaction type required' }, { status: 400 })
    }

    const { data: fromShareholder, error: fromError } = await supabase
      .from('cap_table_shareholders')
      .select('*')
      .eq('id', from_shareholder_id)
      .single()

    if (fromError || !fromShareholder) {
      return NextResponse.json({ error: 'From shareholder not found' }, { status: 404 })
    }

    if (Number(fromShareholder.token_balance) < token_amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const { data: toShareholder, error: toError } = await supabase
      .from('cap_table_shareholders')
      .select('*')
      .eq('id', to_shareholder_id)
      .single()

    if (toError || !toShareholder) {
      return NextResponse.json({ error: 'To shareholder not found' }, { status: 404 })
    }

    const { error: updateFromError } = await supabase
      .from('cap_table_shareholders')
      .update({
        token_balance: Number(fromShareholder.token_balance) - token_amount,
      })
      .eq('id', from_shareholder_id)

    if (updateFromError) {
      console.error('From shareholder update error:', updateFromError)
      return NextResponse.json({ error: 'Failed to update from shareholder' }, { status: 500 })
    }

    const { error: updateToError } = await supabase
      .from('cap_table_shareholders')
      .update({
        token_balance: Number(toShareholder.token_balance) + token_amount,
      })
      .eq('id', to_shareholder_id)

    if (updateToError) {
      console.error('To shareholder update error:', updateToError)
      return NextResponse.json({ error: 'Failed to update to shareholder' }, { status: 500 })
    }

    const { data: transaction, error: txError } = await supabase
      .from('token_transactions')
      .insert({
        from_shareholder_id,
        to_shareholder_id,
        from_address: from_address || fromShareholder.wallet_address,
        to_address: to_address || toShareholder.wallet_address,
        token_amount,
        transaction_type,
        purpose: purpose || null,
        notes: notes || null,
        is_verified: true,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction insert error:', txError)
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transfer completed successfully',
    })
  } catch (error) {
    console.error('Transfers POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
