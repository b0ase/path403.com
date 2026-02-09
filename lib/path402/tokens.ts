/**
 * $402 Token Operations
 * CRUD operations for access tokens
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Dollar402Token,
  CreateTokenRequest,
  TokenWithPrice,
  PriceSchedule
} from './types';
import { calculatePrice, calculateTotalCost, generatePriceSchedule } from './pricing';

const TABLE = 'path402_tokens';

/**
 * Get all active tokens with current prices
 */
export async function listTokens(): Promise<TokenWithPrice[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[path402] listTokens error:', error);
    throw new Error(`Failed to list tokens: ${error.message}`);
  }

  return (data || []).map(token => enrichTokenWithPrice(token));
}

/**
 * Get a single token by ID with pricing info
 */
export async function getToken(tokenId: string): Promise<TokenWithPrice | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_id', tokenId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[path402] getToken error:', error);
    throw new Error(`Failed to get token: ${error.message}`);
  }

  return data ? enrichTokenWithPrice(data) : null;
}

/**
 * Create a new token
 */
export async function createToken(
  issuerHandle: string,
  request: CreateTokenRequest
): Promise<Dollar402Token> {
  const supabase = createAdminClient();

  const tokenData = {
    token_id: request.token_id.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
    name: request.name,
    description: request.description || null,
    issuer_handle: issuerHandle,
    base_price_sats: request.base_price_sats || 500,
    pricing_model: request.pricing_model || 'sqrt_decay',
    decay_factor: request.decay_factor || 1.0,
    max_supply: request.max_supply || null,
    issuer_share_bps: request.issuer_share_bps || 7000,
    platform_share_bps: request.platform_share_bps || 3000,
    content_type: request.content_type || null,
    access_url: request.access_url || null,
    icon_url: request.icon_url || null,
    is_active: true
  };

  // Validate share percentages
  if (tokenData.issuer_share_bps + tokenData.platform_share_bps !== 10000) {
    throw new Error('Issuer and platform shares must total 100% (10000 basis points)');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(tokenData)
    .select()
    .single();

  if (error) {
    console.error('[path402] createToken error:', error);
    throw new Error(`Failed to create token: ${error.message}`);
  }

  return data;
}

/**
 * Update token details (issuer only)
 */
export async function updateToken(
  tokenId: string,
  issuerHandle: string,
  updates: Partial<CreateTokenRequest>
): Promise<Dollar402Token> {
  const supabase = createAdminClient();

  // Verify ownership
  const existing = await getToken(tokenId);
  if (!existing) {
    throw new Error('Token not found');
  }
  if (existing.issuer_handle !== issuerHandle) {
    throw new Error('Only the issuer can update this token');
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  // Only allow updating certain fields
  if (updates.name) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.icon_url !== undefined) updateData.icon_url = updates.icon_url;
  if (updates.access_url !== undefined) updateData.access_url = updates.access_url;
  if (updates.content_type !== undefined) updateData.content_type = updates.content_type;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateData)
    .eq('token_id', tokenId)
    .select()
    .single();

  if (error) {
    console.error('[path402] updateToken error:', error);
    throw new Error(`Failed to update token: ${error.message}`);
  }

  return data;
}

/**
 * Increment token supply (internal use only)
 */
export async function incrementSupply(
  tokenId: string,
  amount: number
): Promise<number> {
  const supabase = createAdminClient();

  // Use RPC for atomic increment
  const { data, error } = await supabase.rpc('increment_path402_supply', {
    p_token_id: tokenId,
    p_amount: amount
  });

  if (error) {
    // Fallback to non-atomic update if RPC doesn't exist
    const token = await getToken(tokenId);
    if (!token) throw new Error('Token not found');

    // Check max supply
    if (token.max_supply && token.total_supply + amount > token.max_supply) {
      throw new Error('Would exceed max supply');
    }

    const newSupply = token.total_supply + amount;

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        total_supply: newSupply,
        updated_at: new Date().toISOString()
      })
      .eq('token_id', tokenId);

    if (updateError) {
      throw new Error(`Failed to increment supply: ${updateError.message}`);
    }

    return newSupply;
  }

  return data;
}

/**
 * Get price schedule for a token
 */
export async function getTokenPriceSchedule(
  tokenId: string
): Promise<{ token: TokenWithPrice; schedule: PriceSchedule[] }> {
  const token = await getToken(tokenId);
  if (!token) {
    throw new Error('Token not found');
  }

  const schedule = generatePriceSchedule(
    token.base_price_sats,
    token.pricing_model,
    token.decay_factor
  );

  return { token, schedule };
}

/**
 * Enrich token with current price calculations
 */
function enrichTokenWithPrice(token: Dollar402Token): TokenWithPrice {
  const currentPrice = calculatePrice(
    token.base_price_sats,
    token.total_supply,
    token.pricing_model,
    token.decay_factor
  );

  const nextPrice = calculatePrice(
    token.base_price_sats,
    token.total_supply + 1,
    token.pricing_model,
    token.decay_factor
  );

  const priceFor10 = calculateTotalCost(
    token.base_price_sats,
    token.total_supply,
    10,
    token.pricing_model,
    token.decay_factor
  ).totalCost;

  const priceFor100 = calculateTotalCost(
    token.base_price_sats,
    token.total_supply,
    100,
    token.pricing_model,
    token.decay_factor
  ).totalCost;

  return {
    ...token,
    current_price_sats: currentPrice,
    next_price_sats: nextPrice,
    price_for_10: priceFor10,
    price_for_100: priceFor100
  };
}
