import { createClient } from '@supabase/supabase-js';
import { getTwitterClient, isTwitterConfigured } from '@/lib/integrations/twitter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Tweet {
  id: string;
  text: string;
  author_id?: string;
  author_username?: string;
  created_at?: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface CollectionResult {
  added: number;
  skipped: number;
  errors: string[];
}

/**
 * Twitter Content Collector
 *
 * Collects tweets from various sources and adds them as content ideas.
 * Sources:
 * - User's bookmarks (requires OAuth 2.0 User Context)
 * - Liked tweets
 * - Search results for specific queries
 * - Lists
 *
 * Note: Twitter API v2 has rate limits and requires proper authentication.
 * Bookmarks API requires OAuth 2.0 with user context (not app-only auth).
 */
export class TwitterCollector {
  /**
   * Check if Twitter is configured
   */
  isConfigured(): boolean {
    return isTwitterConfigured();
  }

  /**
   * Search for recent tweets matching queries
   * This works with app-only auth (the standard configuration)
   */
  async searchTweets(
    queries: string[] = [
      'AI agents development',
      'BSV blockchain',
      'typescript nextjs',
      'startup automation',
      'llm programming',
    ],
    limit: number = 10
  ): Promise<Tweet[]> {
    if (!this.isConfigured()) {
      console.warn('[Twitter] Not configured, skipping search');
      return [];
    }

    const allTweets: Tweet[] = [];
    const twitter = getTwitterClient();

    for (const query of queries) {
      try {
        // Search for recent tweets (last 7 days)
        const result = await twitter.v2.search(query, {
          max_results: limit,
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          expansions: ['author_id'],
        });

        if (result.data?.data) {
          const users = new Map(
            result.includes?.users?.map(u => [u.id, u.username]) || []
          );

          for (const tweet of result.data.data) {
            allTweets.push({
              id: tweet.id,
              text: tweet.text,
              author_id: tweet.author_id,
              author_username: tweet.author_id ? users.get(tweet.author_id) : undefined,
              created_at: tweet.created_at,
              public_metrics: tweet.public_metrics,
            });
          }
        }
      } catch (error) {
        console.error(`[Twitter] Search error for "${query}":`, error);
      }
    }

    // Deduplicate by tweet ID
    const uniqueTweets = new Map<string, Tweet>();
    for (const tweet of allTweets) {
      if (!uniqueTweets.has(tweet.id)) {
        uniqueTweets.set(tweet.id, tweet);
      }
    }

    return Array.from(uniqueTweets.values());
  }

  /**
   * Get tweets from a specific user's timeline
   */
  async getUserTweets(username: string, limit: number = 20): Promise<Tweet[]> {
    if (!this.isConfigured()) {
      console.warn('[Twitter] Not configured, skipping user tweets');
      return [];
    }

    try {
      const twitter = getTwitterClient();

      // Get user ID from username
      const user = await twitter.v2.userByUsername(username);
      if (!user.data) {
        console.error(`[Twitter] User not found: ${username}`);
        return [];
      }

      // Get their tweets
      const result = await twitter.v2.userTimeline(user.data.id, {
        max_results: limit,
        'tweet.fields': ['created_at', 'public_metrics'],
        exclude: ['retweets', 'replies'],
      });

      return (result.data?.data || []).map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        author_username: username,
        created_at: tweet.created_at,
        public_metrics: tweet.public_metrics,
      }));
    } catch (error) {
      console.error(`[Twitter] Error fetching tweets for ${username}:`, error);
      return [];
    }
  }

  /**
   * Convert a tweet to a content idea
   */
  private tweetToContentIdea(tweet: Tweet, userId: string) {
    const tweetUrl = `https://twitter.com/${tweet.author_username || 'i'}/status/${tweet.id}`;

    // Extract hashtags as tags
    const hashtags = tweet.text.match(/#\w+/g)?.map(t => t.slice(1)) || [];

    // Create a title from the first 100 chars
    const title = tweet.text.length > 100
      ? tweet.text.slice(0, 100) + '...'
      : tweet.text;

    return {
      user_id: userId,
      url: tweetUrl,
      title: `@${tweet.author_username || 'unknown'}: ${title}`,
      source_type: 'tweet',
      tags: hashtags.slice(0, 5),
      notes: tweet.public_metrics
        ? `Likes: ${tweet.public_metrics.like_count} | RTs: ${tweet.public_metrics.retweet_count}`
        : '',
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
   * Collect tweets from search and add to content_ideas
   */
  async collectFromSearch(userId: string, queries?: string[]): Promise<CollectionResult> {
    const result: CollectionResult = { added: 0, skipped: 0, errors: [] };

    if (!this.isConfigured()) {
      result.errors.push('Twitter API not configured');
      return result;
    }

    const tweets = await this.searchTweets(queries);
    console.log(`[Twitter] Found ${tweets.length} tweets from search`);

    for (const tweet of tweets) {
      try {
        const tweetUrl = `https://twitter.com/${tweet.author_username || 'i'}/status/${tweet.id}`;

        // Skip if already exists
        if (await this.urlExists(tweetUrl)) {
          result.skipped++;
          continue;
        }

        // Only add tweets with some engagement
        const likes = tweet.public_metrics?.like_count || 0;
        if (likes < 10) {
          result.skipped++;
          continue;
        }

        const idea = this.tweetToContentIdea(tweet, userId);
        const { error } = await supabase.from('content_ideas').insert(idea);

        if (error) {
          result.errors.push(`Failed to add tweet ${tweet.id}: ${error.message}`);
        } else {
          result.added++;
        }
      } catch (error) {
        result.errors.push(`Error processing tweet ${tweet.id}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Collect tweets from specific users
   */
  async collectFromUsers(
    userId: string,
    usernames: string[] = ['anthropaborr', 'OpenAI', 'veraborr', 'supabase']
  ): Promise<CollectionResult> {
    const result: CollectionResult = { added: 0, skipped: 0, errors: [] };

    if (!this.isConfigured()) {
      result.errors.push('Twitter API not configured');
      return result;
    }

    for (const username of usernames) {
      const tweets = await this.getUserTweets(username);
      console.log(`[Twitter] Found ${tweets.length} tweets from @${username}`);

      for (const tweet of tweets) {
        try {
          const tweetUrl = `https://twitter.com/${username}/status/${tweet.id}`;

          // Skip if already exists
          if (await this.urlExists(tweetUrl)) {
            result.skipped++;
            continue;
          }

          const idea = this.tweetToContentIdea({ ...tweet, author_username: username }, userId);
          const { error } = await supabase.from('content_ideas').insert(idea);

          if (error) {
            result.errors.push(`Failed to add tweet ${tweet.id}: ${error.message}`);
          } else {
            result.added++;
          }
        } catch (error) {
          result.errors.push(`Error processing tweet ${tweet.id}: ${error}`);
        }
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
      searchQueries?: string[];
      usernames?: string[];
    }
  ): Promise<{
    search: CollectionResult;
    users: CollectionResult;
    total: { added: number; skipped: number; errors: number };
  }> {
    const search = await this.collectFromSearch(userId, options?.searchQueries);
    const users = await this.collectFromUsers(userId, options?.usernames);

    return {
      search,
      users,
      total: {
        added: search.added + users.added,
        skipped: search.skipped + users.skipped,
        errors: search.errors.length + users.errors.length,
      },
    };
  }
}
