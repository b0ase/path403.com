/**
 * Blog Token Minting Orchestrator
 *
 * Mints a blog post as a $402 token backed by a BSV inscription.
 * The inscription txid+vout IS the ordinal root — no separate keypairs needed.
 *
 * Flow:
 * 1. Read markdown → compute content hash
 * 2. Inscribe on BSV → get txid
 * 3. Create path402_token record
 * 4. Create path402_blog_mints record linking token to inscription
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  hashContent,
  inscribeBlogPost,
  createBlogInscriptionDataFromMarkdown,
} from '@/lib/blog-inscription';
import { createToken } from '@/lib/path402/tokens';
import { isBlogTokenized } from '@/lib/path402/blog';

export interface MintResult {
  tokenId: string;
  inscriptionId: string;
  txid: string;
  contentHash: string;
  explorerUrl: string;
  ordinalUrl: string;
}

export interface MintOptions {
  base_price_sats?: number;
  max_supply?: number;
  issuer_handle?: string;
}

/**
 * Mint a blog post as a $402 token.
 *
 * @param slug - The blog post slug (must match a file in content/blog/)
 * @param mintedBy - The admin email or handle performing the mint
 * @param options - Optional pricing config
 */
export async function mintBlogToken(
  slug: string,
  mintedBy: string,
  options: MintOptions = {}
): Promise<MintResult> {
  // 1. Check not already minted
  const alreadyMinted = await isBlogTokenized(slug);
  if (alreadyMinted) {
    throw new Error(`Blog post "${slug}" is already tokenized`);
  }

  // 2. Read markdown content
  const markdownPath = `content/blog/${slug}.md`;
  const absolutePath = join(process.cwd(), markdownPath);

  let markdown: string;
  try {
    markdown = readFileSync(absolutePath, 'utf-8');
  } catch {
    throw new Error(`Blog post not found: ${markdownPath}`);
  }

  // 3. Compute content hash
  const contentHash = await hashContent(markdown);

  // 4. Inscribe on BSV
  const inscriptionData = createBlogInscriptionDataFromMarkdown(slug, markdown);
  const inscription = await inscribeBlogPost(inscriptionData);

  // 5. Create token ID from slug
  const tokenId = `BLOG_${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  const issuerHandle = options.issuer_handle || 'b0ase';

  // 6. Create path402_token
  await createToken(issuerHandle, {
    token_id: tokenId,
    name: `$${slug}`,
    description: `Access token for blog post: ${inscriptionData.title}`,
    base_price_sats: options.base_price_sats || 500,
    pricing_model: 'sqrt_decay',
    max_supply: options.max_supply || undefined,
    content_type: 'blog',
    access_url: `/blog/$${slug}`,
    issuer_share_bps: 7000,
    platform_share_bps: 3000,
  });

  // 7. Create blog_mints record
  const supabase = createAdminClient();
  const { error: mintError } = await supabase
    .from('path402_blog_mints')
    .insert({
      token_id: tokenId,
      blog_slug: slug,
      inscription_txid: inscription.txid,
      inscription_vout: 0,
      content_hash: contentHash,
      markdown_path: markdownPath,
      minted_by: mintedBy,
    });

  if (mintError) {
    throw new Error(`Failed to record blog mint: ${mintError.message}`);
  }

  return {
    tokenId,
    inscriptionId: inscription.inscriptionId,
    txid: inscription.txid,
    contentHash,
    explorerUrl: inscription.blockchainExplorerUrl,
    ordinalUrl: inscription.ordinalUrl,
  };
}
