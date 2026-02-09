/**
 * GET /api/twitter/tokenized
 *
 * Public endpoint — list all tokenized Twitter accounts.
 * Powers the discovery/directory page.
 */

import { NextResponse } from 'next/server';
import { listTokenizedTwitterAccounts } from '@/lib/twitter/tokenize';
import { calculatePrice } from '@/lib/path402/pricing';

export async function GET() {
  const tokens = await listTokenizedTwitterAccounts();

  const accounts = tokens.map(token => {
    const username = token.token_id.replace('TWITTER_', '').toLowerCase();
    const currentPrice = calculatePrice(
      token.base_price_sats,
      token.total_supply || 0,
      token.pricing_model || 'sqrt_decay',
      token.decay_factor || 1.0,
    );

    return {
      username,
      token_id: token.token_id,
      name: token.name,
      icon_url: token.icon_url,
      total_supply: token.total_supply || 0,
      current_price_sats: currentPrice,
      issuer_handle: token.issuer_handle,
      created_at: token.created_at,
    };
  });

  return NextResponse.json({ accounts, count: accounts.length });
}
