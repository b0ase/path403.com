import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/companies - List user's companies
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

    // Non-Supabase users get empty companies (data is keyed by Supabase user_id)
    if (!user) {
      return NextResponse.json({ companies: [] });
    }

    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        company_tokens (
          *,
          cap_table_entries (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ companies: companies || [] });
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/companies - Create a new company
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, companies_house_number, registered_address, incorporation_date } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        user_id: user.id,
        name: name.trim(),
        companies_house_number: companies_house_number?.trim() || null,
        registered_address: registered_address?.trim() || null,
        incorporation_date: incorporation_date || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
