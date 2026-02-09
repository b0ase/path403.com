import { NextResponse } from 'next/server';
import { getInscriptionStats, FEES, NETWORK_CONFIG } from '@/lib/x402';

/**
 * GET /api/x402/stats
 *
 * Get x402 facilitator statistics
 */
export async function GET() {
  try {
    const stats = await getInscriptionStats();

    return NextResponse.json({
      facilitator: 'PATH402.com',
      version: '1.0.0',
      status: 'operational',
      stats: {
        totalInscriptions: stats.totalInscriptions,
        totalFeesCollected: stats.totalFees,
        byOriginChain: stats.byChain,
      },
      supportedNetworks: Object.entries(NETWORK_CONFIG).map(([key, config]) => ({
        network: key,
        name: config.name,
        chainId: config.chainId,
        explorerUrl: config.explorerUrl,
      })),
      fees: {
        verification: {
          amount: FEES.verification,
          currency: 'sats',
        },
        inscription: {
          amount: FEES.inscription,
          currency: 'sats',
        },
        settlement: {
          percent: FEES.settlementPercent * 100,
          minimum: 100,
          currency: 'sats',
        },
      },
      endpoints: {
        verify: '/api/x402/verify',
        settle: '/api/x402/settle',
        inscription: '/api/x402/inscription/:id',
        stats: '/api/x402/stats',
        discovery: '/.well-known/x402.json',
      },
    });
  } catch (error) {
    console.error('[x402/stats] Error:', error);
    return NextResponse.json({
      error: 'Failed to get stats',
    }, { status: 500 });
  }
}
