import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateEngagementTweet, generateTweetVariations, validateTweet } from '@/lib/tweet-generator';

export const dynamic = 'force-dynamic';

// Rate limit: 20 requests per minute per user (AI generation is expensive)
const RATE_LIMIT_OPTIONS = {
  maxRequests: 20,
  windowMs: 60 * 1000,
  message: 'Too many tweet generation requests. Please wait before trying again.',
};

/**
 * POST /api/tweets/generate
 *
 * Generate engagement-optimized tweets from provided content
 *
 * Requires authentication.
 * Rate limited to 20 requests/minute per user.
 *
 * Body:
 *   - title: string (required)
 *   - url: string (required)
 *   - excerpt?: string
 *   - content?: string
 *   - tags?: string[]
 *   - variations?: number (1-5, default 1)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[TweetGenerator] Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Rate limiting (per user)
    const rateLimit = checkRateLimit(request, {
      ...RATE_LIMIT_OPTIONS,
      keyGenerator: () => `tweets:${userId}`,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: RATE_LIMIT_OPTIONS.message,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_OPTIONS.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { title, url, excerpt, content, tags, variations = 1 } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: 'title and url are required' },
        { status: 400 }
      );
    }

    const numVariations = Math.min(Math.max(1, variations), 5);

    console.log(`[TweetGenerator] User ${userId} generating ${numVariations} tweet(s) for: ${title}`);

    // 4. Generate tweets
    const input = { title, url, excerpt, content, tags };

    let tweets;
    if (numVariations === 1) {
      const tweet = await generateEngagementTweet(input);
      tweets = [tweet];
    } else {
      tweets = await generateTweetVariations(input, numVariations);
    }

    // 5. Add validation to each tweet
    const tweetsWithValidation = tweets.map((tweet) => ({
      ...tweet,
      validation: validateTweet(tweet.content),
    }));

    // 6. Return success with rate limit headers
    const response = NextResponse.json({
      success: true,
      tweets: tweetsWithValidation,
    });

    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_OPTIONS.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

    return response;
  } catch (error: unknown) {
    // Log full error server-side for debugging
    console.error('[TweetGenerator] Error:', error);

    // Return generic message to client - don't leak internal details
    return NextResponse.json(
      { error: 'Failed to generate tweets' },
      { status: 500 }
    );
  }
}
