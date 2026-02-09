import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { tokenizeTwitterAccount } from '@/lib/twitter/tokenize';

export async function GET(request: NextRequest) {
  console.log('🐦 Twitter callback received:', request.url);

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('🐦 Params:', { code: code ? 'present' : 'missing', state, error, errorDescription });

  // Handle OAuth errors
  if (error) {
    console.error('🐦 Twitter OAuth error:', error, errorDescription);
    const errorUrl = new URL('/user/account', request.url);
    errorUrl.searchParams.set('error', `twitter_${error}`);
    if (errorDescription) {
      errorUrl.searchParams.set('details', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL('/user/account?error=twitter_no_code', request.url));
  }

  try {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;
    const savedState = cookieStore.get('twitter_oauth_state')?.value;

    // Verify state to prevent CSRF
    if (!savedState || savedState !== state) {
      console.error('Twitter OAuth state mismatch');
      return NextResponse.redirect(new URL('/user/account?error=twitter_state_mismatch', request.url));
    }

    if (!codeVerifier) {
      console.error('Twitter code verifier not found');
      return NextResponse.redirect(new URL('/user/account?error=twitter_verifier_missing', request.url));
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Twitter credentials not configured');
      return NextResponse.redirect(new URL('/user/account?error=twitter_not_configured', request.url));
    }

    // Determine redirect URI from actual request origin (must match authorization)
    const requestUrl = new URL(request.url);
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // For production b0ase.com, always use www (b0ase.com redirects to www.b0ase.com)
    if (baseUrl.includes('b0ase.com') && !baseUrl.includes('www.')) {
      baseUrl = baseUrl.replace('://b0ase.com', '://www.b0ase.com');
    }
    const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Twitter token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/user/account?error=twitter_token_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    console.log('Twitter tokens received');

    // Fetch user profile
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('Twitter user fetch failed:', errorData);
      return NextResponse.redirect(new URL('/user/account?error=twitter_user_failed', request.url));
    }

    const userData = await userResponse.json();
    const twitterUser = userData.data;

    console.log('Twitter user:', twitterUser.username);

    // Link to unified user system
    const supabase = await createClient();

    // Check for existing user session
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;
    const walletAddress = cookieStore.get('b0ase_wallet_address')?.value;

    let unifiedUserId: string | null = null;

    // Find existing unified user
    if (supabaseUser) {
      const { data: identity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'supabase')
        .eq('provider_user_id', supabaseUser.id)
        .limit(1);
      unifiedUserId = identity?.[0]?.unified_user_id || null;
    }

    if (!unifiedUserId && handcashHandle) {
      const { data: identity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'handcash')
        .eq('provider_user_id', handcashHandle)
        .limit(1);
      unifiedUserId = identity?.[0]?.unified_user_id || null;
    }

    if (!unifiedUserId && walletProvider && walletAddress) {
      const { data: identity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', walletProvider)
        .eq('provider_user_id', walletAddress)
        .limit(1);
      unifiedUserId = identity?.[0]?.unified_user_id || null;
    }

    // Check if Twitter identity already exists
    const { data: existingTwitterIdentity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'twitter')
      .eq('provider_user_id', twitterUser.id)
      .limit(1);

    if (existingTwitterIdentity?.[0]) {
      if (unifiedUserId && existingTwitterIdentity[0].unified_user_id !== unifiedUserId) {
        // Twitter belongs to different account - issue merge token
        console.log('Twitter identity belongs to different unified user - initiating merge flow');

        try {
          const { createMergeToken } = await import('@/lib/auth/merge-token');
          const mergeToken = await createMergeToken({
            source_user_id: existingTwitterIdentity[0].unified_user_id,
            target_user_id: unifiedUserId,
            provider: 'twitter'
          });

          return NextResponse.redirect(new URL(`/user/account?merge_token=${mergeToken}`, request.url));
        } catch (tokenError) {
          console.error('Failed to create merge token:', tokenError);
          return NextResponse.redirect(new URL('/user/account?error=merge_token_failed', request.url));
        }
      }
      // Already linked to this user or user not logged in with other method
      unifiedUserId = existingTwitterIdentity[0].unified_user_id;
    } else if (unifiedUserId) {
      // Link Twitter to existing unified user
      const { error: linkError } = await supabase.from('user_identities').insert({
        unified_user_id: unifiedUserId,
        provider: 'twitter',
        provider_user_id: twitterUser.id,
        provider_handle: `@${twitterUser.username}`,
        provider_data: {
          name: twitterUser.name,
          username: twitterUser.username,
          profile_image_url: twitterUser.profile_image_url,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        },
      });
      if (linkError) {
        console.error('🐦 Failed to link Twitter identity:', linkError);
      } else {
        console.log('🐦 Twitter linked to existing unified user:', unifiedUserId);
      }
    } else {
      // Create new unified user for Twitter login
      const { data: newUnifiedUser, error: createError } = await supabase
        .from('unified_users')
        .insert({
          display_name: twitterUser.name || twitterUser.username,
          avatar_url: twitterUser.profile_image_url,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create unified user:', createError);
        return NextResponse.redirect(new URL('/user/account?error=twitter_create_failed', request.url));
      }

      unifiedUserId = newUnifiedUser.id;

      // Create Twitter identity
      const { error: identityError } = await supabase.from('user_identities').insert({
        unified_user_id: unifiedUserId,
        provider: 'twitter',
        provider_user_id: twitterUser.id,
        provider_handle: `@${twitterUser.username}`,
        provider_data: {
          name: twitterUser.name,
          username: twitterUser.username,
          profile_image_url: twitterUser.profile_image_url,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        },
      });
      if (identityError) {
        console.error('🐦 Failed to create Twitter identity:', identityError);
      } else {
        console.log('🐦 New unified user created for Twitter, id:', unifiedUserId);
      }
    }

    // Auto-tokenize Twitter account if user has HandCash connected
    if (unifiedUserId && handcashHandle) {
      try {
        await tokenizeTwitterAccount(
          {
            twitterId: twitterUser.id,
            username: twitterUser.username,
            displayName: twitterUser.name || twitterUser.username,
            profileImageUrl: twitterUser.profile_image_url,
          },
          handcashHandle,
        );
        console.log('🐦 Auto-tokenized @' + twitterUser.username);
      } catch (tokenizeError) {
        // Non-fatal — user can manually tokenize later
        console.error('🐦 Auto-tokenize failed (non-fatal):', tokenizeError);
      }
    }

    // Set Twitter cookie for session
    const response = NextResponse.redirect(new URL('/user/account', request.url));

    response.cookies.set('b0ase_twitter_user', twitterUser.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2592000, // 30 days
      path: '/',
    });

    // Clear OAuth cookies
    response.cookies.delete('twitter_code_verifier');
    response.cookies.delete('twitter_oauth_state');

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(new URL('/user/account?error=twitter_callback_failed', request.url));
  }
}
