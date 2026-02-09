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
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    const { data: entries, error: entriesError } = await supabase
      .from('cap_table_entries')
      .select('*')
      .eq('token_id', token_id)
      .order('shares_held', { ascending: false })

    if (entriesError) {
      return NextResponse.json({ error: 'Failed to fetch cap table' }, { status: 500 })
    }

    const csvHeaders = [
      'Holder Name',
      'Email',
      'Wallet Address',
      'Shares Held',
      'Percentage',
      'Certificate Number',
      'Acquired Date',
      'Notes'
    ].join(',')

    const csvRows = entries.map((entry) => {
      const percentage = token.total_supply > 0
        ? ((Number(entry.shares_held) / Number(token.total_supply)) * 100).toFixed(4)
        : '0'

      return [
        entry.holder_name,
        entry.holder_email || '',
        entry.holder_wallet_address || '',
        entry.shares_held,
        percentage,
        entry.share_certificate_number || '',
        entry.acquired_date || '',
        (entry.notes || '').replace(/,/g, ';'),
      ].join(',')
    })

    const csv = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cap-table-${token.symbol}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Cap table export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
