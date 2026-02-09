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
    const { data } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', supabaseUser.id)
      .single();
    return data?.unified_user_id || null;
  }

  if (handcashHandle) {
    const { data } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'handcash')
      .eq('provider_user_id', handcashHandle)
      .single();
    return data?.unified_user_id || null;
  }

  if (walletProvider && walletAddress) {
    const { data } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', walletProvider)
      .eq('provider_user_id', walletAddress)
      .single();
    return data?.unified_user_id || null;
  }

  return null;
}

// POST /api/user/merge - Merge another account into the current account
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const currentUnifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!currentUnifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { merge_token, confirmation } = body;

    let source_unified_user_id: string;

    if (merge_token) {
      // Secure flow: verify token
      const { verifyMergeToken } = await import('@/lib/auth/merge-token');
      const payload = await verifyMergeToken(merge_token);

      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired merge token' }, { status: 401 });
      }

      if (payload.target_user_id !== currentUnifiedUserId) {
        return NextResponse.json({ error: 'Token mismatch' }, { status: 403 });
      }

      source_unified_user_id = payload.source_user_id;

    } else {
      // Fallback or Legacy check (Disable for security if ready)
      // For now, let's disable direct ID merging to enforce security
      return NextResponse.json({ error: 'Merge token required' }, { status: 400 });
    }

    if (source_unified_user_id === currentUnifiedUserId) {
      return NextResponse.json({ error: 'Cannot merge account with itself' }, { status: 400 });
    }

    // Get info about both accounts for confirmation
    const { data: sourceUser } = await supabase
      .from('unified_users')
      .select('*')
      .eq('id', source_unified_user_id)
      .single();

    const { data: targetUser } = await supabase
      .from('unified_users')
      .select('*')
      .eq('id', currentUnifiedUserId)
      .single();

    if (!sourceUser || !targetUser) {
      return NextResponse.json({ error: 'One or both accounts not found' }, { status: 404 });
    }

    // If source was already merged, follow the chain
    if (sourceUser.merged_into_id) {
      return NextResponse.json({
        error: 'Source account was already merged',
        merged_into: sourceUser.merged_into_id,
      }, { status: 400 });
    }

    // Get counts for both accounts
    const { count: sourceIdentityCount } = await supabase
      .from('user_identities')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', source_unified_user_id);

    const { count: sourceCompanyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', source_unified_user_id);

    const { count: targetIdentityCount } = await supabase
      .from('user_identities')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', currentUnifiedUserId);

    const { count: targetCompanyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', currentUnifiedUserId);

    // If no confirmation, return preview
    if (!confirmation) {
      return NextResponse.json({
        preview: true,
        source: {
          unified_user: sourceUser,
          identity_count: sourceIdentityCount || 0,
          company_count: sourceCompanyCount || 0,
        },
        target: {
          unified_user: targetUser,
          identity_count: targetIdentityCount || 0,
          company_count: targetCompanyCount || 0,
        },
        message: `Merging will move ${sourceIdentityCount || 0} identities and ${sourceCompanyCount || 0} companies to your current account.`,
      });
    }

    // Perform the merge
    // 1. Move all identities from source to target
    const { error: identitiesError } = await supabase
      .from('user_identities')
      .update({ unified_user_id: currentUnifiedUserId })
      .eq('unified_user_id', source_unified_user_id);

    if (identitiesError) {
      console.error('Error moving identities:', identitiesError);
      return NextResponse.json({ error: 'Failed to move identities' }, { status: 500 });
    }

    // 2. Move all companies from source to target
    const { error: companiesError } = await supabase
      .from('companies')
      .update({ unified_user_id: currentUnifiedUserId })
      .eq('unified_user_id', source_unified_user_id);

    if (companiesError) {
      console.error('Error moving companies:', companiesError);
      return NextResponse.json({ error: 'Failed to move companies' }, { status: 500 });
    }

    // 3. Move all identity tokens from source to target
    const { error: tokensError } = await supabase
      .from('identity_tokens')
      .update({ unified_user_id: currentUnifiedUserId })
      .eq('unified_user_id', source_unified_user_id);

    if (tokensError) {
      console.error('Error moving identity tokens:', tokensError);
      // Non-fatal, continue
    }

    // 4. Tombstone the source user
    const { error: tombstoneError } = await supabase
      .from('unified_users')
      .update({
        merged_into_id: currentUnifiedUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', source_unified_user_id);

    if (tombstoneError) {
      console.error('Error tombstoning source user:', tombstoneError);
      return NextResponse.json({ error: 'Failed to complete merge' }, { status: 500 });
    }

    // Get updated counts
    const { count: newIdentityCount } = await supabase
      .from('user_identities')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', currentUnifiedUserId);

    const { count: newCompanyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', currentUnifiedUserId);

    return NextResponse.json({
      success: true,
      message: 'Accounts merged successfully',
      merged_from: source_unified_user_id,
      merged_into: currentUnifiedUserId,
      new_identity_count: newIdentityCount || 0,
      new_company_count: newCompanyCount || 0,
    });
  } catch (error) {
    console.error('Merge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
