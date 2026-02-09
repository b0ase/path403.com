/**
 * GitHub Token Utilities
 *
 * Helper functions for retrieving and managing GitHub OAuth tokens
 * stored in the user_identities table.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get the GitHub OAuth access token for a user
 * @param userId - The unified_user_id
 * @returns The access token or null if not found/expired
 */
export async function getUserGitHubToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  // Try github_link provider first (custom OAuth flow)
  const { data: customLink } = await supabase
    .from('user_identities')
    .select('access_token, token_expires_at')
    .eq('unified_user_id', userId)
    .eq('provider', 'github_link')
    .maybeSingle();

  if (customLink?.access_token) {
    return customLink.access_token;
  }

  // Fall back to Supabase OAuth
  const { data, error } = await supabase
    .from('user_identities')
    .select('access_token, token_expires_at')
    .or(`unified_user_id.eq.${userId},provider_user_id.eq.${userId}`)
    .eq('oauth_provider', 'github')
    .maybeSingle();

  if (error || !data?.access_token) {
    console.error('No GitHub token found for user:', userId, error);
    return null;
  }

  // Note: We used to check token_expires_at here, but it was often linked to Supabase session expiry
  // which is much shorter than GitHub token validity (or irrelevant for non-expiring tokens).
  // We will let the actual API call fail if the token is invalid.

  return data.access_token;
}

/**
 * Get the GitHub username for a user
 * @param userId - The unified_user_id
 * @returns The GitHub username (without @) or null
 */
export async function getGitHubUsername(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_identities')
    .select('provider_handle')
    .or(`unified_user_id.eq.${userId},provider_user_id.eq.${userId}`)
    .eq('oauth_provider', 'github')
    .maybeSingle();

  if (error || !data?.provider_handle) {
    console.error('No GitHub username found for user:', userId);
    return null;
  }

  // Remove @ prefix if present
  return data.provider_handle.replace('@', '');
}

/**
 * Check if a user has connected their GitHub account
 * @param userId - The unified_user_id
 * @returns True if GitHub is connected and has a valid token
 */
export async function isGitHubConnected(userId: string): Promise<boolean> {
  const token = await getUserGitHubToken(userId);
  return token !== null;
}

/**
 * Get GitHub identity information for a user
 * @param userId - The unified_user_id
 * @returns Object with GitHub identity details or null
 */
export async function getGitHubIdentity(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_identities')
    .select('provider_handle, provider_email, provider_data, access_token, token_expires_at')
    .eq('unified_user_id', userId)
    .eq('oauth_provider', 'github')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    username: data.provider_handle?.replace('@', '') || null,
    email: data.provider_email,
    hasToken: !!data.access_token,
    tokenExpires: data.token_expires_at ? new Date(data.token_expires_at) : null,
    profileData: data.provider_data,
  };
}

/**
 * Revoke GitHub access (remove token from database)
 * Note: This doesn't revoke the token on GitHub's side - user must do that manually
 * @param userId - The unified_user_id
 */
export async function revokeGitHubAccess(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_identities')
    .update({
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
    })
    .eq('unified_user_id', userId)
    .eq('oauth_provider', 'github');

  if (error) {
    console.error('Failed to revoke GitHub access:', error);
    return false;
  }

  return true;
}
