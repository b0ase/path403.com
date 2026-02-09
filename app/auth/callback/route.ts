import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const target = requestedNext ? `${origin}${requestedNext}` : `${origin}/login`
    const separator = target.includes('?') ? '&' : '?'
    return NextResponse.redirect(`${target}${separator}error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Check if user already has an existing unified user from other auth methods BEFORE exchanging code
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value
    const walletAddress = cookieStore.get('b0ase_wallet_address')?.value
    const twitterUser = cookieStore.get('b0ase_twitter_user')?.value

    let existingUnifiedUserId: string | null = null

    // Find existing unified user from HandCash
    if (handcashHandle) {
      const { data: handcashIdentity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'handcash')
        .eq('provider_user_id', handcashHandle)
        .single()
      if (handcashIdentity) {
        existingUnifiedUserId = handcashIdentity.unified_user_id
      }
    }

    // Find existing unified user from wallet
    if (!existingUnifiedUserId && walletProvider && walletAddress) {
      const { data: walletIdentity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', walletProvider)
        .eq('provider_user_id', walletAddress)
        .single()
      if (walletIdentity) {
        existingUnifiedUserId = walletIdentity.unified_user_id
      }
    }

    // Find existing unified user from Twitter (custom OAuth)
    if (!existingUnifiedUserId && twitterUser) {
      const { data: twitterIdentity } = await supabase
        .from('user_identities')
        .select('unified_user_id')
        .eq('provider', 'twitter')
        .eq('provider_handle', `@${twitterUser}`)
        .single()
      if (twitterIdentity) {
        existingUnifiedUserId = twitterIdentity.unified_user_id
      }
    }

    // Debug: Log what we're exchanging
    console.log('🔄 Exchanging code for session...')

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    // Debug: Log the full session data structure (with sensitive parts redacted)
    console.log('📦 Session data received:', {
      hasUser: !!sessionData?.user,
      hasSession: !!sessionData?.session,
      sessionKeys: sessionData?.session ? Object.keys(sessionData.session) : [],
      userProvider: sessionData?.user?.app_metadata?.provider,
      userId: sessionData?.user?.id
    })

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)

      // Check for 'identity_already_exists' error
      // This happens when the user tries to link a social account that is already linked to another user.
      // We allow multiple users to "link" to the same social accounts for displaying info.
      if (exchangeError.message.includes('Identity is already linked')) {
        console.warn('⚠️ Identity already linked. Allowing duplicate connection for multiple accounts.')

        // Get the current user's session (they should still be logged in)
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (currentUser) {
          // Find this user's unified_user_id
          const { data: currentIdentity } = await supabase
            .from('user_identities')
            .select('unified_user_id')
            .eq('provider', 'supabase')
            .eq('provider_user_id', currentUser.id)
            .limit(1)
            .single()

          if (currentIdentity) {
            console.log('✅ Current user unified_user_id:', currentIdentity.unified_user_id)

            // Try to determine which provider is being linked from the URL/state
            // This is tricky because we don't have the identity data from the failed OAuth
            // But we can make an educated guess based on the redirect_uri or state

            // For now, just redirect back with a more helpful message
            // TODO: Actually fetch the identity data and create the duplicate record

            const target = requestedNext ? `${origin}${requestedNext}` : `${origin}/user/account?tab=connections`
            const separator = target.includes('?') ? '&' : '?'
            return NextResponse.redirect(`${target}${separator}warning=identity_shared`)
          }
        }

        // If we can't handle it properly, show the error
        const target = requestedNext ? `${origin}${requestedNext}` : `${origin}/user/account`
        const separator = target.includes('?') ? '&' : '?'
        return NextResponse.redirect(`${target}${separator}error=identity_already_linked`)
      }

      // Check for specific PKCE errors and provide clearer guidance
      if (
        exchangeError.message.includes('code verifier') ||
        exchangeError.message.includes('PKCE') ||
        exchangeError.message.includes('flow state')
      ) {
        // Clear cookies and force a clean state
        const response = NextResponse.redirect(`${origin}/login?error=auth_expired&details=${encodeURIComponent('Session expired. Please log in again.')}`);

        // Nuke cookies on the response to be safe
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');

        return response;
      }

      return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(exchangeError.message)}`)
    }

    // After successful OAuth, link to existing unified user if one exists
    const supabaseUser = sessionData?.user

    // 7. Extract Auth Tokens
    const providerToken = sessionData?.session?.provider_token || null
    const providerRefreshToken = sessionData?.session?.provider_refresh_token || null

    // NOTE: We do NOT use session.expires_at for provider tokens, as Supabase session expiry 
    // does not match provider token expiry (e.g. GitHub tokens last 8h or forever, Supabase lasts 1h).
    // keeping it null allows the token to be used until it actually fails at the source.
    const providerTokenExpiresAt: string | null = null

    // Determine the current provider being authenticated/linked
    const authFlow = searchParams.get('auth_flow')

    // Explicitly check if this is a GitHub flow (from our custom param or the next URL)
    const isGitHubFlow = authFlow === 'linking' && (requestedNext?.includes('repos') || requestedNext?.includes('github'));

    // If it's a GitHub flow, force the provider to be 'github'
    // Otherwise, check if we can infer it from the user metadata
    let currentProvider = isGitHubFlow ? 'github' : supabaseUser?.app_metadata?.provider;

    // If still unsure, and we have a provider token, try to match it to an identity that has just been updated/linked
    // But relying on explicit 'isGitHubFlow' is the safest bet for our specific problem.

    console.log('🔗 Auth Flow Analysis:', {
      authFlow,
      isGitHubFlow,
      detectedProvider: currentProvider,
      hasToken: !!providerToken
    })

    if (supabaseUser) {
      const supabaseIdentities = (supabaseUser as any)?.identities || []
      console.log(`🔍 Syncing ${supabaseIdentities.length} identities. Current: ${currentProvider}`)

      for (const identity of supabaseIdentities) {
        const providerName = identity.provider
        // We only save the token for the provider that was JUST used to authenticate
        const isCurrentAuth = providerName === currentProvider

        // Check if this identity already has a record in our unified user_identities table
        const { data: existingIdentity } = await supabase
          .from('user_identities')
          .select('id, unified_user_id')
          .eq('provider', 'supabase')
          .eq('provider_user_id', supabaseUser.id)
          .eq('oauth_provider', providerName)
          .single()

        if (existingIdentity) {
          // UPDATE existing identity
          const updateData: any = {
            last_used_at: new Date().toISOString(),
            provider_handle: identity.identity_data?.user_name || identity.identity_data?.preferred_username || identity.identity_data?.email,
          }

          // If this is the provider we just authenticated with, update the tokens
          if (isCurrentAuth && providerToken) {
            console.log(`✅ Updating tokens for provider: ${providerName}`)
            updateData.access_token = providerToken
            updateData.refresh_token = providerRefreshToken
            // Don't overwrite expiration with incorrect session expiry
            updateData.token_expires_at = null
          }

          await supabase.from('user_identities').update(updateData).eq('id', existingIdentity.id)
        } else {
          // CREATE new identity record for this provider
          console.log(`🆕 Creating new identity record for provider: ${providerName}`)

          let targetUnifiedUserId = existingUnifiedUserId

          if (!targetUnifiedUserId) {
            // Check if ANY other identity for this Supabase user exists to get the unified_user_id
            const { data: otherIdentity } = await supabase
              .from('user_identities')
              .select('unified_user_id')
              .eq('provider', 'supabase')
              .eq('provider_user_id', supabaseUser.id)
              .limit(1)
              .single()

            if (otherIdentity) {
              targetUnifiedUserId = otherIdentity.unified_user_id
            } else {
              // Create new unified user if none exists
              const { data: newUnifiedUser } = await supabase
                .from('unified_users')
                .insert({
                  display_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
                  primary_email: supabaseUser.email,
                  avatar_url: supabaseUser.user_metadata?.avatar_url,
                })
                .select()
                .single()

              if (newUnifiedUser) targetUnifiedUserId = newUnifiedUser.id
            }
          }

          if (targetUnifiedUserId) {
            const insertData: any = {
              unified_user_id: targetUnifiedUserId,
              provider: 'supabase',
              provider_user_id: supabaseUser.id,
              provider_email: identity.identity_data?.email || supabaseUser.email,
              provider_handle: identity.identity_data?.user_name || identity.identity_data?.preferred_username || identity.identity_data?.email,
              oauth_provider: providerName,
              provider_data: identity.identity_data,
              linked_at: new Date().toISOString(),
              last_used_at: new Date().toISOString(),
            }

            // If this is the provider we just authenticated with, store the tokens
            if (isCurrentAuth && providerToken) {
              console.log(`✅ Storing tokens for new provider: ${providerName}`)
              insertData.access_token = providerToken
              insertData.refresh_token = providerRefreshToken
              insertData.token_expires_at = null
            }

            await supabase.from('user_identities').insert(insertData)
          }
        }
      }
    }

    // Determine redirect: use requested path, or default to account page
    const next = requestedNext || '/user/account'

    // Successful authentication
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code present
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
