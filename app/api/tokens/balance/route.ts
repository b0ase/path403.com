import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get optional token filter
    const { searchParams } = new URL(request.url)
    const tokenSymbol = searchParams.get('token')

    // Build query
    let query = supabase
      .from('user_token_balances')
      .select(`
        token_symbol,
        balance,
        total_minted,
        total_withdrawn,
        updated_at
      `)
      .eq('user_id', user.id)
      .gt('balance', 0) // Only show non-zero balances

    if (tokenSymbol) {
      query = query.eq('token_symbol', tokenSymbol)
    }

    const { data: balances, error } = await query.order('balance', { ascending: false })

    if (error) {
      console.error('Balance query error:', error)
      return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 })
    }

    return NextResponse.json({
      balances: balances || [],
      totalTokenTypes: balances?.length || 0,
    })
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
