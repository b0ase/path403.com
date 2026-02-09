// Token store with Supabase persistence
// Falls back to in-memory if database not configured

import type { TokenHolder, TokenPurchase, Stake, Dividend, DividendClaim } from './types';
import { TOKEN_CONFIG } from './types';
import { supabase, isDbConnected } from './supabase';

// In-memory fallback storage
const memoryStore = {
  holders: new Map<string, TokenHolder>(),
  purchases: [] as TokenPurchase[],
  stakes: [] as Stake[],
  dividends: [] as Dividend[],
};

// Treasury config
const TREASURY_ADDRESS = (process.env.TREASURY_ADDRESS || '1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1').trim();
export const PAYMENT_ADDRESS = TREASURY_ADDRESS;
// HandCash requires paymail/handle, not raw addresses
export const TREASURY_PAYMAIL = (process.env.TREASURY_PAYMAIL || 'boase@handcash.io').trim();

// Helper to generate IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================================
// HOLDER OPERATIONS
// ============================================================================

export async function getOrCreateHolder(
  address: string,
  provider: 'yours' | 'handcash',
  ordinalsAddress?: string,
  handle?: string
): Promise<TokenHolder> {
  if (isDbConnected() && supabase) {
    // Try to find existing holder
    const { data: existing } = await supabase
      .from('path402_holders')
      .select('*')
      .eq('provider', provider)
      .eq(provider === 'handcash' ? 'handle' : 'address', provider === 'handcash' ? handle : address)
      .single();

    if (existing) {
      return {
        id: existing.id,
        address: existing.address || '',
        ordinalsAddress: existing.ordinals_address,
        handle: existing.handle,
        provider: existing.provider,
        balance: existing.balance,
        stakedBalance: existing.staked_balance,
        totalPurchased: existing.total_purchased,
        totalWithdrawn: existing.total_withdrawn,
        totalDividends: existing.total_dividends,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      };
    }

    // Create new holder
    const { data: newHolder, error } = await supabase
      .from('path402_holders')
      .insert({
        address,
        ordinals_address: ordinalsAddress,
        handle,
        provider,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newHolder.id,
      address: newHolder.address || '',
      ordinalsAddress: newHolder.ordinals_address,
      handle: newHolder.handle,
      provider: newHolder.provider,
      balance: newHolder.balance,
      stakedBalance: newHolder.staked_balance,
      totalPurchased: newHolder.total_purchased,
      totalWithdrawn: newHolder.total_withdrawn,
      totalDividends: newHolder.total_dividends,
      createdAt: newHolder.created_at,
      updatedAt: newHolder.updated_at,
    };
  }

  // In-memory fallback
  const key = provider === 'handcash' ? `handcash:${handle}` : `ord:${address}`;

  if (!memoryStore.holders.has(key)) {
    const holder: TokenHolder = {
      id: generateId(),
      address,
      ordinalsAddress,
      handle,
      provider,
      balance: 0,
      stakedBalance: 0,
      totalPurchased: 0,
      totalWithdrawn: 0,
      totalDividends: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.holders.set(key, holder);
  }

  return memoryStore.holders.get(key)!;
}

export async function getHolder(address?: string, handle?: string): Promise<TokenHolder | null> {
  if (isDbConnected() && supabase) {
    let query = supabase.from('path402_holders').select('*');

    if (handle) {
      query = query.eq('handle', handle);
    } else if (address) {
      query = query.eq('address', address);
    } else {
      return null;
    }

    const { data } = await query.single();

    if (!data) return null;

    return {
      id: data.id,
      address: data.address || '',
      ordinalsAddress: data.ordinals_address,
      handle: data.handle,
      provider: data.provider,
      balance: data.balance,
      stakedBalance: data.staked_balance,
      totalPurchased: data.total_purchased,
      totalWithdrawn: data.total_withdrawn,
      totalDividends: data.total_dividends,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // In-memory fallback
  if (handle) {
    return memoryStore.holders.get(`handcash:${handle}`) || null;
  }
  if (address) {
    return memoryStore.holders.get(`ord:${address}`) || null;
  }
  return null;
}

export async function getAllHolders(): Promise<TokenHolder[]> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('path402_holders')
      .select('*')
      .gt('balance', 0)
      .order('balance', { ascending: false });

    return (data || []).map((h) => ({
      id: h.id,
      address: h.address || '',
      ordinalsAddress: h.ordinals_address,
      handle: h.handle,
      provider: h.provider,
      balance: h.balance,
      stakedBalance: h.staked_balance,
      totalPurchased: h.total_purchased,
      totalWithdrawn: h.total_withdrawn,
      totalDividends: h.total_dividends,
      createdAt: h.created_at,
      updatedAt: h.updated_at,
    }));
  }

  return Array.from(memoryStore.holders.values());
}

// Update holder balance (for withdrawals)
export async function updateHolderBalance(holderId: string, delta: number): Promise<boolean> {
  if (isDbConnected() && supabase) {
    // Get current balance
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('balance')
      .eq('id', holderId)
      .single();

    if (!holder) return false;

    const newBalance = Math.max(0, holder.balance + delta);

    const { error } = await supabase
      .from('path402_holders')
      .update({
        balance: newBalance,
        total_withdrawn: delta < 0 ? supabase.rpc('increment', { x: -delta }) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', holderId);

    return !error;
  }

  // Memory fallback
  for (const [key, holder] of memoryStore.holders) {
    if (holder.id === holderId) {
      holder.balance = Math.max(0, holder.balance + delta);
      if (delta < 0) {
        holder.totalWithdrawn = (holder.totalWithdrawn || 0) + (-delta);
      }
      memoryStore.holders.set(key, holder);
      return true;
    }
  }
  return false;
}

// ============================================================================
// TOKEN STATS
// ============================================================================

// Only 500M tokens are for sale from treasury
const TREASURY_FOR_SALE = 500_000_000;

export async function getTokenStats() {
  if (isDbConnected() && supabase) {
    // Get all holders EXCEPT the treasury/operator (address = 'operator')
    const { data: holders } = await supabase
      .from('path402_holders')
      .select('balance, staked_balance, address');

    const allHolders = holders || [];

    // Separate treasury holder from regular holders
    const regularHolders = allHolders.filter(h => h.address !== 'operator');

    // Calculate from holder balances (single source of truth)
    const totalCirculating = regularHolders.reduce((sum, h) => sum + (h.balance || 0), 0);
    const totalStaked = regularHolders.reduce((sum, h) => sum + (h.staked_balance || 0), 0);

    // Treasury balance = 500M for sale - what's been sold (circulating to non-treasury)
    const treasuryBalance = Math.max(0, TREASURY_FOR_SALE - totalCirculating);

    return {
      totalHolders: regularHolders.filter((h) => h.balance > 0).length,
      totalStaked,
      totalCirculating,
      treasuryBalance,
      totalSold: totalCirculating,
      totalRevenue: 0,
    };
  }

  // In-memory fallback
  const allHolders = Array.from(memoryStore.holders.values());
  const totalStaked = allHolders.reduce((sum, h) => sum + h.stakedBalance, 0);
  const totalCirculating = allHolders.reduce((sum, h) => sum + h.balance, 0);

  return {
    totalHolders: allHolders.filter((h) => h.balance > 0).length,
    totalStaked,
    totalCirculating,
    treasuryBalance: TOKEN_CONFIG.totalSupply - totalCirculating,
    totalSold: totalCirculating,
    totalRevenue: totalCirculating, // 1 sat per token
  };
}

// ============================================================================
// PURCHASE OPERATIONS
// ============================================================================

export async function createPurchase(
  holderId: string,
  amount: number,
  priceSats: number
): Promise<TokenPurchase> {
  const purchase: TokenPurchase = {
    id: generateId(),
    holderId,
    amount,
    priceSats,
    totalPaidSats: amount * priceSats,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isDbConnected() && supabase) {
    const { data, error } = await supabase
      .from('path402_purchases')
      .insert({
        holder_id: holderId,
        amount,
        price_sats: priceSats,
        total_paid_sats: amount * priceSats,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      holderId: data.holder_id,
      amount: data.amount,
      priceSats: data.price_sats,
      totalPaidSats: data.total_paid_sats,
      status: data.status,
      txId: data.tx_id,
      createdAt: data.created_at,
    };
  }

  memoryStore.purchases.push(purchase);
  return purchase;
}

export async function confirmPurchase(purchaseId: string, txId: string): Promise<boolean> {
  if (isDbConnected() && supabase) {
    // Get purchase
    const { data: purchase } = await supabase
      .from('path402_purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('status', 'pending')
      .single();

    if (!purchase) return false;

    // Update purchase status
    await supabase
      .from('path402_purchases')
      .update({ status: 'confirmed', tx_id: txId, confirmed_at: new Date().toISOString() })
      .eq('id', purchaseId);

    // Update holder balance
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('balance, total_purchased')
      .eq('id', purchase.holder_id)
      .single();

    if (holder) {
      await supabase
        .from('path402_holders')
        .update({
          balance: holder.balance + purchase.amount,
          total_purchased: holder.total_purchased + purchase.amount,
        })
        .eq('id', purchase.holder_id);
    }

    // Update treasury
    const { data: treasury } = await supabase
      .from('path402_treasury')
      .select('*')
      .single();

    if (treasury) {
      await supabase
        .from('path402_treasury')
        .update({
          balance: treasury.balance - purchase.amount,
          total_sold: treasury.total_sold + purchase.amount,
          total_revenue_sats: treasury.total_revenue_sats + purchase.total_paid_sats,
        })
        .eq('id', treasury.id);
    }

    return true;
  }

  // In-memory fallback
  const purchase = memoryStore.purchases.find((p) => p.id === purchaseId);
  if (!purchase || purchase.status !== 'pending') return false;

  purchase.status = 'confirmed';
  purchase.txId = txId;

  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === purchase.holderId);
  if (holder) {
    holder.balance += purchase.amount;
    holder.totalPurchased += purchase.amount;
    holder.updatedAt = new Date().toISOString();
  }

  return true;
}

export async function getPurchaseById(purchaseId: string): Promise<TokenPurchase | null> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('path402_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      holderId: data.holder_id,
      amount: data.amount,
      priceSats: data.price_sats,
      totalPaidSats: data.total_paid_sats,
      status: data.status,
      txId: data.tx_id,
      createdAt: data.created_at,
    };
  }

  return memoryStore.purchases.find((p) => p.id === purchaseId) || null;
}

export async function processPurchaseImmediate(
  holderId: string,
  amount: number,
  priceSats: number,
  txId?: string
): Promise<TokenPurchase> {
  const purchase = await createPurchase(holderId, amount, priceSats);

  if (isDbConnected() && supabase) {
    // Update purchase to confirmed
    await supabase
      .from('path402_purchases')
      .update({ status: 'confirmed', tx_id: txId, confirmed_at: new Date().toISOString() })
      .eq('id', purchase.id);

    // Update holder
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('balance, total_purchased')
      .eq('id', holderId)
      .single();

    if (holder) {
      await supabase
        .from('path402_holders')
        .update({
          balance: holder.balance + amount,
          total_purchased: holder.total_purchased + amount,
        })
        .eq('id', holderId);
    }

    // Update treasury
    const { data: treasury } = await supabase
      .from('path402_treasury')
      .select('*')
      .single();

    if (treasury) {
      await supabase
        .from('path402_treasury')
        .update({
          balance: treasury.balance - amount,
          total_sold: treasury.total_sold + amount,
          total_revenue_sats: treasury.total_revenue_sats + (amount * priceSats),
        })
        .eq('id', treasury.id);
    }

    purchase.status = 'confirmed';
    purchase.txId = txId;
    return purchase;
  }

  // In-memory fallback
  purchase.status = 'confirmed';
  purchase.txId = txId;

  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === holderId);
  if (holder) {
    holder.balance += amount;
    holder.totalPurchased += amount;
    holder.updatedAt = new Date().toISOString();
  }

  return purchase;
}

// ============================================================================
// STAKING OPERATIONS
// ============================================================================

export async function stakeTokens(holderId: string, amount: number): Promise<Stake | null> {
  if (isDbConnected() && supabase) {
    // Get holder
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('balance, staked_balance')
      .eq('id', holderId)
      .single();

    if (!holder || holder.balance - holder.staked_balance < amount) return null;

    // Create stake record
    const { data: stake, error } = await supabase
      .from('path402_stakes')
      .insert({
        holder_id: holderId,
        amount,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Update holder staked balance
    await supabase
      .from('path402_holders')
      .update({ staked_balance: holder.staked_balance + amount })
      .eq('id', holderId);

    return {
      id: stake.id,
      holderId: stake.holder_id,
      amount: stake.amount,
      stakedAt: stake.staked_at,
      status: stake.status,
    };
  }

  // In-memory fallback
  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === holderId);
  if (!holder || holder.balance - holder.stakedBalance < amount) return null;

  const stake: Stake = {
    id: generateId(),
    holderId,
    amount,
    stakedAt: new Date().toISOString(),
    status: 'active',
  };

  memoryStore.stakes.push(stake);
  holder.stakedBalance += amount;
  holder.updatedAt = new Date().toISOString();

  return stake;
}

export async function unstakeTokens(holderId: string, amount: number): Promise<boolean> {
  if (isDbConnected() && supabase) {
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('staked_balance')
      .eq('id', holderId)
      .single();

    if (!holder || holder.staked_balance < amount) return false;

    // Mark stakes as unstaked (LIFO)
    const { data: activeStakes } = await supabase
      .from('path402_stakes')
      .select('*')
      .eq('holder_id', holderId)
      .eq('status', 'active')
      .order('staked_at', { ascending: false });

    let remaining = amount;
    for (const stake of activeStakes || []) {
      if (remaining <= 0) break;

      if (stake.amount <= remaining) {
        await supabase
          .from('path402_stakes')
          .update({ status: 'unstaked', unstaked_at: new Date().toISOString() })
          .eq('id', stake.id);
        remaining -= stake.amount;
      } else {
        // Partial unstake - update amount
        await supabase
          .from('path402_stakes')
          .update({ amount: stake.amount - remaining })
          .eq('id', stake.id);
        remaining = 0;
      }
    }

    // Update holder
    await supabase
      .from('path402_holders')
      .update({ staked_balance: holder.staked_balance - amount })
      .eq('id', holderId);

    return true;
  }

  // In-memory fallback
  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === holderId);
  if (!holder || holder.stakedBalance < amount) return false;

  let remaining = amount;
  for (let i = memoryStore.stakes.length - 1; i >= 0 && remaining > 0; i--) {
    const stake = memoryStore.stakes[i];
    if (stake.holderId === holderId && stake.status === 'active') {
      if (stake.amount <= remaining) {
        stake.status = 'unstaked';
        stake.unstakedAt = new Date().toISOString();
        remaining -= stake.amount;
      } else {
        stake.amount -= remaining;
        remaining = 0;
      }
    }
  }

  holder.stakedBalance -= amount;
  holder.updatedAt = new Date().toISOString();

  return true;
}

export async function getHolderStakes(holderId: string): Promise<Stake[]> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('path402_stakes')
      .select('*')
      .eq('holder_id', holderId)
      .eq('status', 'active');

    return (data || []).map((s) => ({
      id: s.id,
      holderId: s.holder_id,
      amount: s.amount,
      stakedAt: s.staked_at,
      status: s.status,
      unstakedAt: s.unstaked_at,
    }));
  }

  return memoryStore.stakes.filter((s) => s.holderId === holderId && s.status === 'active');
}

// ============================================================================
// DIVIDEND OPERATIONS
// ============================================================================

export async function distributeDividends(totalAmount: number, sourceTxId?: string): Promise<Dividend> {
  const allHolders = await getAllHolders();
  const totalStaked = allHolders.reduce((sum, h) => sum + h.stakedBalance, 0);

  if (totalStaked === 0) {
    throw new Error('No staked tokens to distribute to');
  }

  const perTokenAmount = totalAmount / totalStaked;

  const dividend: Dividend = {
    id: generateId(),
    totalAmount,
    perTokenAmount,
    totalStaked,
    sourceTxId,
    distributedAt: new Date().toISOString(),
    claims: [],
  };

  // Create claims for each staker
  for (const holder of allHolders) {
    if (holder.stakedBalance > 0) {
      const claim: DividendClaim = {
        id: generateId(),
        dividendId: dividend.id,
        holderId: holder.id,
        amount: Math.floor(holder.stakedBalance * perTokenAmount),
        stakedAtTime: holder.stakedBalance,
        status: 'pending',
      };
      dividend.claims.push(claim);
    }
  }

  if (isDbConnected() && supabase) {
    const { data: divData } = await supabase
      .from('path402_dividends')
      .insert({
        total_amount: totalAmount,
        per_token_amount: perTokenAmount,
        total_staked: totalStaked,
        source_tx_id: sourceTxId,
      })
      .select()
      .single();

    if (divData) {
      dividend.id = divData.id;

      // Insert claims
      const claimsToInsert = dividend.claims.map((c) => ({
        dividend_id: divData.id,
        holder_id: c.holderId,
        amount: c.amount,
        staked_at_time: c.stakedAtTime,
        status: 'pending',
      }));

      await supabase.from('path402_dividend_claims').insert(claimsToInsert);
    }
  } else {
    memoryStore.dividends.push(dividend);
  }

  return dividend;
}

export async function getPendingDividends(holderId: string): Promise<number> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('path402_dividend_claims')
      .select('amount')
      .eq('holder_id', holderId)
      .eq('status', 'pending');

    return (data || []).reduce((sum, c) => sum + c.amount, 0);
  }

  let total = 0;
  for (const dividend of memoryStore.dividends) {
    for (const claim of dividend.claims) {
      if (claim.holderId === holderId && claim.status === 'pending') {
        total += claim.amount;
      }
    }
  }
  return total;
}

export async function claimDividends(holderId: string): Promise<number> {
  if (isDbConnected() && supabase) {
    const { data: claims } = await supabase
      .from('path402_dividend_claims')
      .select('id, amount')
      .eq('holder_id', holderId)
      .eq('status', 'pending');

    if (!claims || claims.length === 0) return 0;

    const total = claims.reduce((sum, c) => sum + c.amount, 0);
    const claimIds = claims.map((c) => c.id);

    // Mark as claimed
    await supabase
      .from('path402_dividend_claims')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .in('id', claimIds);

    // Update holder total dividends
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('total_dividends')
      .eq('id', holderId)
      .single();

    if (holder) {
      await supabase
        .from('path402_holders')
        .update({ total_dividends: holder.total_dividends + total })
        .eq('id', holderId);
    }

    return total;
  }

  // In-memory fallback
  let total = 0;
  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === holderId);

  for (const dividend of memoryStore.dividends) {
    for (const claim of dividend.claims) {
      if (claim.holderId === holderId && claim.status === 'pending') {
        claim.status = 'claimed';
        claim.claimedAt = new Date().toISOString();
        total += claim.amount;
      }
    }
  }

  if (holder) {
    holder.totalDividends += total;
    holder.updatedAt = new Date().toISOString();
  }

  return total;
}

export async function getTotalDividendsEarned(holderId: string): Promise<number> {
  if (isDbConnected() && supabase) {
    const { data } = await supabase
      .from('path402_holders')
      .select('total_dividends')
      .eq('id', holderId)
      .single();

    return data?.total_dividends || 0;
  }

  const holder = Array.from(memoryStore.holders.values()).find((h) => h.id === holderId);
  return holder?.totalDividends || 0;
}

// ============================================================================
// CAP TABLE
// ============================================================================

export async function getCapTable(): Promise<Array<{ address: string; handle?: string; balance: number; percentage: number }>> {
  const allHolders = await getAllHolders();

  return allHolders
    .filter((h) => h.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .map((h) => ({
      address: h.address,
      handle: h.handle,
      balance: h.balance,
      percentage: (h.balance / TOKEN_CONFIG.totalSupply) * 100,
    }));
}
