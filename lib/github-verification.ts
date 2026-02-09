/**
 * GitHub Developer Verification
 *
 * Verifies developer accounts meet marketplace criteria:
 * - Account age >= 90 days
 * - Public repos >= 3
 * - Fetch GitHub stats (stars, forks, commits)
 */

import { Octokit } from '@octokit/rest';

export interface GitHubVerificationResult {
  verified: boolean;
  username: string;
  accountAge: number; // days
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  contributionsLastYear?: number;
  profileData: {
    name: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    email: string | null;
    hireable: boolean | null;
    avatarUrl: string;
    htmlUrl: string;
    createdAt: string;
  };
  reasons: string[]; // Reasons for verification failure
  error?: string;
}

const MIN_ACCOUNT_AGE_DAYS = 90;
const MIN_PUBLIC_REPOS = 3;

/**
 * Create Octokit instance with GitHub token
 */
function createOctokit(accessToken?: string): Octokit {
  const token = accessToken || process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GitHub access token required');
  }

  return new Octokit({ auth: token });
}

/**
 * Verify GitHub developer account
 */
export async function verifyGitHubDeveloper(
  username: string,
  accessToken?: string
): Promise<GitHubVerificationResult> {
  try {
    const octokit = createOctokit(accessToken);

    // Get user profile
    const { data: user } = await octokit.users.getByUsername({ username });

    // Calculate account age
    const createdAt = new Date(user.created_at);
    const accountAgeDays = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get user's repositories
    const { data: repos } = await octokit.repos.listForUser({
      username,
      type: 'owner',
      per_page: 100,
    });

    // Calculate total stars and forks
    const publicRepos = repos.filter((repo) => !repo.private && !repo.fork);
    const totalStars = publicRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = publicRepos.reduce((sum, repo) => sum + repo.forks_count, 0);

    // Verification checks
    const reasons: string[] = [];
    let verified = true;

    if (accountAgeDays < MIN_ACCOUNT_AGE_DAYS) {
      verified = false;
      reasons.push(
        `Account too new (${accountAgeDays} days, minimum ${MIN_ACCOUNT_AGE_DAYS} days)`
      );
    }

    if (publicRepos.length < MIN_PUBLIC_REPOS) {
      verified = false;
      reasons.push(
        `Insufficient public repos (${publicRepos.length}, minimum ${MIN_PUBLIC_REPOS})`
      );
    }

    return {
      verified,
      username: user.login,
      accountAge: accountAgeDays,
      publicRepos: publicRepos.length,
      totalStars,
      totalForks,
      profileData: {
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        email: user.email,
        hireable: user.hireable,
        avatarUrl: user.avatar_url,
        htmlUrl: user.html_url,
        createdAt: user.created_at,
      },
      reasons,
    };
  } catch (error) {
    console.error('[github-verification] Verification error:', error);

    return {
      verified: false,
      username,
      accountAge: 0,
      publicRepos: 0,
      totalStars: 0,
      totalForks: 0,
      profileData: {
        name: null,
        bio: null,
        company: null,
        location: null,
        blog: null,
        email: null,
        hireable: null,
        avatarUrl: '',
        htmlUrl: '',
        createdAt: '',
      },
      reasons: ['Verification failed'],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get GitHub user contribution stats
 */
export async function getGitHubContributions(
  username: string,
  accessToken?: string
): Promise<number | null> {
  try {
    const octokit = createOctokit(accessToken);

    // Get events for the user (last 90 days of activity)
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });

    // Count commit events
    const commitEvents = events.filter(
      (event) => event.type === 'PushEvent'
    );

    return commitEvents.length;
  } catch (error) {
    console.error('[github-verification] Contributions error:', error);
    return null;
  }
}

/**
 * Get developer's top repositories
 */
export async function getTopRepositories(
  username: string,
  limit: number = 5,
  accessToken?: string
) {
  try {
    const octokit = createOctokit(accessToken);

    const { data: repos } = await octokit.repos.listForUser({
      username,
      type: 'owner',
      per_page: 100,
      sort: 'updated',
    });

    // Filter and sort by stars
    const publicRepos = repos
      .filter((repo) => !repo.private && !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, limit);

    return publicRepos.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      htmlUrl: repo.html_url,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    }));
  } catch (error) {
    console.error('[github-verification] Top repos error:', error);
    return [];
  }
}

/**
 * Get developer's primary programming languages
 */
export async function getDeveloperLanguages(
  username: string,
  accessToken?: string
): Promise<Record<string, number>> {
  try {
    const octokit = createOctokit(accessToken);

    const { data: repos } = await octokit.repos.listForUser({
      username,
      type: 'owner',
      per_page: 100,
    });

    const languageCounts: Record<string, number> = {};

    repos
      .filter((repo) => !repo.private && !repo.fork && repo.language)
      .forEach((repo) => {
        const lang = repo.language!;
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

    return languageCounts;
  } catch (error) {
    console.error('[github-verification] Languages error:', error);
    return {};
  }
}

/**
 * Refresh GitHub verification for existing developer
 */
export async function refreshGitHubVerification(
  username: string,
  accessToken?: string
): Promise<GitHubVerificationResult> {
  return verifyGitHubDeveloper(username, accessToken);
}
