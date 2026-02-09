import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// GET /api/user/unified - Get or create unified user profile with all linked identities
export async function GET() {
  try {
    const supabase = await createClient();

    // Check for Supabase user
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    // Check for HandCash user (cookie-based)
    const cookieStore = await cookies();
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;

    // Check for wallet user (MetaMask/Phantom - cookie-based)
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;
    const walletAddress = cookieStore.get('b0ase_wallet_address')?.value;

    // Check for Twitter user (cookie-based, from custom OAuth)
    const twitterUser = cookieStore.get('b0ase_twitter_user')?.value;

    if (!supabaseUser && !handcashHandle && !(walletProvider && walletAddress) && !twitterUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let unifiedUserId: string | null = null;
    let identities: any[] = [];

    // Try to find unified user from Supabase identity
    if (supabaseUser) {
      console.log('[unified] Supabase user found:', supabaseUser.id, supabaseUser.email);

      const { data: supabaseIdentities, error: identityError } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'supabase')
        .eq('provider_user_id', supabaseUser.id)
        .limit(1);

      if (identityError) {
        console.error('[unified] Error fetching identity:', identityError);
        return NextResponse.json({ error: 'Database error: ' + identityError.message }, { status: 500 });
      }

      const supabaseIdentity = supabaseIdentities?.[0];
      if (supabaseIdentity) {
        console.log('[unified] Found existing identity, unified_user_id:', supabaseIdentity.unified_user_id);
        unifiedUserId = supabaseIdentity.unified_user_id;
      } else {
        console.log('[unified] No identity found, creating new unified user...');
        // Create unified user for this Supabase user
        const { data: newUnifiedUser, error: createError } = await supabase
          .from('unified_users')
          .insert({
            display_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
            primary_email: supabaseUser.email,
            avatar_url: supabaseUser.user_metadata?.avatar_url,
          })
          .select()
          .single();

        if (createError) {
          console.error('[unified] Error creating unified user:', createError);
          return NextResponse.json({ error: 'Failed to create user: ' + createError.message }, { status: 500 });
        }

        console.log('[unified] Created unified user:', newUnifiedUser.id);
        unifiedUserId = newUnifiedUser.id;

        // Link Supabase identity
        const { error: linkError } = await supabase
          .from('user_identities')
          .insert({
            unified_user_id: unifiedUserId,
            provider: 'supabase',
            provider_user_id: supabaseUser.id,
            provider_email: supabaseUser.email,
            provider_handle: supabaseUser.user_metadata?.user_name || supabaseUser.user_metadata?.preferred_username,
            oauth_provider: supabaseUser.app_metadata?.provider,
            provider_data: {
              full_name: supabaseUser.user_metadata?.full_name,
              avatar_url: supabaseUser.user_metadata?.avatar_url,
            },
          });

        if (linkError) {
          console.error('[unified] Error linking identity:', linkError);
          return NextResponse.json({ error: 'Failed to link identity: ' + linkError.message }, { status: 500 });
        }
        console.log('[unified] Linked Supabase identity');
      }
    }

    // Try to find unified user from HandCash identity
    if (!unifiedUserId && handcashHandle) {
      const { data: handcashIdentity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'handcash')
        .eq('provider_user_id', handcashHandle)
        .single();

      if (handcashIdentity) {
        unifiedUserId = handcashIdentity.unified_user_id;
      } else {
        // Create unified user for HandCash user
        const { data: newUnifiedUser, error: createError } = await supabase
          .from('unified_users')
          .insert({
            display_name: handcashHandle,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating unified user:', createError);
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        unifiedUserId = newUnifiedUser.id;

        // Link HandCash identity
        await supabase
          .from('user_identities')
          .insert({
            unified_user_id: unifiedUserId,
            provider: 'handcash',
            provider_user_id: handcashHandle,
            provider_handle: `$${handcashHandle}`,
          });
      }
    }

    // Try to find unified user from wallet identity (MetaMask/Phantom)
    if (!unifiedUserId && walletProvider && walletAddress) {
      const { data: walletIdentity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', walletProvider)
        .eq('provider_user_id', walletAddress)
        .single();

      if (walletIdentity) {
        unifiedUserId = walletIdentity.unified_user_id;
      } else {
        // Create unified user for wallet user
        const displayName = walletProvider === 'metamask'
          ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

        const { data: newUnifiedUser, error: createError } = await supabase
          .from('unified_users')
          .insert({
            display_name: displayName,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating unified user:', createError);
          return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        unifiedUserId = newUnifiedUser.id;

        // Link wallet identity
        await supabase
          .from('user_identities')
          .insert({
            unified_user_id: unifiedUserId,
            provider: walletProvider,
            provider_user_id: walletAddress,
            provider_handle: displayName,
            provider_data: {
              chain: walletProvider === 'metamask' ? 'ethereum' : 'solana',
              full_address: walletAddress,
            },
          });
      }
    }

    // Try to find unified user from Twitter identity (custom OAuth)
    if (!unifiedUserId && twitterUser) {
      console.log('[unified] Looking up Twitter user:', twitterUser, '(handle: @' + twitterUser + ')');
      const { data: twitterIdentity, error: twitterLookupError } = await supabase
        .from('user_identities')
        .select('unified_user_id, provider_handle, provider_user_id')
        .eq('provider', 'twitter')
        .eq('provider_handle', `@${twitterUser}`)
        .limit(1);

      if (twitterLookupError) {
        console.error('[unified] Twitter lookup error:', twitterLookupError);
      }

      if (twitterIdentity?.[0]) {
        console.log('[unified] Found Twitter identity:', twitterIdentity[0]);
        unifiedUserId = twitterIdentity[0].unified_user_id;
      } else {
        console.log('[unified] Twitter identity not found for handle: @' + twitterUser);
        // Debug: list all twitter identities
        const { data: allTwitter } = await supabase
          .from('user_identities')
          .select('provider_handle, provider_user_id, unified_user_id')
          .eq('provider', 'twitter')
          .limit(10);
        console.log('[unified] All Twitter identities in DB:', allTwitter);
      }
    }

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Could not determine user identity' }, { status: 400 });
    }

    // Check if this unified user was merged into another
    const { data: unifiedUser } = await supabase
      .from('unified_users')
      .select('*')
      .eq('id', unifiedUserId)
      .single();

    // If merged, follow the merge chain
    let actualUnifiedUserId = unifiedUserId;
    if (unifiedUser?.merged_into_id) {
      actualUnifiedUserId = unifiedUser.merged_into_id;
    }

    // Get the actual unified user
    const { data: actualUser } = await supabase
      .from('unified_users')
      .select('*')
      .eq('id', actualUnifiedUserId)
      .single();

    // Get all linked identities
    const { data: linkedIdentities } = await supabase
      .from('user_identities')
      .select('*')
      .eq('unified_user_id', actualUnifiedUserId)
      .order('linked_at', { ascending: true });

    return NextResponse.json({
      unified_user: actualUser,
      identities: linkedIdentities || [],
      // Also include current auth context
      current_auth: {
        supabase_user_id: supabaseUser?.id || null,
        supabase_email: supabaseUser?.email || null,
        supabase_provider: supabaseUser?.app_metadata?.provider || null,
        handcash_handle: handcashHandle || null,
        wallet_provider: walletProvider || null,
        wallet_address: walletAddress || null,
        twitter_user: twitterUser || null,
      },
    });
  } catch (error) {
    console.error('Unified user GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/user/unified - Update unified user profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;
    const walletAddress = cookieStore.get('b0ase_wallet_address')?.value;
    const twitterUser = cookieStore.get('b0ase_twitter_user')?.value;

    if (!supabaseUser && !handcashHandle && !(walletProvider && walletAddress) && !twitterUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, primary_email, avatar_url } = body;

    // Find the user's unified_user_id
    let unifiedUserId: string | null = null;

    if (supabaseUser) {
      const { data } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'supabase')
        .eq('provider_user_id', supabaseUser.id)
        .single();
      unifiedUserId = data?.unified_user_id;
    } else if (handcashHandle) {
      const { data } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'handcash')
        .eq('provider_user_id', handcashHandle)
        .single();
      unifiedUserId = data?.unified_user_id;
    } else if (walletProvider && walletAddress) {
      const { data } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', walletProvider)
        .eq('provider_user_id', walletAddress)
        .single();
      unifiedUserId = data?.unified_user_id;
    } else if (twitterUser) {
      const { data } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'twitter')
        .eq('provider_handle', `@${twitterUser}`)
        .limit(1);
      unifiedUserId = data?.[0]?.unified_user_id;
    }

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (display_name !== undefined) updateData.display_name = display_name;
    if (primary_email !== undefined) updateData.primary_email = primary_email;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data: updatedUser, error } = await supabase
      .from('unified_users')
      .update(updateData)
      .eq('id', unifiedUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating unified user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ unified_user: updatedUser });
  } catch (error) {
    console.error('Unified user PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
