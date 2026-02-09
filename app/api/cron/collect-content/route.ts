import { NextRequest, NextResponse } from 'next/server';
import { GitHubCollector } from '@/lib/auto-book/collectors/github';
import { TwitterCollector } from '@/lib/auto-book/collectors/twitter';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Content Collection Cron Job
 *
 * Runs daily to collect content ideas from GitHub and Twitter.
 * Collects:
 * - Trending GitHub repos in AI/blockchain/web dev topics
 * - Repos from followed orgs (Anthropic, OpenAI, Vercel, etc.)
 * - Tweets from search queries and followed accounts
 *
 * Schedule: Daily at 6 AM UTC (before blog generation at 2 PM)
 * Vercel Cron: "0 6 * * *"
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');

    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualWithSecret = secretParam === cronSecret;
    // Security: Always require authentication, even in development
    if (!isVercelCron && !isManualWithSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Content Collection] Starting...');

    // Get a system user ID for storing ideas
    // In production, this should be a specific system user
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminProfile) {
      return NextResponse.json({
        error: 'No admin user found for content collection',
      }, { status: 500 });
    }

    const systemUserId = adminProfile.id;

    // Initialize collectors
    const githubCollector = new GitHubCollector();
    const twitterCollector = new TwitterCollector();

    // Collection configuration
    const config = {
      github: {
        topics: ['ai', 'llm', 'typescript', 'nextjs', 'blockchain', 'bsv', 'automation'],
        followedUsers: ['anthropics', 'openai', 'vercel', 'supabase', 'langaborr', 'ianborrelm'],
      },
      twitter: {
        searchQueries: [
          'AI agents development',
          'LLM programming best practices',
          'typescript nextjs tips',
          'blockchain automation',
          'BSV bitcoin',
        ],
        usernames: ['AnthropicAI', 'OpenAI', 'vercel', 'supabase'],
      },
    };

    // Run GitHub collection
    console.log('[Content Collection] Collecting from GitHub...');
    const githubResults = {
      trending: await githubCollector.collectTrendingRepos(systemUserId, config.github.topics),
      followed: await githubCollector.collectFromFollowedUsers(systemUserId, config.github.followedUsers),
    };

    // Run Twitter collection
    console.log('[Content Collection] Collecting from Twitter...');
    let twitterResults = {
      search: { added: 0, skipped: 0, errors: [] as string[] },
      users: { added: 0, skipped: 0, errors: [] as string[] },
    };

    if (twitterCollector.isConfigured()) {
      twitterResults = {
        search: await twitterCollector.collectFromSearch(systemUserId, config.twitter.searchQueries),
        users: await twitterCollector.collectFromUsers(systemUserId, config.twitter.usernames),
      };
    } else {
      console.log('[Content Collection] Twitter not configured, skipping...');
    }

    // Calculate totals
    const totals = {
      github: {
        added: githubResults.trending.added + githubResults.followed.added,
        skipped: githubResults.trending.skipped + githubResults.followed.skipped,
        errors: githubResults.trending.errors.length + githubResults.followed.errors.length,
      },
      twitter: {
        added: twitterResults.search.added + twitterResults.users.added,
        skipped: twitterResults.search.skipped + twitterResults.users.skipped,
        errors: twitterResults.search.errors.length + twitterResults.users.errors.length,
      },
    };

    const grandTotal = {
      added: totals.github.added + totals.twitter.added,
      skipped: totals.github.skipped + totals.twitter.skipped,
      errors: totals.github.errors + totals.twitter.errors,
    };

    console.log(`[Content Collection] Complete: ${grandTotal.added} added, ${grandTotal.skipped} skipped, ${grandTotal.errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Collected ${grandTotal.added} new content ideas`,
      results: {
        github: {
          trending: githubResults.trending,
          followed: githubResults.followed,
          total: totals.github,
        },
        twitter: {
          search: twitterResults.search,
          users: twitterResults.users,
          total: totals.twitter,
          configured: twitterCollector.isConfigured(),
        },
      },
      grandTotal,
    });
  } catch (error) {
    console.error('[Content Collection] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST endpoint for manual trigger with custom options
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, userId, github, twitter } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from request or use admin
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (!adminProfile) {
        return NextResponse.json({ error: 'No user ID provided and no admin found' }, { status: 400 });
      }
      targetUserId = adminProfile.id;
    }

    const results: any = {};

    // GitHub collection
    if (github !== false) {
      const githubCollector = new GitHubCollector();
      results.github = await githubCollector.collectAll(targetUserId, {
        starredUsername: github?.starredUsername,
        topics: github?.topics,
        followedUsers: github?.followedUsers,
      });
    }

    // Twitter collection
    if (twitter !== false) {
      const twitterCollector = new TwitterCollector();
      if (twitterCollector.isConfigured()) {
        results.twitter = await twitterCollector.collectAll(targetUserId, {
          searchQueries: twitter?.searchQueries,
          usernames: twitter?.usernames,
        });
      } else {
        results.twitter = { error: 'Twitter not configured' };
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('[Content Collection POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
