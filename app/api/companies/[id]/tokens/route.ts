import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/companies/[id]/tokens - List tokens for a company
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the company belongs to the user
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { data: tokens, error } = await supabase
      .from('company_tokens')
      .select(`
        *,
        cap_table_entries (*)
      `)
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company tokens:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tokens: tokens || [] });
  } catch (error) {
    console.error('Company tokens GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/companies/[id]/tokens - Create a new token for a company
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the company belongs to the user
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();
    const { symbol, name, share_class, total_supply, nominal_value, blockchain, token_contract_address } = body;

    if (!symbol?.trim() || !name?.trim()) {
      return NextResponse.json({ error: 'Symbol and name are required' }, { status: 400 });
    }

    const { data: token, error } = await supabase
      .from('company_tokens')
      .insert({
        company_id: id,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        share_class: share_class || 'Ordinary',
        total_supply: total_supply || 0,
        nominal_value: nominal_value || 0.01,
        blockchain: blockchain || null,
        token_contract_address: token_contract_address || null,
        is_deployed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error('Company tokens POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
