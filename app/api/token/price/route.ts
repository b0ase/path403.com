import { NextRequest, NextResponse } from 'next/server';
import { getTokenStats } from '@/lib/store';

// sqrt_decay pricing: price = BASE / sqrt(supply_sold + 1)
const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply
const INITIAL_TREASURY = 500_000_000;

function calculateSqrtDecayPrice(supplySold: number): number {
  return Math.ceil(BASE_PRICE_SATS / Math.sqrt(supplySold + 1));
}

// For large purchases, use integral approximation instead of loop
function calculateTotalCostFast(currentSupplySold: number, amount: number): { totalSats: number; avgPrice: number } {
  if (amount <= 1000) {
    // For small amounts, calculate exactly
    let totalSats = 0;
    for (let i = 0; i < amount; i++) {
      totalSats += calculateSqrtDecayPrice(currentSupplySold + i);
    }
    return { totalSats, avgPrice: Math.ceil(totalSats / amount) };
  }

  // For large amounts, use integral: ∫ base/sqrt(x+1) dx = 2*base*sqrt(x+1)
  const integralStart = 2 * BASE_PRICE_SATS * Math.sqrt(currentSupplySold + 1);
  const integralEnd = 2 * BASE_PRICE_SATS * Math.sqrt(currentSupplySold + amount + 1);
  const totalSats = Math.ceil(integralEnd - integralStart);

  return { totalSats, avgPrice: Math.ceil(totalSats / amount) };
}

export async function GET(request: NextRequest) {
  try {
    const stats = await getTokenStats();
    const supplySold = INITIAL_TREASURY - stats.treasuryBalance;
    const currentPrice = calculateSqrtDecayPrice(supplySold);

    // Get quote amount from query param
    const url = new URL(request.url);
    const quoteAmount = parseInt(url.searchParams.get('amount') || '1');

    const { totalSats, avgPrice } = calculateTotalCostFast(supplySold, quoteAmount);

    // Price schedule examples
    const priceSchedule = [
      { supplySold: 0, price: calculateSqrtDecayPrice(0) },
      { supplySold: 1_000, price: calculateSqrtDecayPrice(1_000) },
      { supplySold: 10_000, price: calculateSqrtDecayPrice(10_000) },
      { supplySold: 100_000, price: calculateSqrtDecayPrice(100_000) },
      { supplySold: 1_000_000, price: calculateSqrtDecayPrice(1_000_000) },
      { supplySold: 10_000_000, price: calculateSqrtDecayPrice(10_000_000) },
      { supplySold: 100_000_000, price: calculateSqrtDecayPrice(100_000_000) },
      { supplySold: 500_000_000, price: calculateSqrtDecayPrice(500_000_000) },
    ];

    return NextResponse.json({
      pricingModel: 'sqrt_decay',
      formula: 'price = 500 / sqrt(supply_sold + 1)',
      basePriceSats: BASE_PRICE_SATS,
      initialTreasury: INITIAL_TREASURY,

      // Current state
      supplySold,
      treasuryRemaining: stats.treasuryBalance,
      currentPrice,

      // Quote for requested amount
      quote: {
        amount: quoteAmount,
        avgPrice,
        totalSats,
      },

      // Price schedule
      priceSchedule,
    });
  } catch (error) {
    console.error('Error getting price:', error);
    return NextResponse.json({ error: 'Failed to get price' }, { status: 500 });
  }
}
