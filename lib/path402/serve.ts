/**
 * $402 Serve Tracking
 * Record token usage for content access
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { Dollar402Serve } from './types';
import { hasAccess, debitTokens } from './holdings';
import { getToken } from './tokens';

const TABLE = 'path402_serves';

export interface ServeResult {
  allowed: boolean;
  reason?: string;
  serve?: Dollar402Serve;
  tokensRemaining?: number;
}

/**
 * Check if user can access and record the serve
 * For access tokens (balance >= 1), access is granted without consuming tokens
 * For consumable tokens, tokens are debited
 */
export async function recordServe(
  tokenId: string,
  holderHandle: string,
  resourcePath: string,
  options?: {
    consumeTokens?: boolean;
    tokensToConsume?: number;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<ServeResult> {
  const supabase = createAdminClient();

  // Check if token exists
  const token = await getToken(tokenId);
  if (!token) {
    return { allowed: false, reason: 'Token not found' };
  }

  // Check if user has access
  const canAccess = await hasAccess(tokenId, holderHandle);
  if (!canAccess) {
    return { allowed: false, reason: 'No token balance' };
  }

  const tokensToConsume = options?.consumeTokens
    ? (options.tokensToConsume || 1)
    : 0;

  // If consuming tokens, debit first
  if (tokensToConsume > 0) {
    try {
      await debitTokens(tokenId, holderHandle, tokensToConsume);
    } catch {
      return { allowed: false, reason: 'Insufficient tokens' };
    }
  }

  // Record the serve
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      token_id: tokenId,
      holder_handle: holderHandle,
      resource_path: resourcePath,
      tokens_consumed: tokensToConsume,
      ip_address: options?.ipAddress || null,
      user_agent: options?.userAgent || null
    })
    .select()
    .single();

  if (error) {
    console.error('[path402] recordServe error:', error);
    // Still allow access if recording fails
    return { allowed: true, reason: 'Recorded (with logging error)' };
  }

  // Get remaining balance
  const { data: holding } = await supabase
    .from('path402_holdings')
    .select('balance')
    .eq('token_id', tokenId)
    .eq('holder_handle', holderHandle)
    .single();

  return {
    allowed: true,
    serve: data,
    tokensRemaining: holding?.balance || 0
  };
}

/**
 * Quick access check without recording
 */
export async function checkAccess(
  tokenId: string,
  holderHandle: string
): Promise<{ hasAccess: boolean; balance: number }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('path402_holdings')
    .select('balance')
    .eq('token_id', tokenId)
    .eq('holder_handle', holderHandle)
    .single();

  if (error || !data) {
    return { hasAccess: false, balance: 0 };
  }

  return {
    hasAccess: data.balance > 0,
    balance: data.balance
  };
}

/**
 * Get serve history for a user
 */
export async function getUserServes(
  holderHandle: string,
  limit: number = 50
): Promise<Dollar402Serve[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('holder_handle', holderHandle)
    .order('served_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[path402] getUserServes error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get serve history for a token
 */
export async function getTokenServes(
  tokenId: string,
  limit: number = 100
): Promise<Dollar402Serve[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_id', tokenId)
    .order('served_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[path402] getTokenServes error:', error);
    return [];
  }

  return data || [];
}

/**
 * Get serve count for analytics
 */
export async function getServeStats(
  tokenId: string
): Promise<{
  totalServes: number;
  uniqueHolders: number;
  tokensConsumed: number;
  last24h: number;
}> {
  const supabase = createAdminClient();

  // Total serves
  const { count: totalServes } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenId);

  // Unique holders
  const { data: uniqueData } = await supabase
    .from(TABLE)
    .select('holder_handle')
    .eq('token_id', tokenId);

  const uniqueHolders = new Set(uniqueData?.map(d => d.holder_handle) || []).size;

  // Tokens consumed
  const { data: consumedData } = await supabase
    .from(TABLE)
    .select('tokens_consumed')
    .eq('token_id', tokenId);

  const tokensConsumed = (consumedData || []).reduce(
    (sum, d) => sum + (d.tokens_consumed || 0),
    0
  );

  // Last 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: last24h } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenId)
    .gte('served_at', yesterday);

  return {
    totalServes: totalServes || 0,
    uniqueHolders,
    tokensConsumed,
    last24h: last24h || 0
  };
}
