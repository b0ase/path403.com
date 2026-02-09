/**
 * $402 KYC API
 *
 * GET - Get current user's KYC status
 * POST - Submit KYC application
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Check KYC status
export async function GET(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({
        authenticated: false,
        kycStatus: 'none',
        registered: false,
      });
    }

    const supabase = await createClient();

    // Get user's KYC status from unified_users
    const { data: user } = await supabase
      .from('unified_users')
      .select('id, display_name, kyc_status, kyc_submitted_at, kyc_verified_at, registered, registered_at')
      .eq('primary_handle', userHandle)
      .single();

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        handle: userHandle,
        kycStatus: 'none',
        registered: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      handle: userHandle,
      displayName: user.display_name,
      kycStatus: user.kyc_status || 'none',
      kycSubmittedAt: user.kyc_submitted_at,
      kycVerifiedAt: user.kyc_verified_at,
      registered: user.registered || false,
      registeredAt: user.registered_at,
    });
  } catch (error) {
    console.error('[KYC] GET Error:', error);
    return NextResponse.json({ error: 'Failed to get KYC status' }, { status: 500 });
  }
}

// POST - Submit KYC application
export async function POST(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { fullLegalName, nationality, documentType, documentRef } = body;

    // Validate required fields
    if (!fullLegalName || !nationality || !documentType) {
      return NextResponse.json({
        error: 'Missing required fields: fullLegalName, nationality, documentType',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('unified_users')
      .select('id, kyc_status')
      .eq('primary_handle', userHandle)
      .single();

    if (!existingUser) {
      // Create user record if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('unified_users')
        .insert({
          primary_handle: userHandle,
          display_name: userHandle,
          kyc_status: 'pending',
          kyc_submitted_at: new Date().toISOString(),
          full_legal_name: fullLegalName,
          nationality,
          kyc_document_ref: documentRef,
        })
        .select()
        .single();

      if (createError) {
        console.error('[KYC] Create user error:', createError);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        kycStatus: 'pending',
        message: 'KYC application submitted. We will review within 24-48 hours.',
      });
    }

    // Check current status
    if (existingUser.kyc_status === 'verified') {
      return NextResponse.json({
        error: 'KYC already verified',
        kycStatus: 'verified',
      }, { status: 400 });
    }

    if (existingUser.kyc_status === 'pending') {
      return NextResponse.json({
        error: 'KYC application already pending review',
        kycStatus: 'pending',
      }, { status: 400 });
    }

    // Update user with KYC submission
    const { error: updateError } = await supabase
      .from('unified_users')
      .update({
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString(),
        full_legal_name: fullLegalName,
        nationality,
        kyc_document_ref: documentRef,
      })
      .eq('id', existingUser.id);

    if (updateError) {
      console.error('[KYC] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      kycStatus: 'pending',
      message: 'KYC application submitted. We will review within 24-48 hours.',
    });
  } catch (error) {
    console.error('[KYC] POST Error:', error);
    return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 });
  }
}
