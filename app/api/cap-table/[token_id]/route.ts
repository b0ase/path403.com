import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token_id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token_id } = await params

    const { data: token, error: tokenError } = await supabase
      .from('company_tokens')
      .select('*')
      .eq('id', token_id)
      .single()

    if (tokenError) {
      console.error('Token fetch error:', tokenError)
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    const { data: entries, error: entriesError } = await supabase
      .from('cap_table_entries')
      .select('*')
      .eq('token_id', token_id)
      .order('shares_held', { ascending: false })

    if (entriesError) {
      console.error('Cap table entries fetch error:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch cap table' }, { status: 500 })
    }

    const entriesWithPercentage = entries.map((entry) => ({
      ...entry,
      percentage: token.total_supply > 0
        ? (Number(entry.shares_held) / Number(token.total_supply)) * 100
        : 0,
    }))

    return NextResponse.json({
      token,
      entries: entriesWithPercentage,
      totalShares: token.total_supply,
    })
  } catch (error) {
    console.error('Cap table GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
