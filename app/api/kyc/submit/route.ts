import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit'

// Rate limited: 5 requests per 15 minutes (auth preset - KYC is sensitive)
const kycSubmitHandler = async (request: NextRequest) => {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      date_of_birth,
      government_id_front_url,
      government_id_back_url,
      proof_of_address_url,
      selfie_url,
    } = body

    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Full name required' }, { status: 400 })
    }

    if (!date_of_birth || typeof date_of_birth !== 'string') {
      return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })
    }

    if (!government_id_front_url || typeof government_id_front_url !== 'string') {
      return NextResponse.json({ error: 'Government ID front image required' }, { status: 400 })
    }

    if (!proof_of_address_url || typeof proof_of_address_url !== 'string') {
      return NextResponse.json({ error: 'Proof of address required' }, { status: 400 })
    }

    const { data: kyc, error: createError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        full_name,
        date_of_birth,
        government_id_front_url,
        government_id_back_url: government_id_back_url || null,
        proof_of_address_url,
        selfie_url: selfie_url || null,
        status: 'pending',
      })
      .select()
      .single()

    if (createError) {
      console.error('KYC submit error:', createError)
      return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      kyc,
    })
  } catch (error) {
    console.error('KYC submit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Apply rate limiting
export const POST = withRateLimit(kycSubmitHandler, rateLimitPresets.auth)
