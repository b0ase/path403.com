import { NextResponse } from 'next/server';
import { getOnChainState, compareWithDatabase } from '@/lib/bsv20';
import { getAllHolders } from '@/lib/store';

// GET /api/token/onchain - Get on-chain token state and compare with database
export async function GET() {
  try {
    // Get on-chain state
    const onChainState = await getOnChainState();

    // Get database holders for comparison
    const dbHolders = await getAllHolders();
    const dbHoldersForComparison = dbHolders
      .filter(h => h.address && h.address !== 'operator')
      .map(h => ({
        address: h.ordinalsAddress || h.address,
        balance: h.balance,
      }));

    // Compare states
    const comparison = await compareWithDatabase(dbHoldersForComparison);

    return NextResponse.json({
      onChain: {
        treasuryAddress: onChainState.treasuryAddress,
        treasuryBalance: onChainState.treasuryBalance,
        circulatingSupply: onChainState.circulatingSupply,
        holders: onChainState.holders,
        totalHolders: onChainState.holders.length,
      },
      database: {
        holders: dbHoldersForComparison,
        totalHolders: dbHoldersForComparison.length,
        totalCirculating: dbHoldersForComparison.reduce((sum, h) => sum + h.balance, 0),
      },
      comparison: {
        inSync: comparison.inSync,
        discrepancies: comparison.discrepancies,
      },
      warning: comparison.inSync
        ? null
        : 'Database and on-chain state are out of sync. On-chain is the source of truth.',
    });
  } catch (error) {
    console.error('Error fetching on-chain state:', error);
    return NextResponse.json({ error: 'Failed to fetch on-chain state' }, { status: 500 });
  }
}
