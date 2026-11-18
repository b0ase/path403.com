import { retired } from '@/lib/retired';
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

// RETIRED 18 Nov 2026 (security): POST trusted an unauthenticated x-wallet-handle header. 410 only.
export const POST = retired;
