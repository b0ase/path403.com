import { TwitterApi } from 'twitter-api-v2';

/**
 * Shared Twitter API client factory
 *
 * Usage:
 *   import { getTwitterClient, isTwitterConfigured } from '@/lib/integrations/twitter';
 *
 *   if (!isTwitterConfigured()) {
 *     return NextResponse.json({ error: 'Twitter not configured' }, { status: 500 });
 *   }
 *
 *   const twitter = getTwitterClient();
 *   const tweet = await twitter.v2.tweet('Hello world!');
 *
 * Benefits:
 * - Single source of truth for Twitter API configuration
 * - Consistent error handling
 * - Lazy initialization
 * - Demo mode support
 */

let _twitterClient: TwitterApi | null = null;

/**
 * Check if Twitter API credentials are configured
 */
export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_KEY_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );
}

/**
 * Get or create the shared Twitter API client
 * Lazy initialization - client is created on first use
 *
 * @throws {Error} If Twitter API credentials are not configured
 */
export function getTwitterClient(): TwitterApi {
  if (!isTwitterConfigured()) {
    throw new Error(
      'Twitter API not configured. Set TWITTER_API_KEY, TWITTER_API_KEY_SECRET, ' +
      'TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET environment variables.'
    );
  }

  if (!_twitterClient) {
    _twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_KEY_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    console.log('[Twitter] API client initialized');
  }

  return _twitterClient;
}

/**
 * Reset the Twitter client (mainly for testing)
 */
export function resetTwitterClient(): void {
  _twitterClient = null;
}
