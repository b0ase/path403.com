/**
 * $402 Transaction Processing
 * Handle token acquisitions and transfers
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { Dollar402Transaction, TransactionType } from './types';
import { getToken, incrementSupply } from './tokens';
import { creditTokens, debitTokens } from './holdings';
import { calculateTotalCost, splitRevenue } from './pricing';

const TABLE = 'path402_transactions';

/**
 * Acquire tokens (primary issuance)
 * This is the main entry point for purchasing tokens
 */
export async function acquireTokens(
  tokenId: string,
  buyerHandle: string,
  amount: number,
  handcashTxId?: string,
  userId?: string
): Promise<{
  transaction: Dollar402Transaction;
  totalCost: number;
  unitPrice: number;
}> {
  const supabase = createAdminClient();

  // Get token and validate
  const token = await getToken(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }
  if (!token.is_active) {
    throw new Error('Token is not active');
  }

  // Check max supply
  if (token.max_supply && token.total_supply + amount > token.max_supply) {
    throw new Error(`Only ${token.max_supply - token.total_supply} tokens remaining`);
  }

  // Calculate cost
  const { totalCost, avgPrice } = calculateTotalCost(
    token.base_price_sats,
    token.total_supply,
    amount,
    token.pricing_model,
    token.decay_factor
  );

  // Split revenue
  const { issuerSats, platformSats } = splitRevenue(
    totalCost,
    token.issuer_share_bps,
    token.platform_share_bps
  );

  // Record transaction
  const { data: txData, error: txError } = await supabase
    .from(TABLE)
    .insert({
      token_id: tokenId,
      buyer_handle: buyerHandle,
      seller_handle: null, // Primary issuance
      amount,
      price_sats: totalCost,
      unit_price_sats: avgPrice,
      issuer_revenue_sats: issuerSats,
      platform_revenue_sats: platformSats,
      tx_type: 'acquire' as TransactionType,
      handcash_tx_id: handcashTxId || null,
      metadata: {}
    })
    .select()
    .single();

  if (txError) {
    throw new Error(`Failed to record transaction: ${txError.message}`);
  }

  // Credit tokens to buyer
  await creditTokens(tokenId, buyerHandle, amount, totalCost, userId);

  // Increment supply
  await incrementSupply(tokenId, amount);

  return {
    transaction: txData,
    totalCost,
    unitPrice: avgPrice
  };
}

/**
 * Transfer tokens between users
 */
export async function transferTokens(
  tokenId: string,
  fromHandle: string,
  toHandle: string,
  amount: number
): Promise<Dollar402Transaction> {
  const supabase = createAdminClient();

  const token = await getToken(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }

  // Debit from sender
  await debitTokens(tokenId, fromHandle, amount);

  // Credit to receiver (no price paid - it's a transfer)
  await creditTokens(tokenId, toHandle, amount, 0);

  // Record transaction
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      token_id: tokenId,
      buyer_handle: toHandle,
      seller_handle: fromHandle,
      amount,
      price_sats: 0, // Transfer, no money exchanged
      unit_price_sats: 0,
      issuer_revenue_sats: 0,
      platform_revenue_sats: 0,
      tx_type: 'transfer' as TransactionType,
      handcash_tx_id: null,
      metadata: {}
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record transfer: ${error.message}`);
  }

  return data;
}

/**
 * Grant tokens (free, e.g., for promotions or rewards)
 */
export async function grantTokens(
  tokenId: string,
  grantorHandle: string,
  recipientHandle: string,
  amount: number,
  reason?: string
): Promise<Dollar402Transaction> {
  const supabase = createAdminClient();

  const token = await getToken(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }

  // Only issuer can grant
  if (token.issuer_handle !== grantorHandle) {
    throw new Error('Only the issuer can grant tokens');
  }

  // Check max supply
  if (token.max_supply && token.total_supply + amount > token.max_supply) {
    throw new Error(`Only ${token.max_supply - token.total_supply} tokens remaining`);
  }

  // Credit to recipient
  await creditTokens(tokenId, recipientHandle, amount, 0);

  // Increment supply
  await incrementSupply(tokenId, amount);

  // Record transaction
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      token_id: tokenId,
      buyer_handle: recipientHandle,
      seller_handle: grantorHandle,
      amount,
      price_sats: 0,
      unit_price_sats: 0,
      issuer_revenue_sats: 0,
      platform_revenue_sats: 0,
      tx_type: 'grant' as TransactionType,
      handcash_tx_id: null,
      metadata: { reason: reason || 'grant' }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record grant: ${error.message}`);
  }

  return data;
}

/**
 * Get transaction history for a token
 */
export async function getTokenTransactions(
  tokenId: string,
  limit: number = 50
): Promise<Dollar402Transaction[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_id', tokenId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[path402] getTokenTransactions error:', error);
    throw new Error(`Failed to get transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get transaction history for a user
 */
export async function getUserTransactions(
  handle: string,
  limit: number = 50
): Promise<Dollar402Transaction[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .or(`buyer_handle.eq.${handle},seller_handle.eq.${handle}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[path402] getUserTransactions error:', error);
    throw new Error(`Failed to get transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get total revenue for a token
 */
export async function getTokenRevenue(
  tokenId: string
): Promise<{ totalSats: number; issuerSats: number; platformSats: number }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('price_sats, issuer_revenue_sats, platform_revenue_sats')
    .eq('token_id', tokenId)
    .eq('tx_type', 'acquire');

  if (error) {
    console.error('[path402] getTokenRevenue error:', error);
    return { totalSats: 0, issuerSats: 0, platformSats: 0 };
  }

  const totals = (data || []).reduce(
    (acc, tx) => ({
      totalSats: acc.totalSats + (tx.price_sats || 0),
      issuerSats: acc.issuerSats + (tx.issuer_revenue_sats || 0),
      platformSats: acc.platformSats + (tx.platform_revenue_sats || 0)
    }),
    { totalSats: 0, issuerSats: 0, platformSats: 0 }
  );

  return totals;
}
