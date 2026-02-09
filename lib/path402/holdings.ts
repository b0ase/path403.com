/**
 * $402 Holdings Management
 * Track who owns what tokens
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { Dollar402Holding, HoldingWithToken } from './types';
import { getToken } from './tokens';
import { calculatePrice } from './pricing';

const TABLE = 'path402_holdings';

/**
 * Get all holdings for a user
 */
export async function getUserHoldings(
  holderHandle: string
): Promise<HoldingWithToken[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      token:path402_tokens(*)
    `)
    .eq('holder_handle', holderHandle)
    .gt('balance', 0)
    .order('last_acquired_at', { ascending: false });

  if (error) {
    console.error('[path402] getUserHoldings error:', error);
    throw new Error(`Failed to get holdings: ${error.message}`);
  }

  return (data || []).map(holding => {
    const token = holding.token;
    const currentPrice = token ? calculatePrice(
      token.base_price_sats,
      token.total_supply,
      token.pricing_model,
      token.decay_factor
    ) : 0;

    return {
      ...holding,
      token: holding.token,
      current_value_sats: holding.balance * currentPrice
    };
  });
}

/**
 * Get holding for a specific token
 */
export async function getHolding(
  tokenId: string,
  holderHandle: string
): Promise<Dollar402Holding | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_id', tokenId)
    .eq('holder_handle', holderHandle)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[path402] getHolding error:', error);
    throw new Error(`Failed to get holding: ${error.message}`);
  }

  return data;
}

/**
 * Check if user has access (balance > 0)
 */
export async function hasAccess(
  tokenId: string,
  holderHandle: string
): Promise<boolean> {
  const holding = await getHolding(tokenId, holderHandle);
  return holding !== null && holding.balance > 0;
}

/**
 * Get token balance for a user
 */
export async function getBalance(
  tokenId: string,
  holderHandle: string
): Promise<number> {
  const holding = await getHolding(tokenId, holderHandle);
  return holding?.balance || 0;
}

/**
 * Credit tokens to a user (internal use)
 */
export async function creditTokens(
  tokenId: string,
  holderHandle: string,
  amount: number,
  pricePaid: number,
  userId?: string
): Promise<Dollar402Holding> {
  const supabase = createAdminClient();

  // Try upsert
  const existing = await getHolding(tokenId, holderHandle);

  if (existing) {
    // Update existing holding
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        balance: existing.balance + amount,
        total_acquired: existing.total_acquired + amount,
        total_spent_sats: existing.total_spent_sats + pricePaid,
        last_acquired_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to credit tokens: ${error.message}`);
    }

    return data;
  } else {
    // Create new holding
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        token_id: tokenId,
        holder_handle: holderHandle,
        holder_user_id: userId || null,
        balance: amount,
        total_acquired: amount,
        total_spent_sats: pricePaid,
        first_acquired_at: new Date().toISOString(),
        last_acquired_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create holding: ${error.message}`);
    }

    return data;
  }
}

/**
 * Debit tokens from a user (for consumption or transfer)
 */
export async function debitTokens(
  tokenId: string,
  holderHandle: string,
  amount: number
): Promise<Dollar402Holding> {
  const supabase = createAdminClient();

  const existing = await getHolding(tokenId, holderHandle);
  if (!existing || existing.balance < amount) {
    throw new Error('Insufficient token balance');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      balance: existing.balance - amount
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to debit tokens: ${error.message}`);
  }

  return data;
}

/**
 * Get all holders of a token
 */
export async function getTokenHolders(
  tokenId: string,
  limit: number = 100
): Promise<Dollar402Holding[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_id', tokenId)
    .gt('balance', 0)
    .order('balance', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[path402] getTokenHolders error:', error);
    throw new Error(`Failed to get holders: ${error.message}`);
  }

  return data || [];
}

/**
 * Get total holder count for a token
 */
export async function getHolderCount(tokenId: string): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenId)
    .gt('balance', 0);

  if (error) {
    console.error('[path402] getHolderCount error:', error);
    return 0;
  }

  return count || 0;
}
