import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    const body = await request.json()
    const { action, rejection_reason } = body
    const { id } = await params

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Valid action required (approve or reject)' }, { status: 400 })
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
    }

    if (action === 'approve') {
      const { data, error } = await supabase.rpc('approve_kyc_verification', {
        p_kyc_id: id,
        p_admin_id: user.id,
      })

      if (error) {
        console.error('KYC approve error:', error)
        return NextResponse.json({ error: 'Failed to approve KYC' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'KYC verification approved',
      })
    } else {
      const { data, error } = await supabase.rpc('reject_kyc_verification', {
        p_kyc_id: id,
        p_admin_id: user.id,
        p_reason: rejection_reason,
      })

      if (error) {
        console.error('KYC reject error:', error)
        return NextResponse.json({ error: 'Failed to reject KYC' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'KYC verification rejected',
      })
    }
  } catch (error) {
    console.error('KYC verify API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
