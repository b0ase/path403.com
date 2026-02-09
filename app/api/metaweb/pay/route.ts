/**
 * MetaWeb Programmatic Payment API
 *
 * Accepts payment proof and returns content + token.
 * Designed for MCP-equipped AI agents and programmatic access.
 *
 * POST /api/metaweb/pay
 * {
 *   "token_address": "$b0ase.com/blog/slug" or "$BOASE",
 *   "payment_method": "handcash",
 *   "payment_proof": { ... } // HandCash auth token or tx proof
 * }
 *
 * Returns:
 * - token: Minted token info
 * - access_jwt: JWT for subsequent access
 * - content_url: URL to fetch content (if applicable)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { handcashService } from '@/lib/handcash-service';
import { createClient } from '@/lib/supabase/server';
import {
  getOrCreateContentToken,
  mintTokenToUser,
  pathToTokenId,
  getOrCreateUserAccount,
} from '@/lib/tokens/content-tokens';
import { generateTokenAccessJWT } from '@/lib/tokens/access';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'token-access-secret'
);

const PLATFORM_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'b0ase';
const SATS_PER_USD = 2500;
const SITE_ENTRY_PRICE_SATS = 25;
const SITE_ENTRY_BOASE_REWARD = 1;

// Generate site access JWT
async function generateSiteAccessJWT(handle: string): Promise<string> {
  const now = Date.now();
  const expiresAt = now + (365 * 24 * 60 * 60 * 1000);

  return new SignJWT({
    handle,
    paidAt: now,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('365d')
    .sign(JWT_SECRET);
}

// Generate payment proof JWT for $ route access
async function generatePaymentProofJWT(
  handle: string,
  tokenAddress: string,
  amountSats: number,
  txHash?: string
): Promise<string> {
  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

  return new SignJWT({
    token_address: tokenAddress,
    payer_handle: handle,
    amount_sats: amountSats,
    tx_hash: txHash,
    issued_at: now,
    expires_at: expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token_address, payment_method, payment_proof } = body;

    if (!token_address) {
      return NextResponse.json(
        { error: 'token_address required', code: 'MISSING_ADDRESS' },
        { status: 400 }
      );
    }

    if (!payment_method || !payment_proof) {
      return NextResponse.json(
        { error: 'payment_method and payment_proof required', code: 'MISSING_PAYMENT' },
        { status: 400 }
      );
    }

    // Currently only support HandCash
    if (payment_method !== 'handcash') {
      return NextResponse.json(
        { error: 'Only handcash payment method currently supported', code: 'UNSUPPORTED_METHOD' },
        { status: 400 }
      );
    }

    // Extract auth token from payment proof
    const authToken = payment_proof.auth_token;
    if (!authToken) {
      return NextResponse.json(
        { error: 'payment_proof.auth_token required for HandCash', code: 'MISSING_AUTH_TOKEN' },
        { status: 400 }
      );
    }

    // Verify HandCash session and get user profile
    let userProfile;
    try {
      userProfile = await handcashService.getUserProfile(authToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid HandCash auth token', code: 'INVALID_AUTH' },
        { status: 401 }
      );
    }

    const userHandle = userProfile.handle;

    // Determine if this is site entry or content purchase
    const isSiteEntry = token_address === '$BOASE' || token_address === '$boase';

    if (isSiteEntry) {
      // SITE ENTRY PAYMENT
      const priceUSD = SITE_ENTRY_PRICE_SATS / SATS_PER_USD;

      let paymentResult;
      try {
        paymentResult = await handcashService.sendPayment(authToken, {
          destination: PLATFORM_HANDLE,
          amount: Math.max(0.01, priceUSD),
          currency: 'USD',
          description: `b0ase +${SITE_ENTRY_BOASE_REWARD} $BOASE`,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Payment failed', code: 'PAYMENT_FAILED' },
          { status: 402 }
        );
      }

      // Credit $BOASE token
      const user = await getOrCreateUserAccount(userHandle);
      const supabase = await createClient();

      // Ensure $BOASE token exists
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
          price_sats: SITE_ENTRY_PRICE_SATS,
        });
      }

      // Credit user balance
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
          acquisition_price_sats: SITE_ENTRY_PRICE_SATS,
        });
      }

      // Record transaction
      await supabase.from('token_transactions').insert({
        token_id: '$BOASE',
        from_user_id: null,
        to_user_id: user.id,
        amount: SITE_ENTRY_BOASE_REWARD,
        price_sats: SITE_ENTRY_PRICE_SATS,
        tx_type: 'mint',
        handcash_tx_id: paymentResult.transactionId,
      });

      // Generate access JWT
      const siteAccessJWT = await generateSiteAccessJWT(userHandle);
      // Generate payment proof for $ route access
      const paymentProof = await generatePaymentProofJWT(
        userHandle,
        '$BOASE',
        SITE_ENTRY_PRICE_SATS,
        paymentResult.transactionId
      );

      return NextResponse.json({
        success: true,
        type: 'site_entry',
        token: {
          address: '$BOASE',
          balance: (existingBalance?.balance || 0) + SITE_ENTRY_BOASE_REWARD,
          price_paid_sats: SITE_ENTRY_PRICE_SATS,
        },
        access_jwt: siteAccessJWT,
        payment_proof: paymentProof, // JWT for X-Payment-Proof header
        access_cookie: 'b0ase_site_access',
        transaction_id: paymentResult.transactionId,
        user_handle: userHandle,
        message: `Welcome! You received ${SITE_ENTRY_BOASE_REWARD} $BOASE`,
      });

    } else {
      // CONTENT TOKEN PURCHASE
      // Extract path from address: $b0ase.com/blog/slug -> /blog/slug
      const pathMatch = token_address.match(/\$b0ase\.com(\/.*)/);
      if (!pathMatch) {
        return NextResponse.json(
          { error: 'Invalid token address format', code: 'INVALID_ADDRESS' },
          { status: 400 }
        );
      }

      const contentPath = pathMatch[1];
      const contentToken = await getOrCreateContentToken(contentPath);
      const priceSats = contentToken.price_sats;
      const priceUSD = priceSats / SATS_PER_USD;

      let paymentResult;
      try {
        paymentResult = await handcashService.sendPayment(authToken, {
          destination: PLATFORM_HANDLE,
          amount: Math.max(0.01, priceUSD),
          currency: 'USD',
          description: 'b0ase content token',
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Payment failed', code: 'PAYMENT_FAILED' },
          { status: 402 }
        );
      }

      // Mint token to user
      await mintTokenToUser(userHandle, contentPath, priceSats, paymentResult.transactionId);

      // Generate updated token access JWT
      const accessJWT = await generateTokenAccessJWT(userHandle);
      // Generate payment proof for $ route access
      const paymentProof = await generatePaymentProofJWT(
        userHandle,
        token_address,
        priceSats,
        paymentResult.transactionId
      );

      return NextResponse.json({
        success: true,
        type: 'content_purchase',
        token: {
          address: token_address,
          token_id: pathToTokenId(contentPath),
          path: contentPath,
          price_paid_sats: priceSats,
        },
        access_jwt: accessJWT,
        payment_proof: paymentProof, // JWT for X-Payment-Proof header
        access_cookie: 'b0ase_token_access',
        content_url: contentPath,
        dollar_route: `/$${token_address.slice(1)}`, // Access via $ route with payment proof
        transaction_id: paymentResult.transactionId,
        user_handle: userHandle,
        message: `You now own ${token_address}`,
      });
    }

  } catch (error: any) {
    console.error('MetaWeb pay error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed', code: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check payment status
export async function GET(req: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/metaweb/pay',
    methods: ['POST'],
    description: 'MetaWeb programmatic payment endpoint for AI agents and MCP clients',
    usage: {
      method: 'POST',
      body: {
        token_address: '$BOASE or $b0ase.com/path',
        payment_method: 'handcash',
        payment_proof: {
          auth_token: 'your-handcash-auth-token',
        },
      },
    },
    supported_tokens: ['$BOASE', '$b0ase.com/*'],
    supported_methods: ['handcash'],
  });
}
