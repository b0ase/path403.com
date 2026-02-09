import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserGitHubToken } from '@/lib/github-token';
import { verifyRepository } from '@/lib/verification';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repos/[repoId]/claim
 *
 * Claim ownership of a GitHub repository by verifying the user owns it.
 * Creates a record in tokenized_repositories with is_claimed=true.
 *
 * Steps:
 * 1. Verify user is authenticated
 * 2. Fetch repo details from GitHub to verify ownership
 * 3. Check if already claimed
 * 4. Insert claim record into database
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get user's GitHub token (optional for public repos)
    const token = await getUserGitHubToken(user.id);

    // Fetch repo details from GitHub to verify ownership
    console.log(`🔍 Verifying ownership of repo ID: ${repoId}`);

    const headers: Record<string, string> = {
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'b0ase.com',
    };

    // Add auth if available (gets permission data)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repositories/${repoId}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status}`, errorText);
      return NextResponse.json({
        error: 'Repository not found or access denied',
        details: `GitHub API returned ${response.status}: ${errorText.substring(0, 100)}`
      }, { status: 404 });
    }

    const repo = await response.json();

    // Verify ownership/control in two ways:
    // 1. GitHub API permissions (User has admin or push access)
    // 2. Local identity match (GitHub login matches repo owner)

    const hasGitHubPermissions = repo.permissions?.admin === true || repo.permissions?.push === true;

    // Get unified_user_id from Supabase user
    const { data: supabaseIdentity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', user.id)
      .limit(1)
      .single();

    if (!supabaseIdentity) {
      console.error('❌ No unified user found for Supabase user:', user.id);
      return NextResponse.json({ error: 'User identity not found' }, { status: 404 });
    }

    const unifiedUserId = supabaseIdentity.unified_user_id;

    // Try to get GitHub identity (check both old OAuth and new custom link)
    const { data: githubOAuth } = await supabase
      .from('user_identities')
      .select('provider_handle')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', 'supabase')
      .eq('oauth_provider', 'github')
      .single();

    const { data: githubLink } = await supabase
      .from('user_identities')
      .select('provider_handle')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', 'github_link')
      .single();

    const githubIdentity = githubOAuth || githubLink;

    if (!githubIdentity?.provider_handle) {
      console.error('❌ No GitHub connection found for unified user:', unifiedUserId);
      return NextResponse.json({
        error: 'GitHub not connected',
        message: 'Please connect your GitHub account in the Connections tab first.'
      }, { status: 400 });
    }

    const storedUsername = githubIdentity.provider_handle?.replace(/^@/, '').toLowerCase();
    const repoOwner = repo.owner.login.toLowerCase();
    const isOwnerMatch = storedUsername === repoOwner;

    console.log('🛡️ Ownership Verification:', {
      hasGitHubPermissions,
      isOwnerMatch,
      repoOwner,
      storedUsername,
      unifiedUserId
    });

    if (!hasGitHubPermissions && !isOwnerMatch) {
      console.error(`❌ Ownership verification failed for ${repo.full_name}`, {
        hasGitHubPermissions,
        isOwnerMatch,
        repoOwner,
        storedUsername
      });
      return NextResponse.json({
        error: 'Ownership verification failed',
        details: `Repo owner: ${repoOwner}, Your GitHub: ${storedUsername}. You must own this repository to claim it.`
      }, { status: 403 });
    }

    // Check if THIS user already has a claim for this repo
    // Note: Multiple users can claim the same repo (verification determines legitimacy)
    // Note: repo.id from GitHub API is a number, but DB stores as bigint/string
    const repoIdStr = String(repo.id);

    const { data: existingClaim, error: existingError } = await supabase
      .from('tokenized_repositories')
      .select('id, is_tokenized, token_symbol, github_repo_name, github_full_name, verification_level')
      .eq('github_repo_id', repoIdStr)
      .eq('unified_user_id', unifiedUserId)
      .maybeSingle();

    if (existingError) {
      console.error('❌ Error checking existing claim:', existingError);
      return NextResponse.json({ error: 'Database error checking claim status' }, { status: 500 });
    }

    if (existingClaim) {
      console.log('✅ Already claimed by this user - returning success');
      return NextResponse.json({
        success: true,
        message: 'Already claimed by you',
        repo: {
          id: existingClaim.id,
          githubRepoId: repoIdStr,
          name: existingClaim.github_repo_name || repo.name,
          fullName: existingClaim.github_full_name || repo.full_name,
          isClaimed: true,
          isTokenized: existingClaim.is_tokenized,
          tokenSymbol: existingClaim.token_symbol,
          verificationLevel: existingClaim.verification_level,
        }
      });
    }

    console.log(`✅ Ownership verified. Claiming repo: ${repo.full_name} for unified user: ${unifiedUserId}`);

    // Perform verification check
    const verification = await verifyRepository(repo);
    console.log('🔐 Verification result:', {
      level: verification.level,
      method: verification.method,
      hasOAuthPermissions: verification.hasOAuthPermissions,
      hasRepoAttestation: verification.hasRepoAttestation,
    });

    // Claim the repo by inserting into database with verification data
    const { data: claimed, error: claimError } = await supabase
      .from('tokenized_repositories')
      .insert({
        unified_user_id: unifiedUserId,
        github_repo_id: repoIdStr, // Use string to match DB type
        github_repo_name: repo.name,
        github_owner: repo.owner.login,
        github_full_name: repo.full_name,
        github_description: repo.description,
        github_stars: repo.stargazers_count,
        github_forks: repo.forks_count,
        github_language: repo.language,
        github_url: repo.html_url,
        is_claimed: true,
        is_tokenized: false,
        // Verification data
        verification_level: verification.level,
        verification_method: verification.method,
        verified_at: new Date().toISOString(),
        has_repo_attestation: verification.hasRepoAttestation,
        verification_proof: verification.proof,
      })
      .select()
      .single();

    if (claimError) {
      console.error('❌ Error claiming repo:', claimError);
      return NextResponse.json({
        error: 'Failed to claim repository',
        details: `Database error: ${claimError.message}. Code: ${claimError.code || 'unknown'}`
      }, { status: 500 });
    }

    console.log(`🎉 Repository claimed successfully: ${claimed.id} with verification level: ${claimed.verification_level}`);

    return NextResponse.json({
      success: true,
      repo: {
        id: claimed.id,
        githubRepoId: repoIdStr,
        name: claimed.github_repo_name,
        fullName: claimed.github_full_name,
        stars: claimed.github_stars,
        forks: claimed.github_forks,
        language: claimed.github_language,
        isClaimed: claimed.is_claimed,
        isTokenized: claimed.is_tokenized,
        verificationLevel: claimed.verification_level,
        verificationMethod: claimed.verification_method,
        verifiedAt: claimed.verified_at,
        hasRepoAttestation: claimed.has_repo_attestation,
      },
    });

  } catch (error) {
    console.error('Error in claim repo:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
