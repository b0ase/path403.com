import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSymbol, generateBSV21Inscription } from '@/lib/token';
import { createHash } from 'crypto';

function generateTokenIdServer(symbol: string, issuerAddress: string): string {
  const data = `path402:${symbol}:${issuerAddress}`;
  return createHash('sha256').update(data).digest('hex');
}

async function getHolderFromCookies(request: NextRequest) {
  if (!supabase) return null;
  const handle = request.cookies.get('hc_handle')?.value;
  if (!handle) return null;

  const { data } = await supabase
    .from('path402_holders')
    .select('*')
    .eq('provider', 'handcash')
    .eq('handle', handle)
    .single();

  return data;
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const holder = await getHolderFromCookies(request);
  if (!holder) {
    return NextResponse.json({ identity: null });
  }

  const { data: identity } = await supabase
    .from('path402_identity_tokens')
    .select('*')
    .eq('holder_id', holder.id)
    .single();

  return NextResponse.json({ identity: identity || null });
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const holder = await getHolderFromCookies(request);
  if (!holder) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const symbol = body.symbol as string;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const validation = validateSymbol(symbol);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Check if holder already has an identity
  const { data: existing } = await supabase
    .from('path402_identity_tokens')
    .select('id')
    .eq('holder_id', holder.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Identity already minted' }, { status: 409 });
  }

  // Check if symbol is taken
  const { data: symbolTaken } = await supabase
    .from('path402_identity_tokens')
    .select('id')
    .eq('symbol', symbol)
    .single();

  if (symbolTaken) {
    return NextResponse.json({ error: 'Symbol already taken' }, { status: 409 });
  }

  const issuerAddress = holder.address || `hc:${holder.handle}`;
  const totalSupply = '100000000000000000'; // 1B with 8 decimals
  const decimals = 8;
  const accessRate = 1;

  const tokenId = generateTokenIdServer(symbol, issuerAddress);
  const inscriptionData = generateBSV21Inscription(symbol, totalSupply, decimals, accessRate);

  const { data: identity, error } = await supabase
    .from('path402_identity_tokens')
    .insert({
      holder_id: holder.id,
      symbol,
      token_id: tokenId,
      issuer_address: issuerAddress,
      total_supply: totalSupply,
      decimals,
      access_rate: accessRate,
      inscription_data: JSON.parse(inscriptionData),
      broadcast_status: 'local',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ identity });
}
