import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token_id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      holder_name,
      holder_email,
      holder_user_id,
      holder_wallet_address,
      shares_held,
      share_certificate_number,
      acquired_date,
      notes,
    } = body

    const { token_id } = await params

    if (!holder_name || typeof holder_name !== 'string') {
      return NextResponse.json({ error: 'Holder name required' }, { status: 400 })
    }

    if (!shares_held || typeof shares_held !== 'number' || shares_held <= 0) {
      return NextResponse.json({ error: 'Valid shares amount required' }, { status: 400 })
    }

    const { data: entry, error: createError } = await supabase
      .from('cap_table_entries')
      .insert({
        token_id,
        holder_name,
        holder_email: holder_email || null,
        holder_user_id: holder_user_id || null,
        holder_wallet_address: holder_wallet_address || null,
        shares_held,
        share_certificate_number: share_certificate_number || null,
        acquired_date: acquired_date || new Date().toISOString().split('T')[0],
        notes: notes || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Cap table entry create error:', createError)
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry,
    })
  } catch (error) {
    console.error('Cap table entries POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
