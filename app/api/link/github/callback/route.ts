import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('🔗 GitHub link callback received');

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('GitHub OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/user/account?error=github_${error}&tab=connections`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/user/account?error=github_no_code&tab=connections', request.url));
  }

  try {
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('github_code_verifier')?.value;
    const savedState = cookieStore.get('github_oauth_state')?.value;

    // Verify state to prevent CSRF
    if (!savedState || savedState !== state) {
      console.error('GitHub OAuth state mismatch');
      return NextResponse.redirect(new URL('/user/account?error=github_state_mismatch&tab=connections', request.url));
    }

    if (!codeVerifier) {
      console.error('GitHub code verifier not found');
      return NextResponse.redirect(new URL('/user/account?error=github_verifier_missing&tab=connections', request.url));
    }

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('GitHub credentials not configured');
      return NextResponse.redirect(new URL('/user/account?error=github_not_configured&tab=connections', request.url));
    }

    // Determine redirect URI
    const requestUrl = new URL(request.url);
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    if (baseUrl.includes('b0ase.com') && !baseUrl.includes('www.')) {
      baseUrl = baseUrl.replace('://b0ase.com', '://www.b0ase.com');
    }
    const redirectUri = `${baseUrl}/api/link/github/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/user/account?error=github_token_failed&tab=connections', request.url));
    }

    const tokens = await tokenResponse.json();
    console.log('GitHub tokens received');

    // Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': 'b0ase.com',
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('GitHub user fetch failed:', errorData);
      return NextResponse.redirect(new URL('/user/account?error=github_user_failed&tab=connections', request.url));
    }

    const githubUser = await userResponse.json();
    console.log('GitHub user:', githubUser.login);

    // Link to current logged-in user
    const supabase = await createClient();

    // MUST have an active Supabase session to link
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      console.error('No active session - cannot link GitHub');
      return NextResponse.redirect(new URL('/login?error=not_logged_in', request.url));
    }

    // Find this user's unified_user_id
    const { data: identity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', supabaseUser.id)
      .limit(1)
      .single();

    if (!identity) {
      console.error('Unified user not found for Supabase user:', supabaseUser.id);
      return NextResponse.redirect(new URL('/user/account?error=unified_user_not_found&tab=connections', request.url));
    }

    const unifiedUserId = identity.unified_user_id;

    // Check if THIS user already has GitHub linked
    const { data: existingGithub } = await supabase
      .from('user_identities')
      .select('id')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', 'github_link')
      .single();

    if (existingGithub) {
      // Update existing
      const { error: updateError } = await supabase
        .from('user_identities')
        .update({
          provider_handle: githubUser.login,
          provider_email: githubUser.email,
          provider_data: {
            id: githubUser.id,
            login: githubUser.login,
            name: githubUser.name,
            email: githubUser.email,
            avatar_url: githubUser.avatar_url,
          },
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', existingGithub.id);

      if (updateError) {
        console.error('Failed to update GitHub link:', updateError);
        return NextResponse.redirect(new URL('/user/account?error=github_update_failed&tab=connections', request.url));
      }

      console.log('✅ Updated GitHub link for user:', unifiedUserId);
    } else {
      // Create new - ALLOW DUPLICATES (same GitHub account can be linked to multiple users)
      const { error: insertError } = await supabase
        .from('user_identities')
        .insert({
          unified_user_id: unifiedUserId,
          provider: 'github_link',
          provider_user_id: String(githubUser.id),
          provider_handle: githubUser.login,
          provider_email: githubUser.email,
          provider_data: {
            id: githubUser.id,
            login: githubUser.login,
            name: githubUser.name,
            email: githubUser.email,
            avatar_url: githubUser.avatar_url,
          },
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          linked_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Failed to create GitHub link:', insertError);
        return NextResponse.redirect(new URL('/user/account?error=github_link_failed&tab=connections', request.url));
      }

      console.log('✅ Created GitHub link for user:', unifiedUserId);
    }

    // Redirect to account page
    const response = NextResponse.redirect(new URL('/user/account?tab=connections&success=github_linked', request.url));

    // Clear OAuth cookies
    response.cookies.delete('github_code_verifier');
    response.cookies.delete('github_oauth_state');

    return response;
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(new URL('/user/account?error=github_callback_failed&tab=connections', request.url));
  }
}
