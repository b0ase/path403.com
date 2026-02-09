import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: distributions, error: fetchError } = await supabase
      .from('dividend_distributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Dividends fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch dividends' }, { status: 500 })
    }

    const summary = {
      totalDistributions: distributions.length,
      totalAmount: distributions.reduce((sum, d) => sum + Number(d.total_amount), 0),
      pendingCount: distributions.filter(d => d.status === 'pending').length,
      completedCount: distributions.filter(d => d.status === 'completed').length,
    }

    return NextResponse.json({
      distributions,
      summary,
    })
  } catch (error) {
    console.error('Dividends GET error:', error)
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
      distribution_name,
      total_amount,
      currency,
      record_date,
      payment_date,
      announcement_date,
      description,
      notes,
      eligible_tokens,
    } = body

    if (!distribution_name || typeof distribution_name !== 'string') {
      return NextResponse.json({ error: 'Distribution name required' }, { status: 400 })
    }

    if (!total_amount || typeof total_amount !== 'number' || total_amount <= 0) {
      return NextResponse.json({ error: 'Valid total amount required' }, { status: 400 })
    }

    if (!eligible_tokens || typeof eligible_tokens !== 'number' || eligible_tokens <= 0) {
      return NextResponse.json({ error: 'Valid eligible tokens required' }, { status: 400 })
    }

    const per_token_amount = total_amount / eligible_tokens

    const { data: distribution, error: createError } = await supabase
      .from('dividend_distributions')
      .insert({
        distribution_name,
        total_amount,
        currency: currency || 'GBP',
        record_date: record_date || new Date().toISOString().split('T')[0],
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        announcement_date: announcement_date || new Date().toISOString().split('T')[0],
        per_token_amount,
        eligible_tokens,
        status: 'announced',
        description: description || null,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Dividend create error:', createError)
      return NextResponse.json({ error: 'Failed to create dividend distribution' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      distribution,
    })
  } catch (error) {
    console.error('Dividends POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
