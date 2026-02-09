import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, name, blockchain, total_supply, decimals, icon_url } = body

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Token symbol required' }, { status: 400 })
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Token name required' }, { status: 400 })
    }

    if (!blockchain || !['bsv', 'eth', 'sol'].includes(blockchain)) {
      return NextResponse.json({ error: 'Valid blockchain required (bsv, eth, or sol)' }, { status: 400 })
    }

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('issued_tokens')
      .select('symbol')
      .eq('symbol', symbol)
      .single()

    if (existingToken) {
      return NextResponse.json({ error: 'Token symbol already exists' }, { status: 409 })
    }

    // Create token
    const { data: token, error: createError } = await supabase
      .from('issued_tokens')
      .insert({
        symbol,
        name,
        blockchain,
        total_supply: total_supply || 1000000000,
        decimals: decimals || 0,
        icon_url: icon_url || null,
        is_deployed: false,
      })
      .select()
      .single()

    if (createError) {
      console.error('Token create error:', createError)
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('Registry tokens API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tokens, error: fetchError } = await supabase
      .from('issued_tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Tokens fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
    }

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Registry tokens GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
