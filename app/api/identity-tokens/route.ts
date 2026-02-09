import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/identity-tokens - List user's identity tokens
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    const cookieStore = await cookies();
    const twitterUser = cookieStore.get('b0ase_twitter_user')?.value;
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;

    if (!user && !twitterUser && !handcashHandle && !walletProvider) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Non-Supabase users get empty tokens (data is keyed by Supabase user_id)
    if (!user) {
      return NextResponse.json({ tokens: [] });
    }

    const { data: tokens, error } = await supabase
      .from('identity_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching identity tokens:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tokens: tokens || [] });
  } catch (error) {
    console.error('Identity tokens GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/identity-tokens - Create or update an identity token
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { source, identity, symbol, display_name, blockchain, token_contract_address, token_id, is_deployed, total_supply } = body;

    if (!source || !identity || !symbol || !display_name) {
      return NextResponse.json({ error: 'Missing required fields: source, identity, symbol, display_name' }, { status: 400 });
    }

    // Upsert - create or update if exists
    const { data: token, error } = await supabase
      .from('identity_tokens')
      .upsert({
        user_id: user.id,
        source,
        identity,
        symbol,
        display_name,
        blockchain: blockchain || null,
        token_contract_address: token_contract_address || null,
        token_id: token_id || null,
        is_deployed: is_deployed || false,
        total_supply: total_supply || 0,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,source,identity',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating identity token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error('Identity tokens POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/identity-tokens - Update an identity token (for attaching contract address)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, blockchain, token_contract_address, token_id, is_deployed, total_supply } = body;

    if (!id) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (blockchain !== undefined) updateData.blockchain = blockchain;
    if (token_contract_address !== undefined) updateData.token_contract_address = token_contract_address;
    if (token_id !== undefined) updateData.token_id = token_id;
    if (is_deployed !== undefined) updateData.is_deployed = is_deployed;
    if (total_supply !== undefined) updateData.total_supply = total_supply;

    const { data: token, error } = await supabase
      .from('identity_tokens')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating identity token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Identity tokens PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
