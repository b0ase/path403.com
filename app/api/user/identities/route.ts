import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Helper to get current user's unified_user_id
async function getCurrentUnifiedUserId(supabase: any): Promise<string | null> {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
  const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;
  const walletAddress = cookieStore.get('b0ase_wallet_address')?.value;

  if (supabaseUser) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', supabaseUser.id)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  if (handcashHandle) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'handcash')
      .eq('provider_user_id', handcashHandle)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  if (walletProvider && walletAddress) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', walletProvider)
      .eq('provider_user_id', walletAddress)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  return null;
}

// GET /api/user/identities - List all linked identities for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: identities, error } = await supabase
      .from('user_identities')
      .select('*')
      .eq('unified_user_id', unifiedUserId)
      .order('linked_at', { ascending: true });

    if (error) {
      console.error('Error fetching identities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ identities: identities || [] });
  } catch (error) {
    console.error('Identities GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/identities - Link a new identity to current user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, provider_user_id, provider_email, provider_handle, oauth_provider, provider_data } = body;

    if (!provider || !provider_user_id) {
      return NextResponse.json({ error: 'provider and provider_user_id are required' }, { status: 400 });
    }

    // Check if this identity is already linked to another user
    const { data: existingIdentity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', provider)
      .eq('provider_user_id', provider_user_id)
      .single();

    if (existingIdentity) {
      if (existingIdentity.unified_user_id === unifiedUserId) {
        return NextResponse.json({ error: 'Identity already linked to your account' }, { status: 400 });
      }
      // Identity belongs to another user - client should prompt for merge
      return NextResponse.json({
        error: 'Identity already linked to another account',
        code: 'IDENTITY_EXISTS',
        existing_unified_user_id: existingIdentity.unified_user_id,
      }, { status: 409 });
    }

    // Link the identity
    const { data: newIdentity, error } = await supabase
      .from('user_identities')
      .insert({
        unified_user_id: unifiedUserId,
        provider,
        provider_user_id,
        provider_email: provider_email || null,
        provider_handle: provider_handle || null,
        oauth_provider: oauth_provider || null,
        provider_data: provider_data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error linking identity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ identity: newIdentity }, { status: 201 });
  } catch (error) {
    console.error('Identities POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/identities - Unlink an identity
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const identityId = searchParams.get('id');

    if (!identityId) {
      return NextResponse.json({ error: 'Identity ID is required' }, { status: 400 });
    }

    // Check how many identities the user has
    const { data: identities } = await supabase
      .from('user_identities')
      .select('id')
      .eq('unified_user_id', unifiedUserId);

    // Allow unlinking if:
    // 1. User has multiple identities, OR
    // 2. User has an email/password in Supabase auth (can still log back in)
    if (identities && identities.length <= 1) {
      // Only one identity - check if they have Supabase email auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) {
        return NextResponse.json({
          error: 'Cannot unlink your only identity. Link another account first or set up a password.',
        }, { status: 400 });
      }
    }

    // Verify the identity belongs to this user
    const { data: identity } = await supabase
      .from('user_identities')
      .select('*')
      .eq('id', identityId)
      .eq('unified_user_id', unifiedUserId)
      .single();

    if (!identity) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
    }

    // Delete the identity
    const { error } = await supabase
      .from('user_identities')
      .delete()
      .eq('id', identityId);

    if (error) {
      console.error('Error unlinking identity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Identities DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
