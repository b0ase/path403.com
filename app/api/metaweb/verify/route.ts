/**
 * MetaWeb Payment Proof Verification API
 *
 * Verifies payment proof JWTs for $ route access.
 *
 * GET /api/metaweb/verify?proof=JWT&token=ADDRESS
 * POST /api/metaweb/verify
 * {
 *   "payment_proof": "JWT",
 *   "token_address": "$b0ase.com/blog/slug"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'token-access-secret'
);

interface PaymentProofPayload {
  token_address: string;
  payer_handle: string;
  amount_sats: number;
  tx_hash?: string;
  issued_at: number;
  expires_at: number;
}

async function verifyProof(proof: string): Promise<{ valid: boolean; payload?: PaymentProofPayload; error?: string }> {
  try {
    const { payload } = await jwtVerify(proof, JWT_SECRET);
    const data = payload as unknown as PaymentProofPayload;

    // Check expiry
    if (data.expires_at < Date.now()) {
      return { valid: false, error: 'Payment proof expired' };
    }

    return { valid: true, payload: data };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Invalid payment proof' };
  }
}

export async function GET(req: NextRequest) {
  const proof = req.nextUrl.searchParams.get('proof');
  const tokenAddress = req.nextUrl.searchParams.get('token');

  if (!proof) {
    return NextResponse.json(
      { valid: false, error: 'proof parameter required' },
      { status: 400 }
    );
  }

  const result = await verifyProof(proof);

  if (!result.valid) {
    return NextResponse.json(
      { valid: false, error: result.error },
      { status: 401 }
    );
  }

  // If token address provided, verify it matches
  if (tokenAddress && result.payload?.token_address !== tokenAddress) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Token address mismatch',
        expected: tokenAddress,
        actual: result.payload?.token_address,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    token_address: result.payload?.token_address,
    payer_handle: result.payload?.payer_handle,
    amount_sats: result.payload?.amount_sats,
    tx_hash: result.payload?.tx_hash,
    issued_at: result.payload?.issued_at,
    expires_at: result.payload?.expires_at,
    remaining_ms: result.payload ? result.payload.expires_at - Date.now() : 0,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_proof, token_address } = body;

    if (!payment_proof) {
      return NextResponse.json(
        { valid: false, error: 'payment_proof required' },
        { status: 400 }
      );
    }

    const result = await verifyProof(payment_proof);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 401 }
      );
    }

    // If token address provided, verify it matches
    if (token_address && result.payload?.token_address !== token_address) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token address mismatch',
          expected: token_address,
          actual: result.payload?.token_address,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      token_address: result.payload?.token_address,
      payer_handle: result.payload?.payer_handle,
      amount_sats: result.payload?.amount_sats,
      tx_hash: result.payload?.tx_hash,
      issued_at: result.payload?.issued_at,
      expires_at: result.payload?.expires_at,
      remaining_ms: result.payload ? result.payload.expires_at - Date.now() : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || 'Invalid request' },
      { status: 400 }
    );
  }
}
