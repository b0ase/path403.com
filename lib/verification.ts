/**
 * Repository Verification Utilities
 *
 * Implements a three-tier verification system for repository tokens:
 * - verified_owner: GitHub OAuth confirms push/admin access
 * - repo_attested: .well-known/token.json exists in repo
 * - unverified: No verification proof
 */

export type VerificationLevel = 'verified_owner' | 'repo_attested' | 'unverified';
export type VerificationMethod = 'github_oauth' | 'repo_file' | 'none';

export interface VerificationResult {
  level: VerificationLevel;
  method: VerificationMethod;
  hasOAuthPermissions: boolean;
  hasRepoAttestation: boolean;
  proof: Record<string, any>;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
}

/**
 * Verify GitHub repository ownership via OAuth permissions
 *
 * Checks if the authenticated user has admin or push access to the repository.
 * This is the strongest form of verification as it comes directly from GitHub's API.
 *
 * @param repo - GitHub repository object from API (must include permissions)
 * @returns true if user has admin or push access
 */
export function verifyGitHubOwnership(repo: GitHubRepo): boolean {
  return repo.permissions?.admin === true || repo.permissions?.push === true;
}

/**
 * Check if repository has attestation file
 *
 * Looks for .well-known/token.json in the repository's default branch.
 * This file should contain the token contract address to prove the repo owner
 * authorizes this specific token.
 *
 * @param repoFullName - GitHub repo full name (owner/repo)
 * @param tokenAddress - Token contract address to verify (optional)
 * @returns Promise resolving to attestation data if found
 */
export async function checkRepoAttestation(
  repoFullName: string,
  tokenAddress?: string
): Promise<{ exists: boolean; data?: any; matches?: boolean }> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${repoFullName}/main/.well-known/token.json`
    );

    if (!response.ok) {
      // Try master branch fallback
      const masterResponse = await fetch(
        `https://raw.githubusercontent.com/${repoFullName}/master/.well-known/token.json`
      );

      if (!masterResponse.ok) {
        return { exists: false };
      }

      const data = await masterResponse.json();
      const matches = tokenAddress ? data.tokenAddress === tokenAddress : undefined;

      return { exists: true, data, matches };
    }

    const data = await response.json();
    const matches = tokenAddress ? data.tokenAddress === tokenAddress : undefined;

    return { exists: true, data, matches };
  } catch (error) {
    console.error('Error checking repo attestation:', error);
    return { exists: false };
  }
}

/**
 * Calculate verification level based on available proofs
 *
 * Verification hierarchy (highest to lowest):
 * 1. verified_owner: GitHub OAuth confirms push/admin access
 * 2. repo_attested: .well-known/token.json exists
 * 3. unverified: No proof available
 *
 * @param hasOAuthPermissions - User has GitHub push/admin access
 * @param hasRepoAttestation - Repo contains attestation file
 * @returns VerificationLevel
 */
export function calculateVerificationLevel(
  hasOAuthPermissions: boolean,
  hasRepoAttestation: boolean
): VerificationLevel {
  if (hasOAuthPermissions) {
    return 'verified_owner';
  }

  if (hasRepoAttestation) {
    return 'repo_attested';
  }

  return 'unverified';
}

/**
 * Determine verification method from proofs
 *
 * @param hasOAuthPermissions - User has GitHub push/admin access
 * @param hasRepoAttestation - Repo contains attestation file
 * @returns VerificationMethod
 */
export function getVerificationMethod(
  hasOAuthPermissions: boolean,
  hasRepoAttestation: boolean
): VerificationMethod {
  if (hasOAuthPermissions) {
    return 'github_oauth';
  }

  if (hasRepoAttestation) {
    return 'repo_file';
  }

  return 'none';
}

/**
 * Create verification proof object for storage
 *
 * Stores evidence of verification for audit trail.
 *
 * @param repo - GitHub repository object
 * @param hasOAuthPermissions - User has GitHub push/admin access
 * @param attestationData - Data from .well-known/token.json if present
 * @returns Proof object for database storage
 */
export function createVerificationProof(
  repo: GitHubRepo,
  hasOAuthPermissions: boolean,
  attestationData?: any
): Record<string, any> {
  return {
    github_repo_id: repo.id,
    github_full_name: repo.full_name,
    github_owner: repo.owner.login,
    oauth_permissions: hasOAuthPermissions ? {
      admin: repo.permissions?.admin,
      push: repo.permissions?.push,
      verified_at: new Date().toISOString(),
    } : null,
    attestation: attestationData ? {
      found: true,
      data: attestationData,
      checked_at: new Date().toISOString(),
    } : null,
  };
}

/**
 * Perform complete verification check
 *
 * This is the main function to call when verifying a repository.
 * It checks both GitHub OAuth permissions and repo attestation,
 * then returns the complete verification result.
 *
 * @param repo - GitHub repository object from API
 * @param tokenAddress - Token contract address (optional, for attestation matching)
 * @returns Complete verification result
 */
export async function verifyRepository(
  repo: GitHubRepo,
  tokenAddress?: string
): Promise<VerificationResult> {
  const hasOAuthPermissions = verifyGitHubOwnership(repo);
  const attestation = await checkRepoAttestation(repo.full_name, tokenAddress);
  const hasRepoAttestation = attestation.exists;

  const level = calculateVerificationLevel(hasOAuthPermissions, hasRepoAttestation);
  const method = getVerificationMethod(hasOAuthPermissions, hasRepoAttestation);
  const proof = createVerificationProof(repo, hasOAuthPermissions, attestation.data);

  return {
    level,
    method,
    hasOAuthPermissions,
    hasRepoAttestation,
    proof,
  };
}

/**
 * Get verification badge info for UI display
 *
 * @param level - Verification level
 * @returns UI display info
 */
export function getVerificationBadge(level: VerificationLevel): {
  icon: string;
  label: string;
  color: string;
  description: string;
} {
  switch (level) {
    case 'verified_owner':
      return {
        icon: '✅',
        label: 'Verified Owner',
        color: 'green',
        description: 'GitHub confirms this user has owner/admin access to the repository',
      };
    case 'repo_attested':
      return {
        icon: '📄',
        label: 'Repo Attested',
        color: 'blue',
        description: 'Repository contains .well-known/token.json attestation file',
      };
    case 'unverified':
      return {
        icon: '⚠️',
        label: 'Unverified',
        color: 'yellow',
        description: 'No verification proof available. Use caution.',
      };
  }
}
