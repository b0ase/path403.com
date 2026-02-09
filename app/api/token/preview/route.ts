import { NextRequest, NextResponse } from 'next/server';
import { getTokenStats } from '@/lib/store';

// sqrt_decay pricing: price = BASE / sqrt(remaining + 1)
// Price INCREASES as treasury depletes - rewards early buyers
const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply

function calculateSqrtDecayPrice(treasuryRemaining: number): number {
  // price = base / sqrt(remaining + 1)
  // When 500M remain: price ≈ 141 sats (cheap!)
  // When 1 remains: price ≈ 70M sats (expensive!)
  return Math.ceil(BASE_PRICE_SATS / Math.sqrt(treasuryRemaining + 1));
}

function calculateTokensForSpend(treasuryRemaining: number, spendSats: number): {
  tokenCount: number;
  totalCost: number;
  avgPrice: number;
  remainingSats: number;
} {
  let tokenCount = 0;
  let totalCost = 0;

  while (treasuryRemaining - tokenCount > 0) {
    const nextTokenPrice = calculateSqrtDecayPrice(treasuryRemaining - tokenCount);
    if (totalCost + nextTokenPrice > spendSats) {
      break;
    }
    totalCost += nextTokenPrice;
    tokenCount++;
  }

  return {
    tokenCount,
    totalCost,
    avgPrice: tokenCount > 0 ? Math.ceil(totalCost / tokenCount) : 0,
    remainingSats: spendSats - totalCost,
  };
}

// GET /api/token/preview?spendSats=100000000
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spendSats = parseInt(searchParams.get('spendSats') || '0');

    if (!spendSats || spendSats <= 0) {
      return NextResponse.json({ error: 'spendSats required' }, { status: 400 });
    }

    const stats = await getTokenStats();
    const treasuryRemaining = stats.treasuryBalance;
    const currentPrice = calculateSqrtDecayPrice(treasuryRemaining);
    const nextPrice = calculateSqrtDecayPrice(treasuryRemaining - 1); // Price after buying 1

    const result = calculateTokensForSpend(treasuryRemaining, spendSats);

    return NextResponse.json({
      spendSats,
      tokenCount: result.tokenCount,
      totalCost: result.totalCost,
      avgPrice: result.avgPrice,
      remainingSats: result.remainingSats,
      currentPrice, // Price for next token (cheapest available)
      nextPrice, // Price after buying 1 (slightly more expensive)
      treasuryRemaining,
    });
  } catch (error) {
    console.error('Error calculating preview:', error);
    return NextResponse.json({ error: 'Preview calculation failed' }, { status: 500 });
  }
}
