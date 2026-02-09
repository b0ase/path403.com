/**
 * Twitter Account Tokenization
 *
 * Turns a connected Twitter account into a tradeable $402 token.
 * This is a KEY business model — every tokenized Twitter account
 * creates continuous deal flow for b0ase.com.
 *
 * Flow:
 * 1. User connects Twitter via OAuth (already built)
 * 2. User clicks "Tokenize" → this module creates a path402 token
 * 3. Token appears on their profile with a MoneyButton
 * 4. Anyone can buy tokens → user earns 70%, platform 30%
 * 5. Token holders can serve/syndicate the user's content
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createToken, getToken } from '@/lib/path402/tokens';

export interface TwitterProfile {
  twitterId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
}

export interface TokenizeResult {
  tokenId: string;
  isNew: boolean;
  token: {
    token_id: string;
    name: string;
    issuer_handle: string;
    base_price_sats: number;
    total_supply: number;
  };
}

/**
 * Convert a Twitter username to a token ID.
 * Format: TWITTER_{USERNAME_UPPER}
 */
export function twitterTokenId(username: string): string {
  const clean = username.replace(/^@/, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  return `TWITTER_${clean}`;
}

/**
 * Check if a Twitter account is already tokenized.
 */
export async function isTwitterTokenized(username: string): Promise<boolean> {
  const token = await getToken(twitterTokenId(username));
  return !!token;
}

/**
 * Get the token for a Twitter account, if it exists.
 */
export async function getTwitterToken(username: string) {
  return getToken(twitterTokenId(username));
}

/**
 * Tokenize a Twitter account.
 *
 * Creates a path402 token backed by the user's Twitter identity.
 * Requires:
 * - User has connected Twitter (exists in user_identities)
 * - User has a HandCash handle (for receiving payments)
 *
 * Returns existing token if already tokenized (idempotent).
 */
export async function tokenizeTwitterAccount(
  profile: TwitterProfile,
  issuerHandcashHandle: string,
  options?: {
    basePriceSats?: number;
    description?: string;
  },
): Promise<TokenizeResult> {
  const tokenId = twitterTokenId(profile.username);

  // Check if already tokenized (idempotent)
  const existing = await getToken(tokenId);
  if (existing) {
    return {
      tokenId,
      isNew: false,
      token: {
        token_id: existing.token_id,
        name: existing.name,
        issuer_handle: existing.issuer_handle,
        base_price_sats: existing.base_price_sats,
        total_supply: existing.total_supply,
      },
    };
  }

  // Create the token
  const token = await createToken(issuerHandcashHandle, {
    token_id: tokenId,
    name: `@${profile.username}`,
    description: options?.description || `$402 token for Twitter account @${profile.username}. Buy to syndicate and serve this creator's content.`,
    base_price_sats: options?.basePriceSats || 500,
    pricing_model: 'sqrt_decay',
    issuer_share_bps: 7000,
    platform_share_bps: 3000,
    content_type: 'twitter',
    access_url: `https://x.com/${profile.username}`,
    icon_url: profile.profileImageUrl || null,
  });

  // Store the link between Twitter identity and token
  const supabase = createAdminClient();
  await supabase
    .from('user_identities')
    .update({
      provider_data: {
        username: profile.username,
        name: profile.displayName,
        profile_image_url: profile.profileImageUrl,
        tokenized: true,
        token_id: tokenId,
        tokenized_at: new Date().toISOString(),
      },
    })
    .eq('provider', 'twitter')
    .eq('provider_user_id', profile.twitterId);

  return {
    tokenId,
    isNew: true,
    token: {
      token_id: token.token_id,
      name: token.name,
      issuer_handle: token.issuer_handle,
      base_price_sats: token.base_price_sats,
      total_supply: token.total_supply || 0,
    },
  };
}

/**
 * Get all tokenized Twitter accounts.
 * Useful for building a directory / discovery page.
 */
export async function listTokenizedTwitterAccounts() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('path402_tokens')
    .select('*')
    .eq('content_type', 'twitter')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[twitter] listTokenized error:', error);
    return [];
  }

  return data || [];
}

/**
 * Look up a unified user's Twitter identity.
 * Returns the Twitter profile data if they've connected Twitter.
 */
export async function getTwitterIdentity(unifiedUserId: string): Promise<TwitterProfile | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('user_identities')
    .select('provider_user_id, provider_handle, provider_data')
    .eq('unified_user_id', unifiedUserId)
    .eq('provider', 'twitter')
    .single();

  if (!data) return null;

  const providerData = data.provider_data as Record<string, any> || {};

  return {
    twitterId: data.provider_user_id,
    username: providerData.username || data.provider_handle?.replace('@', '') || '',
    displayName: providerData.name || data.provider_handle || '',
    profileImageUrl: providerData.profile_image_url,
  };
}
