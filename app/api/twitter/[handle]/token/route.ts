/**
 * GET /api/twitter/[handle]/token
 *
 * Public endpoint — get token info for a Twitter handle.
 * Returns pricing, supply, and token details if the account is tokenized.
 * Returns 404 if not tokenized.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTwitterToken, twitterTokenId } from '@/lib/twitter/tokenize';
import { generatePriceSchedule } from '@/lib/path402/pricing';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const username = handle.replace(/^@/, '');

  const token = await getTwitterToken(username);

  if (!token) {
    return NextResponse.json(
      { tokenized: false, handle: username },
      { status: 404 }
    );
  }

  const schedule = generatePriceSchedule(
    token.base_price_sats,
    token.pricing_model,
    token.decay_factor
  );

  return NextResponse.json({
    tokenized: true,
    handle: username,
    token_id: token.token_id,
    name: token.name,
    current_price_sats: token.current_price_sats,
    next_price_sats: token.next_price_sats,
    total_supply: token.total_supply,
    base_price_sats: token.base_price_sats,
    issuer_handle: token.issuer_handle,
    icon_url: token.icon_url,
    price_schedule: schedule.slice(0, 10),
  });
}
