import { NextResponse } from 'next/server';
import { getTokenStats } from '@/lib/store';
import { TOKEN_CONFIG } from '@/lib/types';
import { FEES, NETWORK_CONFIG, SUPPORTED_ASSETS } from '@/lib/x402';

/**
 * GET /.well-known/x402.json
 *
 * x402 Discovery endpoint - provides all information needed
 * for clients to interact with the PATH402.com facilitator
 */
export async function GET() {
  try {
    const tokenStats = await getTokenStats();

    // Calculate current price using sqrt_decay
    const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply
    const currentPrice = Math.ceil(BASE_PRICE_SATS / Math.sqrt(tokenStats.treasuryBalance + 1));

    return NextResponse.json({
      // x402 Protocol Info
      x402Version: 1,
      facilitator: {
        name: 'PATH402.com',
        description: 'The x402 Notary - Universal payment verification and BSV inscription',
        website: 'https://path402.com',
        documentation: 'https://path402.com/402',
      },

      // Supported Networks
      supportedNetworks: Object.keys(NETWORK_CONFIG),
      supportedSchemes: ['exact', 'upto'],
      supportedAssets: SUPPORTED_ASSETS,

      // API Endpoints (x402 compatible)
      endpoints: {
        verify: 'https://path402.com/api/x402/verify',
        settle: 'https://path402.com/api/x402/settle',
        inscription: 'https://path402.com/api/x402/inscription/:id',
        stats: 'https://path402.com/api/x402/stats',
      },

      // Fee Structure
      fees: {
        verification: {
          amount: FEES.verification,
          currency: 'sats',
          description: 'Fee for verifying payment signature',
        },
        inscription: {
          amount: FEES.inscription,
          currency: 'sats',
          description: 'Fee for inscribing proof on BSV',
        },
        settlement: {
          percent: FEES.settlementPercent * 100,
          minimum: 100,
          currency: 'sats',
          description: 'Percentage fee for settling payments',
        },
      },

      // PATH402.com Token Info
      token: {
        symbol: TOKEN_CONFIG.symbol,
        name: TOKEN_CONFIG.name,
        protocol: TOKEN_CONFIG.protocol,
        inscriptionId: TOKEN_CONFIG.inscriptionId,
        totalSupply: TOKEN_CONFIG.totalSupply,
        decimals: TOKEN_CONFIG.decimals,
        marketUrl: TOKEN_CONFIG.marketUrl,
      },

      // Current Token Pricing (sqrt_decay)
      pricing: {
        model: 'sqrt_decay',
        formula: 'price = 223,610 / sqrt(treasury_remaining + 1)',
        basePriceSats: BASE_PRICE_SATS,
        currentPriceSats: currentPrice,
        treasuryRemaining: tokenStats.treasuryBalance,
      },

      // Token Acquisition Endpoints
      tokenEndpoints: {
        buy: 'https://path402.com/api/token/buy',
        preview: 'https://path402.com/api/token/preview',
        stats: 'https://path402.com/api/token/stats',
        holding: 'https://path402.com/api/token/holding',
      },

      // Shareholder Benefits
      shareholderBenefits: {
        tier1: {
          name: 'Bearer Instrument',
          requirements: ['Hold tokens'],
          benefits: ['Transfer freely', 'Trade on exchanges'],
        },
        tier2: {
          name: 'Registered Shareholder',
          requirements: ['Hold tokens', 'Complete KYC', 'Stake tokens'],
          benefits: ['Quarterly dividends', 'Voting rights', 'Financial reports'],
        },
      },

      // Features
      features: {
        multiChainVerification: true,
        bsvInscription: true,
        crossChainSettlement: true,
        cheapestRouting: true,
        dividendDistribution: true,
      },

      // Legal
      license: 'Open BSV License v4',
      licenseUrl: 'https://github.com/b0ase/path402-com/blob/main/LICENSE',
    });
  } catch (error) {
    console.error('[.well-known/x402.json] Error:', error);
    return NextResponse.json({
      error: 'Failed to generate discovery document',
    }, { status: 500 });
  }
}
