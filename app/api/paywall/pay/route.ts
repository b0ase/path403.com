/**
 * Paywall Payment API
 *
 * Two modes:
 * 1. Site entry (no tokenPath) - Pay entry fee, get $BOASE token, get site access
 * 2. Content purchase (with tokenPath) - Pay for specific content token
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { handcashService } from '@/lib/handcash-service';
import {
  getOrCreateContentToken,
  mintTokenToUser,
  pathToTokenId,
  getOrCreateUserAccount,
} from '@/lib/tokens/content-tokens';
import { generateTokenAccessJWT } from '@/lib/tokens/access';
import { createClient } from '@/lib/supabase/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'paywall-secret'
);

const PLATFORM_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'b0ase';
const SATS_PER_USD = 2500;

// Site entry fee
const SITE_ENTRY_PRICE_USD = 0.01;
const SITE_ENTRY_BOASE_REWARD = 1;

// Generate site access JWT
async function generateSiteAccessJWT(handle: string): Promise<string> {
  const now = Date.now();
  const expiresAt = now + (365 * 24 * 60 * 60 * 1000); // 1 year

  return new SignJWT({
    handle,
    paidAt: now,
    expiresAt,
    tokensAwarded: SITE_ENTRY_BOASE_REWARD,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('365d')
    .sign(JWT_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const authToken = req.cookies.get('b0ase_handcash_token')?.value;
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    console.log('[Paywall Pay] Auth check - authToken exists:', !!authToken, 'userHandle:', userHandle);

    if (!authToken || !userHandle) {
      console.log('[Paywall Pay] Missing auth - authToken:', !!authToken, 'userHandle:', !!userHandle);
      return NextResponse.json(
        { error: 'HandCash authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Check if HandCash service is in demo mode
    if (handcashService.isDemoMode) {
      console.log('[Paywall Pay] HandCash service is in DEMO MODE');
      return NextResponse.json(
        { error: 'HandCash payments not configured. Check HANDCASH_APP_ID and HANDCASH_APP_SECRET.', code: 'DEMO_MODE' },
        { status: 503 }
      );
    }

    // Verify HandCash session
    let userProfile;
    try {
      console.log('[Paywall Pay] Verifying HandCash session for handle:', userHandle);
      userProfile = await handcashService.getUserProfile(authToken);
      console.log('[Paywall Pay] HandCash session valid, profile:', userProfile?.handle);
    } catch (err: any) {
      console.error('[Paywall Pay] HandCash session invalid:', err.message);
      return NextResponse.json(
        { error: `HandCash session error: ${err.message}. Please reconnect.`, code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tokenPath = body.tokenPath as string | undefined;

    // MODE 1: Site Entry (no tokenPath)
    if (!tokenPath) {
      // Process site entry payment
      let paymentResult;
      try {
        paymentResult = await handcashService.sendPayment(authToken, {
          destination: PLATFORM_HANDLE,
          amount: SITE_ENTRY_PRICE_USD,
          currency: 'USD',
          description: `b0ase +${SITE_ENTRY_BOASE_REWARD} $BOASE`,
        });
      } catch (error: any) {
        console.error('Site entry payment failed:', error);
        const errorMessage = error.message || 'Payment failed';

        // Provide more specific error codes
        let code = 'PAYMENT_FAILED';
        if (errorMessage.includes('DEMO MODE')) {
          code = 'DEMO_MODE';
        } else if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
          code = 'INSUFFICIENT_FUNDS';
        } else if (errorMessage.includes('token') || errorMessage.includes('auth')) {
          code = 'INVALID_TOKEN';
        }

        return NextResponse.json(
          { error: errorMessage, code },
          { status: 400 }
        );
      }

      // Credit $BOASE token to user account
      const user = await getOrCreateUserAccount(userHandle);

      // Record $BOASE credit (using internal ledger)
      const supabase = await createClient();

      // Check/create $BOASE token definition
      const { data: boaseToken } = await supabase
        .from('content_tokens')
        .select('*')
        .eq('id', '$BOASE')
        .single();

      if (!boaseToken) {
        await supabase.from('content_tokens').insert({
          id: '$BOASE',
          path: '/',
          title: '$BOASE Site Token',
          price_sats: Math.round(SITE_ENTRY_PRICE_USD * SATS_PER_USD),
        });
      }

      // Credit user's $BOASE balance
      const { data: existingBalance } = await supabase
        .from('user_token_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('token_id', '$BOASE')
        .single();

      if (existingBalance) {
        await supabase
          .from('user_token_balances')
          .update({ balance: existingBalance.balance + SITE_ENTRY_BOASE_REWARD })
          .eq('id', existingBalance.id);
      } else {
        await supabase.from('user_token_balances').insert({
          user_id: user.id,
          token_id: '$BOASE',
          balance: SITE_ENTRY_BOASE_REWARD,
          acquisition_price_sats: Math.round(SITE_ENTRY_PRICE_USD * SATS_PER_USD),
        });
      }

      // Record transaction
      await supabase.from('token_transactions').insert({
        token_id: '$BOASE',
        from_user_id: null,
        to_user_id: user.id,
        amount: SITE_ENTRY_BOASE_REWARD,
        price_sats: Math.round(SITE_ENTRY_PRICE_USD * SATS_PER_USD),
        tx_type: 'mint',
        handcash_tx_id: paymentResult.transactionId,
      });

      // Generate site access JWT
      console.log('[Paywall Pay] Payment successful, generating JWT...');
      const siteAccessJWT = await generateSiteAccessJWT(userHandle);
      console.log('[Paywall Pay] JWT generated, length:', siteAccessJWT.length);

      const response = NextResponse.json({
        success: true,
        type: 'site_entry',
        handle: userHandle,
        boaseRewarded: SITE_ENTRY_BOASE_REWARD,
        transactionId: paymentResult.transactionId,
        message: `Welcome! You received ${SITE_ENTRY_BOASE_REWARD} $BOASE`,
      });

      // Set site access cookie
      const isProduction = process.env.NODE_ENV === 'production';
      console.log('[Paywall Pay] Setting cookie, secure:', isProduction, 'NODE_ENV:', process.env.NODE_ENV);

      response.cookies.set('b0ase_site_access', siteAccessJWT, {
        httpOnly: false,  // Must be false so JavaScript can check it
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });

      console.log('[Paywall Pay] Cookie set on response, returning success');
      return response;
    }

    // MODE 2: Content Purchase (with tokenPath)
    const contentToken = await getOrCreateContentToken(tokenPath);
    const priceSats = contentToken.price_sats;
    const priceUSD = priceSats / SATS_PER_USD;

    let paymentResult;
    try {
      paymentResult = await handcashService.sendPayment(authToken, {
        destination: PLATFORM_HANDLE,
        amount: Math.max(0.01, priceUSD),
        currency: 'USD',
        description: `b0ase content token`,
      });
    } catch (error: any) {
      console.error('Content payment failed:', error);
      return NextResponse.json(
        { error: error.message || 'Payment failed', code: 'PAYMENT_FAILED' },
        { status: 400 }
      );
    }

    // Mint content token to user
    await mintTokenToUser(userHandle, tokenPath, priceSats, paymentResult.transactionId);

    // Generate updated token access JWT
    const accessJWT = await generateTokenAccessJWT(userHandle);

    const response = NextResponse.json({
      success: true,
      type: 'content_purchase',
      handle: userHandle,
      tokenId: pathToTokenId(tokenPath),
      tokenPath,
      pricePaid: priceSats,
      transactionId: paymentResult.transactionId,
      message: `You now own ${pathToTokenId(tokenPath)}`,
    });

    response.cookies.set('b0ase_token_access', accessJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
