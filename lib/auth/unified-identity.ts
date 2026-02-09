/**
 * Unified Identity Resolution
 *
 * Single function to find-or-create a unified user from any auth provider.
 * Used by all OAuth callbacks (HandCash, Supabase, Twitter, Wallet).
 *
 * Forward-compatible: all DB queries are here. To split databases later,
 * replace these queries with API calls to a central identity service.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ProviderIdentity {
  provider: string;
  provider_user_id: string;
  provider_handle?: string;
  provider_email?: string;
  provider_data?: Record<string, any>;
  /** For Supabase OAuth, tracks the specific OAuth provider (google, github) */
  oauth_provider?: string;
}

/** Hints from active session cookies — used to link identities across providers */
export interface SessionHints {
  supabaseUserId?: string;
  handcashHandle?: string;
  walletProvider?: string;
  walletAddress?: string;
  twitterUsername?: string;
}

export interface UnifiedUserResult {
  unifiedUserId: string;
  isNew: boolean;
  /** If this identity was already linked to a DIFFERENT unified user */
  conflictUserId?: string;
}

/**
 * Find or create a unified user for the given provider identity.
 *
 * Resolution order:
 * 1. Check if this exact provider+id already has a user_identities record
 * 2. Check session hints for existing unified users from other providers
 * 3. If found, link this identity to that unified user
 * 4. If not found, create a new unified user
 *
 * Handles merge detection and race conditions (concurrent logins).
 */
export async function resolveUnifiedUser(
  db: SupabaseClient,
  identity: ProviderIdentity,
  hints: SessionHints,
  profile?: { displayName?: string; avatarUrl?: string },
): Promise<UnifiedUserResult> {
  // 1. Check if this exact provider identity already exists
  const { data: existingIdentity } = await db
    .from('user_identities')
    .select('unified_user_id')
    .eq('provider', identity.provider)
    .eq('provider_user_id', identity.provider_user_id)
    .single();

  if (existingIdentity) {
    // Update last_used_at
    await db
      .from('user_identities')
      .update({ last_used_at: new Date().toISOString() })
      .eq('unified_user_id', existingIdentity.unified_user_id)
      .eq('provider', identity.provider)
      .eq('provider_user_id', identity.provider_user_id);

    // Follow merge chain
    const resolvedId = await followMergeChain(db, existingIdentity.unified_user_id);

    return { unifiedUserId: resolvedId, isNew: false };
  }

  // 2. Try to find existing unified user from session hints
  let existingUnifiedUserId = await findFromHints(db, hints);

  // 3. Create or link
  if (existingUnifiedUserId) {
    // Follow merge chain
    existingUnifiedUserId = await followMergeChain(db, existingUnifiedUserId);
  } else {
    // Create new unified user
    const { data: newUser, error } = await db
      .from('unified_users')
      .insert({
        display_name: profile?.displayName || identity.provider_handle || identity.provider_user_id,
        primary_email: identity.provider_email,
        avatar_url: profile?.avatarUrl,
      })
      .select('id')
      .single();

    if (error || !newUser) {
      throw new Error(`Failed to create unified user: ${error?.message}`);
    }

    existingUnifiedUserId = newUser.id;
  }

  // 4. Create the identity link
  const { error: linkError } = await db
    .from('user_identities')
    .insert({
      unified_user_id: existingUnifiedUserId,
      provider: identity.provider,
      provider_user_id: identity.provider_user_id,
      provider_handle: identity.provider_handle,
      provider_email: identity.provider_email,
      provider_data: identity.provider_data,
      oauth_provider: identity.oauth_provider,
      linked_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    });

  if (linkError) {
    // Race condition: another request linked this identity concurrently
    if (linkError.code === '23505') {
      const { data: raced } = await db
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', identity.provider)
        .eq('provider_user_id', identity.provider_user_id)
        .single();
      if (raced) {
        return { unifiedUserId: raced.unified_user_id, isNew: false };
      }
    }
    throw new Error(`Failed to link identity: ${linkError.message}`);
  }

  return { unifiedUserId: existingUnifiedUserId, isNew: true };
}

/**
 * Look up existing unified users from active session cookies.
 * Each provider is checked independently — first match wins.
 */
async function findFromHints(
  db: SupabaseClient,
  hints: SessionHints,
): Promise<string | null> {
  const lookups: Array<{ provider: string; field: string; value: string }> = [];

  if (hints.handcashHandle) {
    lookups.push({ provider: 'handcash', field: 'provider_user_id', value: hints.handcashHandle });
  }
  if (hints.supabaseUserId) {
    lookups.push({ provider: 'supabase', field: 'provider_user_id', value: hints.supabaseUserId });
  }
  if (hints.walletProvider && hints.walletAddress) {
    lookups.push({ provider: hints.walletProvider, field: 'provider_user_id', value: hints.walletAddress });
  }
  if (hints.twitterUsername) {
    lookups.push({ provider: 'twitter', field: 'provider_handle', value: `@${hints.twitterUsername}` });
  }

  for (const lookup of lookups) {
    const { data } = await db
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', lookup.provider)
      .eq(lookup.field, lookup.value)
      .limit(1)
      .single();

    if (data?.unified_user_id) {
      return data.unified_user_id;
    }
  }

  return null;
}

/**
 * Follow the merge chain to find the canonical unified user.
 * Handles cases where users have been merged into other users.
 */
async function followMergeChain(
  db: SupabaseClient,
  userId: string,
  maxDepth = 5,
): Promise<string> {
  let currentId = userId;

  for (let i = 0; i < maxDepth; i++) {
    const { data } = await db
      .from('unified_users')
      .select('merged_into_id')
      .eq('id', currentId)
      .single();

    if (!data?.merged_into_id) {
      return currentId;
    }
    currentId = data.merged_into_id;
  }

  return currentId;
}
