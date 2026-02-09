import { NextResponse } from 'next/server';
import {
  BOASE_TOKEN,
  getBoasePrice,
  getBoaseRemaining,
  getBoaseProgress,
  formatBoasePrice,
  formatBoaseAmount,
  getTokensSold,
  getTreasuryConfig,
} from '@/lib/tokens/boase-config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/buttons/token-supply
 *
 * Returns $BOASE token supply data for bonding curve display.
 * Uses the single source of truth from lib/tokens/boase-config.ts
 *
 * When treasury wallet is configured (BOASE_TREASURY_ADDRESS, BOASE_TOKEN_ID),
 * this reads the actual on-chain balance to determine tokens sold vs remaining.
 */
export async function GET() {
  try {
    const treasuryConfig = getTreasuryConfig();

    // Get tokens sold from blockchain (or 0 if treasury not configured)
    const tokensSold = await getTokensSold();

    const tokensRemaining = getBoaseRemaining(tokensSold);
    const currentPrice = getBoasePrice(tokensSold);
    const progress = getBoaseProgress(tokensSold);

    // Calculate tokens per $0.01 press
    const FIXED_PAYMENT = 0.01;
    const tokensPerPress = Math.max(1, Math.floor(FIXED_PAYMENT / currentPrice));

    const tokenSupply = {
      // Token identity
      tokenName: BOASE_TOKEN.name,
      ticker: BOASE_TOKEN.ticker,
      symbol: BOASE_TOKEN.symbol,

      // Supply data (as strings for bigint serialization)
      totalSupply: BOASE_TOKEN.totalSupply.toString(),
      tokensSold: tokensSold.toString(),
      tokensRemaining: tokensRemaining.toString(),

      // Formatted for display
      totalSupplyFormatted: BOASE_TOKEN.totalSupplyFormatted,
      tokensSoldFormatted: formatBoaseAmount(tokensSold),
      tokensRemainingFormatted: formatBoaseAmount(tokensRemaining),

      // Pricing
      currentPrice,
      currentPriceFormatted: formatBoasePrice(currentPrice),
      tokensPerPress,

      // Progress
      progress,

      // Network info
      network: BOASE_TOKEN.network,
      standard: BOASE_TOKEN.standard,

      // Treasury status
      treasuryConfigured: treasuryConfig.isConfigured,
      treasuryAddress: treasuryConfig.isConfigured ? treasuryConfig.address : null,
    };

    return NextResponse.json(tokenSupply);
  } catch (error: unknown) {
    console.error('[token-supply] Error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
