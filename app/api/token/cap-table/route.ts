import { NextResponse } from 'next/server';
import { getCapTable, getTokenStats } from '@/lib/store';
import { supabase, isDbConnected } from '@/lib/supabase';

interface CapTableEntry {
  handle: string;
  kycName?: string;
  tokensStaked: number;
  percentage: number;
  stakedAt: string;
  address?: string;
  isStaker: boolean;
}

export async function GET() {
  try {
    const stats = await getTokenStats();

    // Get staked holders from cap_table (with KYC)
    let stakedEntries: CapTableEntry[] = [];

    if (isDbConnected() && supabase) {
      const { data: capTableData } = await supabase
        .from('cap_table')
        .select(`
          handle,
          kyc_name,
          tokens_staked,
          added_at,
          stakes!inner (status),
          user_wallets!inner (address)
        `)
        .is('removed_at', null)
        .eq('stakes.status', 'active')
        .order('tokens_staked', { ascending: false });

      if (capTableData) {
        const totalStaked = stats.totalStaked || 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stakedEntries = capTableData.map((entry: any) => ({
          handle: entry.handle,
          kycName: entry.kyc_name,
          tokensStaked: entry.tokens_staked,
          percentage: (entry.tokens_staked / totalStaked) * 100,
          stakedAt: entry.added_at,
          address: Array.isArray(entry.user_wallets)
            ? entry.user_wallets[0]?.address
            : entry.user_wallets?.address,
          isStaker: true,
        }));
      }
    }

    // Get all holders (for total holdings view)
    const allHolders = await getCapTable();

    // Merge: stakers get KYC names, non-stakers just show handle
    const mergedEntries = allHolders.map(holder => {
      const stakedEntry = stakedEntries.find(
        s => s.handle === holder.handle || s.address === holder.address
      );

      if (stakedEntry) {
        return {
          ...holder,
          kycName: stakedEntry.kycName,
          tokensStaked: stakedEntry.tokensStaked,
          stakedAt: stakedEntry.stakedAt,
          isStaker: true,
        };
      }

      return {
        ...holder,
        isStaker: false,
      };
    });

    // Sort: stakers first, then by balance
    mergedEntries.sort((a, b) => {
      if (a.isStaker && !b.isStaker) return -1;
      if (!a.isStaker && b.isStaker) return 1;
      return b.balance - a.balance;
    });

    return NextResponse.json({
      holders: mergedEntries,
      stakedHolders: stakedEntries,
      stats: {
        totalHolders: stats.totalHolders,
        totalCirculating: stats.totalCirculating,
        totalStaked: stats.totalStaked,
        treasuryBalance: stats.treasuryBalance,
        stakedHolderCount: stakedEntries.length,
      },
    });
  } catch (error) {
    console.error('Error getting cap table:', error);
    return NextResponse.json({ error: 'Failed to get cap table' }, { status: 500 });
  }
}
