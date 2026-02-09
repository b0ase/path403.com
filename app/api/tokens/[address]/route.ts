import { NextRequest, NextResponse } from 'next/server';
import {
  getToken,
  acquireTokens,
  generatePriceSchedule,
  PricingModel,
  calculateTotalCost,
  calculateTokensForSpend,
} from '@/lib/tokens';
import { verifyBsvPaymentTx } from '@/lib/bsv-verify';
import { PAYMENT_ADDRESS } from '@/lib/store';

/**
 * GET /api/tokens/[address]
 *
 * Get token details including price schedule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: encodedAddress } = await params;
    // Decode the address ($ becomes %24 in URLs)
    const address = decodeURIComponent(encodedAddress);

    const token = await getToken(address);

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Generate price schedule
    const priceSchedule = generatePriceSchedule(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      500_000_000 // Initial treasury
    );

    return NextResponse.json({
      token,
      price_schedule: priceSchedule,
    });
  } catch (error) {
    console.error('[/api/tokens/[address] GET] Error:', error);
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
}

/**
 * POST /api/tokens/[address]
 *
 * Acquire tokens
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: encodedAddress } = await params;
    const address = decodeURIComponent(encodedAddress);

    // Get buyer from auth headers
    const buyerHandle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!buyerHandle || !provider) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = await getToken(address);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const body = await request.json();
    let { amount, spend_sats, payment_tx_id } = body;

    if (!payment_tx_id) {
      payment_tx_id = request.headers.get('x-bsv-payment-txid');
    }

    if (!amount && !spend_sats) {
      return NextResponse.json({ error: 'Specify amount or spend_sats' }, { status: 400 });
    }

    // Compute expected cost and amount
    let tokenAmount: number;
    let totalCostSats: number;

    if (spend_sats) {
      const result = calculateTokensForSpend(
        token.pricing_model as PricingModel,
        token.base_price_sats,
        token.treasury_balance,
        parseInt(spend_sats)
      );
      tokenAmount = result.tokenCount;
      totalCostSats = result.totalCost;
    } else {
      tokenAmount = parseInt(amount);
      const result = calculateTotalCost(
        token.pricing_model as PricingModel,
        token.base_price_sats,
        token.treasury_balance,
        tokenAmount
      );
      totalCostSats = result.totalSats;
    }

    if (!payment_tx_id) {
      const recipient = token.issuer_address || PAYMENT_ADDRESS;
      return NextResponse.json({
        error: 'Payment required',
        details: 'Provide payment_tx_id for on-chain verification',
      }, {
        status: 402,
        headers: {
          'x-bsv-payment-amount': totalCostSats.toString(),
          'x-bsv-payment-destination': recipient,
          'x-bsv-payment-desc': `Purchase ${tokenAmount} ${token.name || token.address}`,
          'content-type': 'application/json'
        }
      });
    }

    const recipient = token.issuer_address || PAYMENT_ADDRESS;
    const verification = await verifyBsvPaymentTx({
      txId: payment_tx_id,
      expectedAddress: recipient,
      minSats: totalCostSats,
    });

    if (!verification.valid) {
      return NextResponse.json({
        error: 'Payment verification failed',
        details: 'Transaction not found or amount too low',
      }, { status: 400 });
    }

    const result = await acquireTokens(address, buyerHandle, {
      amount: tokenAmount,
      spendSats: spend_sats ? parseInt(spend_sats) : undefined,
      paymentTxId: payment_tx_id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/tokens/[address] POST] Error:', error);
    return NextResponse.json({ error: 'Failed to acquire tokens' }, { status: 500 });
  }
}
