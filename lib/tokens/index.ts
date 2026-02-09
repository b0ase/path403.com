/**
 * $402 Token Marketplace Library
 *
 * Multi-tenant token registry for any $address
 */

import { createClient } from '@supabase/supabase-js';
import {
  Token,
  TokenWithPrice,
  TokenHolding,
  TokenTransaction,
  RegisterTokenRequest,
  AcquireTokenResponse,
  PricingModel,
  TxType,
} from './types';
import { calculatePrice, calculateTotalCost, calculateTokensForSpend } from './pricing';

// Re-export types and pricing functions
export * from './types';
export * from './pricing';

// Lazy Supabase client (avoid build-time initialization)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

// Default values
const DEFAULT_BASE_PRICE = 500;
const DEFAULT_TREASURY = 500_000_000;
const DEFAULT_ISSUER_SHARE = 8000; // 80%
const DEFAULT_FACILITATOR_SHARE = 2000; // 20%
const DEFAULT_ACCESS_MODE = 'token';
const DEFAULT_PARENT_SHARE = 5000;

/**
 * Get all active tokens with current prices
 */
export async function listTokens(options?: {
  issuer?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}): Promise<TokenWithPrice[]> {
  let query = getSupabase()
    .from('tokens')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (options?.issuer) {
    query = query.eq('issuer_handle', options.issuer);
  }
  if (options?.content_type) {
    query = query.eq('content_type', options.content_type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[tokens] listTokens error:', error);
    return [];
  }

  return (data || []).map((token: Token) => ({
    ...token,
    current_price_sats: calculatePrice(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance || DEFAULT_TREASURY
    ),
    market_cap_sats: token.total_supply * calculatePrice(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance || DEFAULT_TREASURY
    ),
  }));
}

/**
 * Get a single token by address
 */
export async function getToken(address: string): Promise<TokenWithPrice | null> {
  const { data, error } = await getSupabase()
    .from('tokens')
    .select('*')
    .eq('address', address)
    .single();

  if (error || !data) {
    return null;
  }

  const token = data as Token;
  return {
    ...token,
    current_price_sats: calculatePrice(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance || DEFAULT_TREASURY
    ),
    market_cap_sats: token.total_supply * calculatePrice(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance || DEFAULT_TREASURY
    ),
  };
}

/**
 * Register a new token
 */
export async function registerToken(
  issuerHandle: string,
  request: RegisterTokenRequest
): Promise<Token | null> {
  // Validate $address format
  if (!request.address.startsWith('$')) {
    throw new Error('Address must start with $');
  }

  const insertData = {
    address: request.address,
    name: request.name,
    description: request.description,
    content_type: request.content_type,
    icon_url: request.icon_url,
    access_url: request.access_url,
    issuer_handle: issuerHandle,
    issuer_address: request.issuer_address,
    pricing_model: request.pricing_model || 'sqrt_decay',
    base_price_sats: request.base_price_sats || DEFAULT_BASE_PRICE,
    max_supply: request.max_supply,
    treasury_balance: DEFAULT_TREASURY,
    issuer_share_bps: request.issuer_share_bps || DEFAULT_ISSUER_SHARE,
    facilitator_share_bps: DEFAULT_FACILITATOR_SHARE,
    access_mode: request.access_mode || DEFAULT_ACCESS_MODE,
    parent_address: request.parent_address,
    parent_share_bps: request.parent_share_bps ?? DEFAULT_PARENT_SHARE,
    usage_pricing: request.usage_pricing || null,
    dividend_policy: request.dividend_policy || null,
  };

  const { data, error } = await getSupabase()
    .from('tokens')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[tokens] registerToken error:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Acquire tokens
 */
export async function acquireTokens(
  tokenAddress: string,
  buyerHandle: string,
  options: { amount?: number; spendSats?: number; paymentTxId?: string }
): Promise<AcquireTokenResponse> {
  const token = await getToken(tokenAddress);
  if (!token) {
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Token not found' };
  }

  if (!token.is_active) {
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Token is not active' };
  }

  let amount: number;
  let totalCost: number;
  let avgPrice: number;

  if (options.spendSats) {
    const result = calculateTokensForSpend(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance,
      options.spendSats
    );
    amount = result.tokenCount;
    totalCost = result.totalCost;
    avgPrice = result.avgPrice;
  } else if (options.amount) {
    amount = options.amount;
    const result = calculateTotalCost(
      token.pricing_model as PricingModel,
      token.base_price_sats,
      token.treasury_balance,
      amount
    );
    totalCost = result.totalSats;
    avgPrice = result.avgPrice;
  } else {
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Specify amount or spendSats' };
  }

  if (amount <= 0) {
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Cannot acquire 0 tokens' };
  }

  if (amount > token.treasury_balance) {
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Insufficient treasury' };
  }

  // Calculate revenue split
  const issuerRevenue = Math.floor(totalCost * token.issuer_share_bps / 10000);
  const facilitatorRevenue = totalCost - issuerRevenue;

  // Update token treasury
  const { error: tokenError } = await getSupabase()
    .from('tokens')
    .update({
      treasury_balance: token.treasury_balance - amount,
      total_supply: token.total_supply + amount,
    })
    .eq('address', tokenAddress);

  if (tokenError) {
    console.error('[tokens] acquireTokens token update error:', tokenError);
    return { success: false, acquired: 0, total_cost_sats: 0, avg_price_sats: 0, new_balance: 0, error: 'Failed to update token' };
  }

  // Get or create holding
  const { data: existingHolding } = await getSupabase()
    .from('token_holdings')
    .select('*')
    .eq('token_address', tokenAddress)
    .eq('holder_handle', buyerHandle)
    .single();

  const newBalance = (existingHolding?.balance || 0) + amount;
  const newTotalAcquired = (existingHolding?.total_acquired || 0) + amount;
  const newTotalSpent = (existingHolding?.total_spent_sats || 0) + totalCost;
  const newAvgCost = Math.ceil(newTotalSpent / newTotalAcquired);

  if (existingHolding) {
    await getSupabase()
      .from('token_holdings')
      .update({
        balance: newBalance,
        total_acquired: newTotalAcquired,
        total_spent_sats: newTotalSpent,
        avg_cost_sats: newAvgCost,
        last_acquired_at: new Date().toISOString(),
      })
      .eq('id', existingHolding.id);
  } else {
    await getSupabase()
      .from('token_holdings')
      .insert({
        token_address: tokenAddress,
        holder_handle: buyerHandle,
        balance: amount,
        total_acquired: amount,
        total_spent_sats: totalCost,
        avg_cost_sats: avgPrice,
      });
  }

  // Record transaction
  await getSupabase()
    .from('token_transactions')
    .insert({
      token_address: tokenAddress,
      to_handle: buyerHandle,
      tx_type: 'acquire' as TxType,
      amount,
      price_sats: totalCost,
      unit_price_sats: avgPrice,
      issuer_revenue_sats: issuerRevenue,
      facilitator_revenue_sats: facilitatorRevenue,
      payment_tx_id: options.paymentTxId,
    });

  return {
    success: true,
    acquired: amount,
    total_cost_sats: totalCost,
    avg_price_sats: avgPrice,
    new_balance: newBalance,
  };
}

/**
 * Get holdings for a user
 */
export async function getHoldings(holderHandle: string): Promise<TokenHolding[]> {
  const { data, error } = await getSupabase()
    .from('token_holdings')
    .select('*')
    .eq('holder_handle', holderHandle)
    .gt('balance', 0);

  if (error) {
    console.error('[tokens] getHoldings error:', error);
    return [];
  }

  return data || [];
}

/**
 * Transfer tokens
 */
export async function transferTokens(
  tokenAddress: string,
  fromHandle: string,
  toHandle: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  // Get sender's holding
  const { data: fromHolding } = await getSupabase()
    .from('token_holdings')
    .select('*')
    .eq('token_address', tokenAddress)
    .eq('holder_handle', fromHandle)
    .single();

  if (!fromHolding || fromHolding.balance < amount) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Update sender
  await getSupabase()
    .from('token_holdings')
    .update({ balance: fromHolding.balance - amount })
    .eq('id', fromHolding.id);

  // Get or create recipient holding
  const { data: toHolding } = await getSupabase()
    .from('token_holdings')
    .select('*')
    .eq('token_address', tokenAddress)
    .eq('holder_handle', toHandle)
    .single();

  if (toHolding) {
    await getSupabase()
      .from('token_holdings')
      .update({ balance: toHolding.balance + amount })
      .eq('id', toHolding.id);
  } else {
    await getSupabase()
      .from('token_holdings')
      .insert({
        token_address: tokenAddress,
        holder_handle: toHandle,
        balance: amount,
      });
  }

  // Record transaction
  await getSupabase()
    .from('token_transactions')
    .insert({
      token_address: tokenAddress,
      from_handle: fromHandle,
      to_handle: toHandle,
      tx_type: 'transfer' as TxType,
      amount,
    });

  return { success: true };
}

/**
 * Get transaction history
 */
export async function getHistory(
  holderHandle: string,
  options?: { token_address?: string; tx_type?: TxType; limit?: number }
): Promise<TokenTransaction[]> {
  let query = getSupabase()
    .from('token_transactions')
    .select('*')
    .or(`from_handle.eq.${holderHandle},to_handle.eq.${holderHandle}`)
    .order('created_at', { ascending: false });

  if (options?.token_address) {
    query = query.eq('token_address', options.token_address);
  }
  if (options?.tx_type) {
    query = query.eq('tx_type', options.tx_type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[tokens] getHistory error:', error);
    return [];
  }

  return data || [];
}
