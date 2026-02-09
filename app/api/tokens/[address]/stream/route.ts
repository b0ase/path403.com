import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getToken } from '@/lib/tokens';
import { verifyBsvPaymentTx } from '@/lib/bsv-verify';
import { PAYMENT_ADDRESS } from '@/lib/store';
import type { UsagePricing, AccessMode } from '@/lib/tokens/types';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function normalizeUsagePricing(pricing?: UsagePricing | null): UsagePricing | null {
  if (!pricing) return null;
  if (pricing.enabled === false) return null;
  if (!pricing.unit_ms || !pricing.price_sats_per_unit) return null;
  return pricing;
}

function requiresToken(accessMode?: AccessMode | null): boolean {
  return accessMode === 'token' || accessMode === 'hybrid';
}

// GET /api/tokens/[address]/stream
// Returns current access window for a viewer (if any)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    if (!handle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { address: encodedAddress } = await params;
    const address = decodeURIComponent(encodedAddress);

    const token = await getToken(address);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const supabase = getSupabase();
    const { data: session } = await supabase
      .from('token_usage_sessions')
      .select('id, expires_at, total_paid_sats')
      .eq('token_address', address)
      .eq('viewer_handle', handle)
      .single();

    const now = new Date();
    const expiresAt = session?.expires_at ? new Date(session.expires_at) : null;
    const active = expiresAt ? expiresAt.getTime() > now.getTime() : false;

    return NextResponse.json({
      token: {
        address: token.address,
        access_mode: token.access_mode || 'token',
      },
      active,
      expires_at: session?.expires_at || null,
      total_paid_sats: session?.total_paid_sats || 0,
      usage_pricing: token.usage_pricing || null,
    });
  } catch (error) {
    console.error('[/api/tokens/[address]/stream GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stream access' }, { status: 500 });
  }
}

// POST /api/tokens/[address]/stream
// Verify BSV payment + extend usage window
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    if (!handle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { address: encodedAddress } = await params;
    const address = decodeURIComponent(encodedAddress);
    const token = await getToken(address);

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const usagePricing = normalizeUsagePricing(token.usage_pricing);
    if (!usagePricing) {
      return NextResponse.json({
        error: 'Usage pricing not enabled for this token',
      }, { status: 400 });
    }

    const accessMode = token.access_mode || 'token';
    if (usagePricing.accepted_networks && !usagePricing.accepted_networks.includes('bsv')) {
      return NextResponse.json({
        error: 'BSV not accepted for usage payments',
      }, { status: 400 });
    }

    const body = await request.json();
    let { payment_tx_id } = body;

    if (!payment_tx_id) {
      payment_tx_id = request.headers.get('x-bsv-payment-txid');
    }

    const minPayment = usagePricing.min_payment_sats || usagePricing.price_sats_per_unit;
    const recipient = usagePricing.payment_address || token.issuer_address || PAYMENT_ADDRESS;

    if (!payment_tx_id) {
      return NextResponse.json({
        error: 'Payment required',
        details: 'Provide payment_tx_id for BSV verification',
      }, {
        status: 402,
        headers: {
          'x-bsv-payment-amount': minPayment.toString(),
          'x-bsv-payment-destination': recipient,
          'x-bsv-payment-desc': `Stream access for ${token.address} (${usagePricing.unit_ms}ms block)`,
          'content-type': 'application/json'
        }
      });
    }

    const supabase = getSupabase();

    if (requiresToken(accessMode)) {
      const { data: holding } = await supabase
        .from('token_holdings')
        .select('balance')
        .eq('token_address', address)
        .eq('holder_handle', handle)
        .single();

      if (!holding || holding.balance <= 0) {
        return NextResponse.json({
          error: 'Token required',
          details: 'You must hold this token to use streaming access.',
        }, { status: 402 });
      }
    }

    const verification = await verifyBsvPaymentTx({
      txId: payment_tx_id,
      expectedAddress: recipient,
      minSats: minPayment,
    });

    if (!verification.valid) {
      return NextResponse.json({
        error: 'Payment verification failed',
        details: 'Transaction not found or amount too low',
      }, { status: 400 });
    }

    if (usagePricing.max_payment_sats && verification.paidSats > usagePricing.max_payment_sats) {
      return NextResponse.json({
        error: 'Payment too large',
        details: `Max payment is ${usagePricing.max_payment_sats} sats`,
      }, { status: 400 });
    }

    const grantMs = Math.floor(verification.paidSats / usagePricing.price_sats_per_unit) * usagePricing.unit_ms;
    if (grantMs <= 0) {
      return NextResponse.json({
        error: 'Payment too small for any access window',
      }, { status: 400 });
    }

    const now = new Date();

    const { data: existing } = await supabase
      .from('token_usage_sessions')
      .select('id, expires_at, total_paid_sats')
      .eq('token_address', address)
      .eq('viewer_handle', handle)
      .single();

    const currentExpires = existing?.expires_at ? new Date(existing.expires_at) : null;
    const baseTime = currentExpires && currentExpires > now ? currentExpires : now;
    let newExpires = new Date(baseTime.getTime() + grantMs);

    if (usagePricing.prepay_ms) {
      const cap = new Date(now.getTime() + usagePricing.prepay_ms);
      if (newExpires > cap) {
        newExpires = cap;
      }
    }

    if (existing?.id) {
      await supabase
        .from('token_usage_sessions')
        .update({
          expires_at: newExpires.toISOString(),
          last_payment_tx_id: payment_tx_id,
          total_paid_sats: (existing.total_paid_sats || 0) + verification.paidSats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('token_usage_sessions')
        .insert({
          token_address: address,
          viewer_handle: handle,
          expires_at: newExpires.toISOString(),
          last_payment_tx_id: payment_tx_id,
          total_paid_sats: verification.paidSats,
        });
    }

    // Log payment for audit/dividend accounting
    await supabase.from('token_usage_payments').insert({
      token_address: address,
      viewer_handle: handle,
      payment_tx_id,
      paid_sats: verification.paidSats,
      unit_ms: usagePricing.unit_ms,
      price_sats_per_unit: usagePricing.price_sats_per_unit,
      grant_ms: grantMs,
      expires_at: newExpires.toISOString(),
    });

    return NextResponse.json({
      success: true,
      token: {
        address: token.address,
        access_mode: accessMode,
      },
      paid_sats: verification.paidSats,
      grant_ms: grantMs,
      expires_at: newExpires.toISOString(),
      usage_pricing: usagePricing,
      grace_ms: usagePricing.grace_ms || 0,
    });
  } catch (error) {
    console.error('[/api/tokens/[address]/stream POST] Error:', error);
    return NextResponse.json({ error: 'Failed to process stream payment' }, { status: 500 });
  }
}
