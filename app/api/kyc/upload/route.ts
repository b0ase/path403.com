/**
 * POST /api/kyc/upload
 *
 * User uploads identity documents for KYC verification
 * Required to receive dividends or withdraw shareholdings
 *
 * Request body (multipart/form-data):
 * - idDocument: File - Government-issued ID (PDF, JPG, PNG)
 * - proofOfAddress: File - Utility bill, bank statement (PDF, JPG, PNG)
 * - fullName: string - Full name as it appears on ID
 * - dateOfBirth: string - Date of birth (YYYY-MM-DD)
 *
 * Response:
 * - success: boolean
 * - kycId: string - KYC submission ID
 * - status: 'pending' | 'verified' | 'rejected'
 * - message: string
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const supabase = await createClient();

    // 2. Check if already verified
    const { data: existingKyc } = await supabase
      .from('user_kyc')
      .select('*')
      .eq('user_id', unifiedUser.id)
      .single();

    if (existingKyc && existingKyc.status === 'verified') {
      return NextResponse.json(
        {
          success: true,
          kycId: existingKyc.id,
          status: 'verified',
          message: 'Your identity has already been verified',
        },
        { status: 200 }
      );
    }

    // 3. Parse form data
    const formData = await request.formData();
    const idDocument = formData.get('idDocument') as File | null;
    const proofOfAddress = formData.get('proofOfAddress') as File | null;
    const fullName = formData.get('fullName') as string | null;
    const dateOfBirth = formData.get('dateOfBirth') as string | null;

    // 4. Validate inputs
    if (!idDocument || !proofOfAddress || !fullName || !dateOfBirth) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['idDocument', 'proofOfAddress', 'fullName', 'dateOfBirth'],
        },
        { status: 400 }
      );
    }

    // 5. Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(idDocument.type)) {
      return NextResponse.json(
        { error: 'Invalid ID document format. Allowed: PDF, JPG, PNG' },
        { status: 400 }
      );
    }
    if (!allowedTypes.includes(proofOfAddress.type)) {
      return NextResponse.json(
        { error: 'Invalid proof of address format. Allowed: PDF, JPG, PNG' },
        { status: 400 }
      );
    }

    // 6. Validate file sizes (max 10MB each)
    if (idDocument.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ID document too large (max 10MB)' },
        { status: 400 }
      );
    }
    if (proofOfAddress.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Proof of address too large (max 10MB)' },
        { status: 400 }
      );
    }

    // 7. Convert files to base64 for storage
    const idBuffer = await idDocument.arrayBuffer();
    const addressBuffer = await proofOfAddress.arrayBuffer();
    const idBase64 = Buffer.from(idBuffer).toString('base64');
    const addressBase64 = Buffer.from(addressBuffer).toString('base64');

    // 8. Create KYC record
    const { data: kyc, error: kycError } = await supabase
      .from('user_kyc')
      .insert({
        user_id: unifiedUser.id,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        id_document_base64: idBase64,
        id_document_filename: idDocument.name,
        id_document_mimetype: idDocument.type,
        proof_of_address_base64: addressBase64,
        proof_of_address_filename: proofOfAddress.name,
        proof_of_address_mimetype: proofOfAddress.type,
        status: 'pending', // Manual review required
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (kycError || !kyc) {
      console.error('[kyc/upload] Failed to create KYC record:', kycError);
      return NextResponse.json(
        { error: 'Failed to submit KYC verification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      kycId: kyc.id,
      status: 'pending',
      message:
        'Your documents have been submitted. Verification is manual and typically takes 1-2 business days.',
    });
  } catch (error) {
    console.error('[kyc/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload KYC documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kyc/upload
 *
 * Check user's KYC status
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;
    const supabase = await createClient();

    const { data: kyc } = await supabase
      .from('user_kyc')
      .select('id, status, submitted_at, verified_at, rejected_reason')
      .eq('user_id', unifiedUser.id)
      .single();

    if (!kyc) {
      return NextResponse.json({
        verified: false,
        status: 'not_submitted',
        message: 'No KYC submission found',
      });
    }

    return NextResponse.json({
      verified: kyc.status === 'verified',
      status: kyc.status,
      submittedAt: kyc.submitted_at,
      verifiedAt: kyc.verified_at,
      rejectedReason: kyc.rejected_reason,
    });
  } catch (error) {
    console.error('[kyc/upload] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to check KYC status' },
      { status: 500 }
    );
  }
}
