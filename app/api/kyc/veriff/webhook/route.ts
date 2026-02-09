import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * Veriff Webhook Handler
 *
 * Receives verification results from Veriff. Veriff sends webhooks when:
 * - Verification is completed (approved/declined)
 * - Verification expires
 * - Verification is resubmitted
 *
 * Security:
 * - Validates X-HMAC-SIGNATURE header to ensure request is from Veriff
 * - Only updates status based on Veriff's decision
 * - Never stores or logs document data
 *
 * See: https://developers.veriff.com/#webhooks
 */

interface VeriffWebhookPayload {
  id: string
  attemptId: string
  feature: string
  code: number
  action: string
  vendorData: string // Our user_id
  status: 'approved' | 'declined' | 'resubmission_requested' | 'expired' | 'abandoned'
  verification: {
    id: string
    code: number
    person: {
      firstName: string
      lastName: string
      dateOfBirth: string
      nationality: string
      idNumber: string
    }
    document: {
      type: string
      country: string
      number: string
      validFrom: string
      validUntil: string
    }
    reason: string | null
    reasonCode: number | null
    decisionTime: string
    acceptanceTime: string
  }
}

// Verify Veriff webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature.toLowerCase()),
    Buffer.from(expectedSignature.toLowerCase())
  )
}

export async function POST(request: NextRequest) {
  try {
    const veriffSecret = process.env.VERIFF_API_SECRET

    if (!veriffSecret) {
      console.error('VERIFF_API_SECRET not configured')
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    const signature = request.headers.get('x-hmac-signature')
    if (!signature) {
      console.warn('Veriff webhook received without signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    if (!verifySignature(rawBody, signature, veriffSecret)) {
      console.warn('Veriff webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse verified payload
    const payload: VeriffWebhookPayload = JSON.parse(rawBody)

    // Log verification event (but NOT personal data)
    console.log('Veriff webhook received:', {
      id: payload.id,
      action: payload.action,
      status: payload.status,
      vendorData: payload.vendorData,
      code: payload.code,
    })

    // Get user ID from vendorData
    const userId = payload.vendorData
    if (!userId) {
      console.error('Veriff webhook missing vendorData (user_id)')
      return NextResponse.json({ error: 'Missing vendor data' }, { status: 400 })
    }

    const supabase = await createClient()

    // Map Veriff status to our status
    let kycStatus: 'verified' | 'rejected' | 'pending' | 'expired'
    switch (payload.status) {
      case 'approved':
        kycStatus = 'verified'
        break
      case 'declined':
        kycStatus = 'rejected'
        break
      case 'expired':
      case 'abandoned':
        kycStatus = 'expired'
        break
      case 'resubmission_requested':
        kycStatus = 'pending'
        break
      default:
        kycStatus = 'pending'
    }

    // Update KYC status (never store personal data from verification)
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        status: kycStatus,
        veriff_session_id: payload.verification?.id || payload.id,
        veriff_decision_time: payload.verification?.decisionTime || new Date().toISOString(),
        // Store only the reason code, not the reason text (which may contain PII)
        veriff_reason_code: payload.verification?.reasonCode || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update KYC status:', updateError)
      // Return 200 to prevent Veriff from retrying
      // We'll handle the failure internally
    }

    // If approved, update user's investor status
    if (kycStatus === 'verified') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          investor_kyc_verified: true,
          investor_kyc_verified_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Failed to update profile investor status:', profileError)
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      status: kycStatus,
    })

  } catch (error) {
    console.error('Veriff webhook processing error:', error)
    // Return 200 to prevent infinite retries
    // Log error for manual investigation
    return NextResponse.json({
      success: false,
      error: 'Processing error logged'
    })
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
