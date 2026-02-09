import { NextResponse } from 'next/server';
import { getTokenStats } from '@/lib/store';

// sqrt_decay pricing: price = BASE / sqrt(remaining + 1)
// Price INCREASES as treasury depletes - rewards early buyers
const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply

function calculateSqrtDecayPrice(treasuryRemaining: number): number {
  return Math.ceil(BASE_PRICE_SATS / Math.sqrt(treasuryRemaining + 1));
}

export async function GET() {
  try {
    const stats = await getTokenStats();
    const treasuryRemaining = stats.treasuryBalance;
    const currentPrice = calculateSqrtDecayPrice(treasuryRemaining);

    return NextResponse.json({
      ...stats,
      currentPrice,
    });
  } catch (error) {
    console.error('Error getting token stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
