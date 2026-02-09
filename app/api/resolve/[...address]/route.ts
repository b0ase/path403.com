/**
 * MetaWeb Address Resolution API
 *
 * Resolves $ addresses to their economic information.
 * Example: GET /api/resolve/$b0ase.com/blog/metaweb-first-native-consumer
 *
 * Returns:
 * - price_sats: Current price in satoshis
 * - supply: Current token supply
 * - holders: Number of token holders
 * - payment_methods: Supported payment methods
 * - content_type: Type of content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pathToTokenId } from '@/lib/tokens/content-tokens';

// Payment methods we accept
const PAYMENT_METHODS = ['handcash', 'bsv'];

// Default price for new content (100 sats)
const DEFAULT_PRICE_SATS = 100;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string[] }> }
) {
  try {
    const { address } = await params;

    // Reconstruct the full address from path segments
    // e.g., ['$b0ase.com', 'blog', 'slug'] -> '$b0ase.com/blog/slug'
    let fullAddress = address.join('/');

    // Handle both formats: $b0ase.com/path and b0ase.com/path
    if (!fullAddress.startsWith('$')) {
      fullAddress = `$${fullAddress}`;
    }

    // Extract the path from the address
    // $b0ase.com/blog/slug -> /blog/slug
    const pathMatch = fullAddress.match(/\$b0ase\.com(\/.*)/);
    const contentPath = pathMatch ? pathMatch[1] : null;

    // Special case: $BOASE token (site entry)
    if (fullAddress === '$BOASE' || fullAddress === '$boase') {
      return NextResponse.json({
        address: '$BOASE',
        type: 'site_entry',
        title: 'b0ase.com Site Access',
        description: 'Entry token for b0ase.com - grants site access and staking rewards',
        price_sats: 25, // ~$0.01 at 2500 sats/USD
        price_usd: 0.01,
        currency: 'sats',
        supply: null, // Unlimited minting
        holders: null,
        payment_methods: PAYMENT_METHODS,
        payment_endpoint: '/api/metaweb/pay',
        content_type: 'access_token',
        resolved_at: new Date().toISOString(),
      });
    }

    if (!contentPath) {
      return NextResponse.json(
        { error: 'Invalid address format. Expected: $b0ase.com/path or $BOASE' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tokenId = pathToTokenId(contentPath);

    // Look up token in database
    const { data: token } = await supabase
      .from('content_tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    // Get holder count
    const { count: holderCount } = await supabase
      .from('user_token_balances')
      .select('*', { count: 'exact', head: true })
      .eq('token_id', tokenId)
      .gt('balance', 0);

    // Get total supply
    const { data: supplyData } = await supabase
      .from('user_token_balances')
      .select('balance')
      .eq('token_id', tokenId);

    const totalSupply = supplyData?.reduce((sum, row) => sum + (row.balance || 0), 0) || 0;

    // Determine content type from path
    let contentType = 'content';
    if (contentPath.startsWith('/blog/')) contentType = 'blog_post';
    else if (contentPath.startsWith('/docs/')) contentType = 'documentation';
    else if (contentPath.startsWith('/api/')) contentType = 'api_endpoint';
    else if (contentPath.startsWith('/tools/')) contentType = 'tool';

    // Get title from path or token
    const title = token?.title || contentPath.split('/').pop()?.replace(/-/g, ' ') || 'Content';

    return NextResponse.json({
      address: fullAddress,
      token_id: tokenId,
      path: contentPath,
      type: 'content_token',
      title: title,
      description: token?.description || `Access token for ${contentPath}`,
      price_sats: token?.price_sats || DEFAULT_PRICE_SATS,
      price_usd: (token?.price_sats || DEFAULT_PRICE_SATS) / 2500, // Approximate USD
      currency: 'sats',
      supply: totalSupply,
      holders: holderCount || 0,
      payment_methods: PAYMENT_METHODS,
      payment_endpoint: '/api/metaweb/pay',
      content_type: contentType,
      issuer: 'b0ase',
      created_at: token?.created_at || null,
      resolved_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Resolve error:', error);
    return NextResponse.json(
      { error: 'Resolution failed', message: error.message },
      { status: 500 }
    );
  }
}
