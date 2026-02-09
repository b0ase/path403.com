import { NextRequest, NextResponse } from 'next/server';
import { getHolder, getPendingDividends, getTotalDividendsEarned } from '@/lib/store';
import { getOnChainBalance } from '@/lib/bsv20';
import { supabase, isDbConnected } from '@/lib/supabase';

// Get tracked transfers (for when indexer is slow)
async function getTrackedTransferBalance(holderId: string, toAddress: string): Promise<number> {
  if (!isDbConnected() || !supabase) return 0;

  const { data: transfers } = await supabase
    .from('path402_transfers')
    .select('amount')
    .eq('holder_id', holderId)
    .eq('to_address', toAddress)
    .eq('status', 'confirmed');

  if (!transfers) return 0;
  return transfers.reduce((sum, t) => sum + (t.amount || 0), 0);
}

export async function GET(request: NextRequest) {
  try {
    // Check headers first (for Yours wallet)
    const address = request.headers.get('x-wallet-address');
    let handle = request.headers.get('x-wallet-handle');

    // Then check cookies (for HandCash)
    if (!address && !handle) {
      handle = request.cookies.get('hc_handle')?.value || null;
    }

    const holder = await getHolder(address || undefined, handle || undefined);

    // Get on-chain balance if user has a derived ordinals address
    let onChainBalance = 0;
    let trackedTransferBalance = 0;
    let ordinalsAddress: string | null = null;

    if (handle && isDbConnected() && supabase) {
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('address')
        .ilike('handle', handle)
        .single();

      if (wallet?.address) {
        ordinalsAddress = wallet.address;

        // Try on-chain balance from indexer
        onChainBalance = await getOnChainBalance(wallet.address);

        // If indexer returns 0, check our tracked transfers
        if (onChainBalance === 0 && holder) {
          trackedTransferBalance = await getTrackedTransferBalance(holder.id, wallet.address);
        }
      }
    }

    // Also check by direct address for Yours wallet users
    if (!ordinalsAddress && address) {
      onChainBalance = await getOnChainBalance(address);
      ordinalsAddress = address;
    }

    // On-chain = max of indexer balance or our tracked transfers
    const effectiveOnChainBalance = Math.max(onChainBalance, trackedTransferBalance);
    const dbBalance = holder?.balance || 0;
    const totalBalance = dbBalance + effectiveOnChainBalance;

    if (!holder && effectiveOnChainBalance === 0) {
      return NextResponse.json({
        balance: 0,
        onChainBalance: 0,
        dbBalance: 0,
        ordinalsAddress: null,
        stakedBalance: 0,
        availableBalance: 0,
        pendingDividends: 0,
        totalDividendsEarned: 0,
      });
    }

    return NextResponse.json({
      balance: totalBalance,
      onChainBalance: effectiveOnChainBalance,
      dbBalance,
      ordinalsAddress,
      stakedBalance: holder?.stakedBalance || 0,
      availableBalance: totalBalance - (holder?.stakedBalance || 0),
      pendingDividends: holder ? await getPendingDividends(holder.id) : 0,
      totalDividendsEarned: holder ? await getTotalDividendsEarned(holder.id) : 0,
    });
  } catch (error) {
    console.error('Error getting holding:', error);
    return NextResponse.json({ error: 'Failed to get holding' }, { status: 500 });
  }
}
