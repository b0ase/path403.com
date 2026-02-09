import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: kyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('KYC status fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 })
    }

    return NextResponse.json({
      kyc: kyc || null,
      hasSubmitted: !!kyc,
      status: kyc?.status || 'none',
    })
  } catch (error) {
    console.error('KYC status GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
