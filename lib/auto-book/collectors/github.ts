import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
}

interface CollectionResult {
  added: number;
  skipped: number;
  errors: string[];
}

/**
 * GitHub Content Collector
 *
 * Collects interesting repositories from GitHub and adds them as content ideas.
 * Sources:
 * - User's starred repos
 * - Trending repos in relevant topics
 * - Specific users/orgs to follow
 */
export class GitHubCollector {
  private githubToken: string | undefined;

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  private async githubFetch(endpoint: string): Promise<any> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'b0ase.com-content-collector',
    };

    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`;
    }

    const response = await fetch(`https://api.github.com${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch starred repos for a GitHub user
   */
  async getStarredRepos(username: string, limit: number = 30): Promise<GitHubRepo[]> {
    try {
      const repos = await this.githubFetch(
        `/users/${username}/starred?sort=updated&direction=desc&per_page=${limit}`
      );
      return repos;
    } catch (error) {
      console.error(`Error fetching starred repos for ${username}:`, error);
      return [];
    }
  }

  /**
   * Search for trending repos in specific topics
   */
  async getTrendingRepos(
    topics: string[] = ['ai', 'llm', 'typescript', 'nextjs', 'blockchain'],
    limit: number = 10
  ): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];

    for (const topic of topics) {
      try {
        // Search for recently updated repos with stars
        const result = await this.githubFetch(
          `/search/repositories?q=topic:${topic}+pushed:>${this.getDateDaysAgo(7)}&sort=stars&order=desc&per_page=${limit}`
        );
        allRepos.push(...(result.items || []));
      } catch (error) {
        console.error(`Error fetching trending repos for topic ${topic}:`, error);
      }
    }

    // Deduplicate by repo ID
    const uniqueRepos = new Map<number, GitHubRepo>();
    for (const repo of allRepos) {
      if (!uniqueRepos.has(repo.id)) {
        uniqueRepos.set(repo.id, repo);
      }
    }

    return Array.from(uniqueRepos.values());
  }

  /**
   * Fetch repos from specific users/orgs to follow
   */
  async getReposFromUsers(
    usernames: string[] = ['anthropics', 'openai', 'vercel', 'supabase'],
    limit: number = 5
  ): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];

    for (const username of usernames) {
      try {
        const repos = await this.githubFetch(
          `/users/${username}/repos?sort=updated&direction=desc&per_page=${limit}`
        );
        allRepos.push(...repos);
      } catch (error) {
        console.error(`Error fetching repos for user ${username}:`, error);
      }
    }

    return allRepos;
  }

  /**
   * Convert a GitHub repo to a content idea
   */
  private repoToContentIdea(repo: GitHubRepo, userId: string) {
    const tags = [
      repo.language,
      ...repo.topics.slice(0, 5),
    ].filter(Boolean) as string[];

    return {
      user_id: userId,
      url: repo.html_url,
      title: `${repo.full_name}: ${repo.description || 'No description'}`,
      source_type: 'repo',
      tags,
      notes: `Stars: ${repo.stargazers_count} | Language: ${repo.language || 'Unknown'} | Last updated: ${repo.updated_at}`,
      used: false,
    };
  }

  /**
   * Check if a URL already exists in content_ideas
   */
  private async urlExists(url: string): Promise<boolean> {
    const { data } = await supabase
      .from('content_ideas')
      .select('id')
      .eq('url', url)
      .limit(1);

    return (data?.length ?? 0) > 0;
  }

  /**
   * Collect starred repos and add to content_ideas
   */
  async collectStarredRepos(username: string, userId: string): Promise<CollectionResult> {
    const result: CollectionResult = { added: 0, skipped: 0, errors: [] };

    const repos = await this.getStarredRepos(username);
    console.log(`[GitHub] Found ${repos.length} starred repos for ${username}`);

    for (const repo of repos) {
      try {
        // Skip if already exists
        if (await this.urlExists(repo.html_url)) {
          result.skipped++;
          continue;
        }

        const idea = this.repoToContentIdea(repo, userId);
        const { error } = await supabase.from('content_ideas').insert(idea);

        if (error) {
          result.errors.push(`Failed to add ${repo.full_name}: ${error.message}`);
        } else {
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing ${repo.full_name}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Collect trending repos and add to content_ideas
   */
  async collectTrendingRepos(userId: string, topics?: string[]): Promise<CollectionResult> {
    const result: CollectionResult = { added: 0, skipped: 0, errors: [] };

    const repos = await this.getTrendingRepos(topics);
    console.log(`[GitHub] Found ${repos.length} trending repos`);

    for (const repo of repos) {
      try {
        // Skip if already exists
        if (await this.urlExists(repo.html_url)) {
          result.skipped++;
          continue;
        }

        // Only add repos with significant stars
        if (repo.stargazers_count < 100) {
          result.skipped++;
          continue;
        }

        const idea = this.repoToContentIdea(repo, userId);
        const { error } = await supabase.from('content_ideas').insert(idea);

        if (error) {
          result.errors.push(`Failed to add ${repo.full_name}: ${error.message}`);
        } else {
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing ${repo.full_name}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Collect repos from followed users/orgs
   */
  async collectFromFollowedUsers(userId: string, usernames?: string[]): Promise<CollectionResult> {
    const result: CollectionResult = { added: 0, skipped: 0, errors: [] };

    const repos = await this.getReposFromUsers(usernames);
    console.log(`[GitHub] Found ${repos.length} repos from followed users`);

    for (const repo of repos) {
      try {
        // Skip if already exists
        if (await this.urlExists(repo.html_url)) {
          result.skipped++;
          continue;
        }

        const idea = this.repoToContentIdea(repo, userId);
        const { error } = await supabase.from('content_ideas').insert(idea);

        if (error) {
          result.errors.push(`Failed to add ${repo.full_name}: ${error.message}`);
        } else {
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing ${repo.full_name}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Run all collection methods
   */
  async collectAll(
    userId: string,
    options?: {
      starredUsername?: string;
      topics?: string[];
      followedUsers?: string[];
    }
  ): Promise<{
    starred: CollectionResult;
    trending: CollectionResult;
    followed: CollectionResult;
    total: { added: number; skipped: number; errors: number };
  }> {
    const starred = options?.starredUsername
      ? await this.collectStarredRepos(options.starredUsername, userId)
      : { added: 0, skipped: 0, errors: [] };

    const trending = await this.collectTrendingRepos(userId, options?.topics);

    const followed = await this.collectFromFollowedUsers(userId, options?.followedUsers);

    return {
      starred,
      trending,
      followed,
      total: {
        added: starred.added + trending.added + followed.added,
        skipped: starred.skipped + trending.skipped + followed.skipped,
        errors: starred.errors.length + trending.errors.length + followed.errors.length,
      },
    };
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
}
