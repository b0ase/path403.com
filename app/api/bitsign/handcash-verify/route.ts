import { NextRequest, NextResponse } from 'next/server';
import { handCashConnect } from '@/lib/handcash';
import crypto from 'crypto';

/**
 * HandCash verification for BitSign
 *
 * Since HandCash uses OAuth (not client-side signing like MetaMask/Phantom),
 * we verify the user's identity by:
 * 1. Validating their auth token
 * 2. Fetching their profile
 * 3. Creating a server-side signature of the message using their identity
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get auth token from cookie - support both new and legacy cookie names
    const authToken = request.cookies.get('b0ase_handcash_token')?.value || request.cookies.get('b0ase_auth_token')?.value;

    console.log('[bitsign/verify] Auth check:', {
      hasToken: !!authToken,
      tokenLength: authToken?.length,
      b0ase_handcash_token: !!request.cookies.get('b0ase_handcash_token'),
      b0ase_auth_token: !!request.cookies.get('b0ase_auth_token')
    });

    if (!authToken) {
      console.warn('[bitsign/verify] Missing HandCash token');
      return NextResponse.json({
        error: 'Not authenticated with HandCash',
        needsAuth: true
      }, { status: 401 });
    }

    if (!handCashConnect) {
      console.error('[bitsign/verify] HandCash service not initialized (check env vars)');
      return NextResponse.json({ error: 'HandCash service not configured' }, { status: 500 });
    }

    // Verify the auth token by fetching user profile
    let publicProfile;
    try {
      const account = handCashConnect.getAccountFromAuthToken(authToken);
      const profile = await account.profile.getCurrentProfile();
      publicProfile = profile.publicProfile;
      console.log('[bitsign/verify] Profile fetched:', publicProfile?.handle);

      if (!publicProfile?.handle) {
        throw new Error('No handle in profile');
      }
    } catch (profileError) {
      console.error('[bitsign/verify] Profile fetch failed:', profileError);
      return NextResponse.json({ error: 'Invalid HandCash token' }, { status: 401 });
    }

    // Create a verification signature
    const verificationData = {
      handle: publicProfile.handle,
      message,
      timestamp: new Date().toISOString(),
      platform: 'handcash',
    };

    // Create HMAC signature
    const hmacSecret = process.env.HANDCASH_APP_SECRET || 'bitsign-verification';
    const signature = crypto
      .createHmac('sha256', hmacSecret)
      .update(JSON.stringify(verificationData))
      .digest('hex');

    return NextResponse.json({
      success: true,
      walletType: 'handcash',
      walletAddress: `$${publicProfile.handle}`,
      displayName: publicProfile.displayName || publicProfile.handle,
      avatarUrl: publicProfile.avatarUrl,
      signature: `handcash:${signature}`,
      message,
      verifiedAt: verificationData.timestamp,
    });

  } catch (error) {
    console.error('[bitsign/handcash-verify] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Verification failed'
    }, { status: 500 });
  }
}
