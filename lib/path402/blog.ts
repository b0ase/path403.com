/**
 * Blog-specific $402 token queries
 *
 * Lookup functions for tokenized blog posts, bridging the blog system
 * with path402 token infrastructure.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { TokenWithPrice, PriceSchedule } from './types';
import { getToken, getTokenPriceSchedule } from './tokens';

const BLOG_MINTS_TABLE = 'path402_blog_mints';

export interface BlogMint {
  id: string;
  token_id: string;
  blog_slug: string;
  inscription_txid: string;
  inscription_vout: number;
  content_hash: string;
  markdown_path: string;
  minted_at: string;
  minted_by: string;
}

export interface BlogTokenStatus {
  tokenized: boolean;
  token?: TokenWithPrice;
  inscription?: {
    txid: string;
    vout: number;
    explorerUrl: string;
    ordinalUrl: string;
  };
  priceSchedule?: PriceSchedule[];
}

/**
 * Get the $402 token for a blog post by slug.
 */
export async function getBlogToken(slug: string): Promise<TokenWithPrice | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(BLOG_MINTS_TABLE)
    .select('token_id')
    .eq('blog_slug', slug)
    .single();

  if (error || !data) return null;

  return getToken(data.token_id);
}

/**
 * Check if a blog post has been minted as a token.
 */
export async function isBlogTokenized(slug: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from(BLOG_MINTS_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('blog_slug', slug);

  if (error) return false;
  return (count ?? 0) > 0;
}

/**
 * Get full token status for a blog post, including inscription proof
 * and price schedule. Used by the Blog402Float component.
 */
export async function getBlogTokenStatus(slug: string): Promise<BlogTokenStatus> {
  const supabase = createAdminClient();

  const { data: mint, error } = await supabase
    .from(BLOG_MINTS_TABLE)
    .select('*')
    .eq('blog_slug', slug)
    .single();

  if (error || !mint) {
    return { tokenized: false };
  }

  const token = await getToken(mint.token_id);
  if (!token) {
    return { tokenized: false };
  }

  const { schedule } = await getTokenPriceSchedule(mint.token_id);

  return {
    tokenized: true,
    token,
    inscription: {
      txid: mint.inscription_txid,
      vout: mint.inscription_vout,
      explorerUrl: `https://whatsonchain.com/tx/${mint.inscription_txid}`,
      ordinalUrl: `https://1satordinals.com/inscription/${mint.inscription_txid}_${mint.inscription_vout}`,
    },
    priceSchedule: schedule,
  };
}

/**
 * Get all tokenized blog slugs.
 */
export async function getTokenizedBlogSlugs(): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(BLOG_MINTS_TABLE)
    .select('blog_slug');

  if (error || !data) return [];
  return data.map(d => d.blog_slug);
}
