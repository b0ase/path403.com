import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/github/repos
 *
 * Fetch the user's public GitHub repositories and enrich with tokenization status.
 * Uses the GitHub username saved in user_identities (no OAuth required).
 *
 * Returns:
 * - repos: Array of repository objects with GitHub metadata + tokenization status
 * - total: Total count of repos
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Repos API - Auth user ID:', user.id);
    console.log('🔍 Repos API - User email:', user.email);

    // Get unified_user_id from Supabase auth user ID
    // Note: User may have multiple OAuth providers (Google, GitHub, Discord, etc.)
    // all with the same provider_user_id, so we use .limit(1) instead of .single()
    const { data: identities, error: identityError } = await supabase
      .from('user_identities')
      .select('unified_user_id, provider, provider_user_id, oauth_provider')
      .eq('provider', 'supabase')
      .eq('provider_user_id', user.id)
      .limit(1);

    const identity = identities?.[0];

    console.log('🔍 Identity query result:', { identity, error: identityError });

    if (identityError || !identity) {
      return NextResponse.json({
        error: 'User identity not found',
        debug: {
          authUserId: user.id,
          userEmail: user.email,
          identityError: identityError?.message,
        }
      }, { status: 404 });
    }

    const unifiedUserId = identity.unified_user_id;
    console.log('✅ Found unified user ID:', unifiedUserId);

    // Try custom link first (allows duplicates), then fall back to Supabase OAuth
    let username: string | null = null;

    // Check for custom github_link
    const { data: customLink } = await supabase
      .from('user_identities')
      .select('provider_handle')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', 'github_link')
      .single();

    if (customLink?.provider_handle) {
      username = customLink.provider_handle;
    } else {
      // Fall back to Supabase OAuth connection
      const { data: oauthLink } = await supabase
        .from('user_identities')
        .select('provider_handle')
        .eq('unified_user_id', unifiedUserId)
        .eq('provider', 'supabase')
        .eq('oauth_provider', 'github')
        .single();

      username = oauthLink?.provider_handle || null;
    }

    if (!username) {
      return NextResponse.json({
        error: 'GitHub not connected',
        message: 'Please connect your GitHub account in the Connections tab first',
      }, { status: 400 });
    }

    // Fetch public repos from GitHub API (no authentication required)
    console.log(`📦 Fetching public repos for GitHub user: ${username}`);

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=100&type=owner`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'b0ase.com',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub API error:', errorData);

      if (response.status === 404) {
        return NextResponse.json({
          error: 'GitHub user not found',
          message: `GitHub username "${username}" not found. Please check your username in the Connections tab.`,
        }, { status: 404 });
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch repositories from GitHub',
          details: errorData.message || response.statusText
        },
        { status: response.status }
      );
    }

    const repos = await response.json();

    console.log(`✅ Fetched ${repos.length} repos from GitHub`);

    // Filter to only non-fork repos (GitHub API already returns only public repos for this endpoint)
    const ownedRepos = repos.filter((repo: any) => !repo.fork);

    console.log(`✅ Filtered to ${ownedRepos.length} non-fork repos`);

    // Get tokenization status from database
    const repoIds = ownedRepos.map((r: any) => r.id);

    const { data: claimedRepos } = await supabase
      .from('tokenized_repositories')
      .select('github_repo_id, is_claimed, is_tokenized, token_symbol, token_chain, id, verification_level, verification_method, verified_at, has_repo_attestation')
      .in('github_repo_id', repoIds);

    const claimedMap = new Map<number, any>(
      claimedRepos?.map(r => [Number(r.github_repo_id), r]) || []
    );

    // Enrich repos with tokenization status and verification info
    const enrichedRepos = ownedRepos.map((repo: any) => {
      const claimed = claimedMap.get(repo.id);
      return {
        // GitHub metadata
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        url: repo.html_url,
        topics: repo.topics || [],
        license: repo.license?.spdx_id || null,

        // Tokenization status
        isClaimed: claimed?.is_claimed || false,
        isTokenized: claimed?.is_tokenized || false,
        tokenSymbol: claimed?.token_symbol || null,
        tokenChain: claimed?.token_chain || null,
        tokenizedRepoId: claimed?.id || null,

        // Verification status
        verificationLevel: claimed?.verification_level || null,
        verificationMethod: claimed?.verification_method || null,
        verifiedAt: claimed?.verified_at || null,
        hasRepoAttestation: claimed?.has_repo_attestation || false,
      };
    });

    return NextResponse.json({
      repos: enrichedRepos,
      total: enrichedRepos.length,
      username,
    });

  } catch (error) {
    console.error('Error fetching user repos:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch repositories',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
