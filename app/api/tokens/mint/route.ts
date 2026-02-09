import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tokenSymbol, amount, source, sourceReference } = body

    // Validate input
    if (!tokenSymbol || typeof tokenSymbol !== 'string') {
      return NextResponse.json({ error: 'Token symbol required' }, { status: 400 })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }
    if (!source || typeof source !== 'string') {
      return NextResponse.json({ error: 'Source required' }, { status: 400 })
    }

    // Check if token exists in issued_tokens
    const { data: token, error: tokenError } = await supabase
      .from('issued_tokens')
      .select('symbol')
      .eq('symbol', tokenSymbol)
      .single()

    // If token doesn't exist in issued_tokens, create it from registry
    if (tokenError || !token) {
      // For now, allow minting any token - we'll seed issued_tokens later
      // In production, you'd validate against TOKEN_REGISTRY
      const { error: insertError } = await supabase
        .from('issued_tokens')
        .insert({
          symbol: tokenSymbol,
          name: tokenSymbol.replace('$', ''),
          blockchain: 'bsv', // Default to BSV
          is_deployed: false,
        })
        .select()
        .single()

      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('Error creating token:', insertError)
        return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
      }
    }

    // Credit tokens to user using the database function
    const { data: result, error: mintError } = await supabase.rpc('credit_tokens', {
      p_user_id: user.id,
      p_token_symbol: tokenSymbol,
      p_amount: amount,
      p_source: source,
      p_source_reference: sourceReference || null,
    })

    if (mintError) {
      console.error('Mint error:', mintError)
      return NextResponse.json({ error: 'Failed to mint tokens' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tokenSymbol,
      amount,
      newBalance: result,
    })
  } catch (error) {
    console.error('Mint API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
