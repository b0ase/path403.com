/**
 * Content Token System
 *
 * Each piece of content has its own token: $b0ase.com/blog/slug
 * Users accumulate tokens as they pay for access.
 * Internal ledger for speed, can withdraw to chain.
 */

import { createClient } from '@/lib/supabase/server';

// Default price in satoshis (100 sats ≈ $0.04 at current rates)
const DEFAULT_PRICE_SATS = 100;

// Convert path to token ID
export function pathToTokenId(path: string): string {
  // Normalize path
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `$b0ase.com${normalized}`;
}

// Convert token ID to path
export function tokenIdToPath(tokenId: string): string {
  return tokenId.replace('$b0ase.com', '');
}

// Get or create user account from HandCash handle
export async function getOrCreateUserAccount(handcashHandle: string, displayName?: string) {
  const supabase = await createClient();

  // Try to get existing
  const { data: existing } = await supabase
    .from('user_accounts')
    .select('*')
    .eq('handcash_handle', handcashHandle)
    .single();

  if (existing) {
    // Update last seen
    await supabase
      .from('user_accounts')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existing.id);
    return existing;
  }

  // Create new account
  const { data: newAccount, error } = await supabase
    .from('user_accounts')
    .insert({
      handcash_handle: handcashHandle,
      display_name: displayName || handcashHandle,
      // Ordinals address would be derived from their HandCash pubkey
      // For now, leave null until they request withdrawal
    })
    .select()
    .single();

  if (error) throw error;
  return newAccount;
}

// Get or create content token for a path
export async function getOrCreateContentToken(path: string, title?: string) {
  const supabase = await createClient();
  const tokenId = pathToTokenId(path);

  // Try to get existing
  const { data: existing } = await supabase
    .from('content_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (existing) return existing;

  // Auto-create token for new content
  const { data: newToken, error } = await supabase
    .from('content_tokens')
    .insert({
      id: tokenId,
      path,
      title: title || path,
      price_sats: DEFAULT_PRICE_SATS,
    })
    .select()
    .single();

  if (error) throw error;
  return newToken;
}

// Check if user owns a token for a path
export async function userOwnsToken(handcashHandle: string, path: string): Promise<boolean> {
  const supabase = await createClient();
  const tokenId = pathToTokenId(path);

  // Get user account
  const { data: user } = await supabase
    .from('user_accounts')
    .select('id')
    .eq('handcash_handle', handcashHandle)
    .single();

  if (!user) return false;

  // Check balance
  const { data: balance } = await supabase
    .from('user_token_balances')
    .select('balance')
    .eq('user_id', user.id)
    .eq('token_id', tokenId)
    .single();

  return balance && balance.balance > 0;
}

// Mint/credit a token to a user after payment
export async function mintTokenToUser(
  handcashHandle: string,
  path: string,
  pricePaid: number,
  handcashTxId?: string
) {
  const supabase = await createClient();
  const tokenId = pathToTokenId(path);

  // Get or create user account
  const user = await getOrCreateUserAccount(handcashHandle);

  // Get or create content token
  const token = await getOrCreateContentToken(path);

  // Check if already owns
  const { data: existingBalance } = await supabase
    .from('user_token_balances')
    .select('*')
    .eq('user_id', user.id)
    .eq('token_id', tokenId)
    .single();

  if (existingBalance) {
    // Already owns - increment balance (shouldn't happen for access tokens, but support it)
    await supabase
      .from('user_token_balances')
      .update({ balance: existingBalance.balance + 1 })
      .eq('id', existingBalance.id);
  } else {
    // Create new balance
    await supabase
      .from('user_token_balances')
      .insert({
        user_id: user.id,
        token_id: tokenId,
        balance: 1,
        acquisition_price_sats: pricePaid,
      });
  }

  // Update token supply
  await supabase
    .from('content_tokens')
    .update({ total_supply: token.total_supply + 1 })
    .eq('id', tokenId);

  // Record transaction
  await supabase
    .from('token_transactions')
    .insert({
      token_id: tokenId,
      from_user_id: null,  // Mint
      to_user_id: user.id,
      amount: 1,
      price_sats: pricePaid,
      tx_type: 'mint',
      handcash_tx_id: handcashTxId,
    });

  return { user, token, balance: 1 };
}

// Get all tokens owned by a user
export async function getUserTokens(handcashHandle: string) {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('user_accounts')
    .select('id')
    .eq('handcash_handle', handcashHandle)
    .single();

  if (!user) return [];

  const { data: balances } = await supabase
    .from('user_token_balances')
    .select(`
      *,
      token:content_tokens(*)
    `)
    .eq('user_id', user.id)
    .gt('balance', 0);

  return balances || [];
}

// Get token info for a path
export async function getTokenInfo(path: string) {
  const supabase = await createClient();
  const tokenId = pathToTokenId(path);

  const { data } = await supabase
    .from('content_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  return data;
}

// Get price for a path (creates token if doesn't exist)
export async function getTokenPrice(path: string): Promise<number> {
  const token = await getOrCreateContentToken(path);
  return token.price_sats;
}
