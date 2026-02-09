import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit'

/**
 * Create a Veriff verification session
 *
 * This endpoint creates a session with Veriff and returns a URL for the user
 * to complete their identity verification. Documents are processed by Veriff
 * and never stored on our servers.
 *
 * Flow:
 * 1. User calls this endpoint
 * 2. We create a Veriff session and store the session_id
 * 3. User is redirected to Veriff to complete verification
 * 4. Veriff sends webhook to /api/kyc/veriff/webhook with result
 * 5. We update KYC status based on Veriff's decision
 */

const VERIFF_API_URL = 'https://stationapi.veriff.com/v1'

interface VeriffSessionResponse {
  status: string
  verification: {
    id: string
    url: string
    vendorData: string
    host: string
    status: string
    sessionToken: string
  }
}

const createVeriffSessionHandler = async (request: NextRequest) => {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Veriff is configured
    const veriffApiKey = process.env.VERIFF_API_KEY
    const veriffApiSecret = process.env.VERIFF_API_SECRET

    if (!veriffApiKey || !veriffApiSecret) {
      console.error('Veriff API credentials not configured')

      // For development/testing: allow self-certification flow
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          mode: 'development',
          message: 'Veriff not configured. Using self-certification for development.',
          selfCertification: true,
        })
      }

      return NextResponse.json(
        { error: 'Identity verification service not configured' },
        { status: 503 }
      )
    }

    // Get user's email for Veriff session
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Create Veriff session
    const veriffPayload = {
      verification: {
        callback: `${process.env.NEXT_PUBLIC_APP_URL || 'https://b0ase.com'}/api/kyc/veriff/webhook`,
        person: {
          firstName: profile?.full_name?.split(' ')[0] || '',
          lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
          idNumber: null,
        },
        document: {
          type: 'DRIVERS_LICENSE', // or PASSPORT, ID_CARD
          country: null, // Let user choose
        },
        vendorData: user.id, // Store user ID to match webhook
        timestamp: new Date().toISOString(),
      },
    }

    const veriffResponse = await fetch(`${VERIFF_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-CLIENT': veriffApiKey,
      },
      body: JSON.stringify(veriffPayload),
    })

    if (!veriffResponse.ok) {
      const errorText = await veriffResponse.text()
      console.error('Veriff session creation failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to create verification session' },
        { status: 500 }
      )
    }

    const veriffData: VeriffSessionResponse = await veriffResponse.json()

    // Store session reference in our database (but NOT documents)
    const { error: dbError } = await supabase
      .from('kyc_verifications')
      .upsert({
        user_id: user.id,
        veriff_session_id: veriffData.verification.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (dbError) {
      console.error('Failed to store Veriff session reference:', dbError)
      // Continue anyway - session was created
    }

    return NextResponse.json({
      success: true,
      sessionId: veriffData.verification.id,
      url: veriffData.verification.url,
      // Don't expose session token to client
    })

  } catch (error) {
    console.error('Veriff session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting - 3 requests per 15 minutes
export const POST = withRateLimit(createVeriffSessionHandler, rateLimitPresets.auth)
