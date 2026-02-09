import { NextRequest, NextResponse } from 'next/server';
import { fetchVaultBalance } from '@/lib/custody/vault-balance';

/**
 * GET /api/custody/balance
 *
 * Fetch BSV and token balances for a vault address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({
        error: 'Address parameter required'
      }, { status: 400 });
    }

    // Validate BSV address format (basic check)
    if (!address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      return NextResponse.json({
        error: 'Invalid BSV address format'
      }, { status: 400 });
    }

    const balance = await fetchVaultBalance(address);

    return NextResponse.json({
      ...balance,
      lastUpdated: balance.lastUpdated.toISOString()
    });

  } catch (error) {
    console.error('[custody/balance] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch balance'
    }, { status: 500 });
  }
}
