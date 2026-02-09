import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const { data: payments, error: paymentsError } = await supabase
      .from('dividend_payments')
      .select('*')
      .eq('distribution_id', id)

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({
      distribution,
      payments,
    })
  } catch (error) {
    console.error('Dividend GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
