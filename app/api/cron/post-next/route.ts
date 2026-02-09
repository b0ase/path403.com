import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';
import { getTwitterClient, isTwitterConfigured } from '@/lib/integrations/twitter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const pool = getDbPool();

  try {
    const { site, account } = await request.json();

    if (!site || !account) {
      return NextResponse.json(
        { error: 'site and account required' },
        { status: 400 }
      );
    }

    // Get social account
    const accountResult = await pool.query(
      'SELECT * FROM social_accounts WHERE site = $1 AND handle = $2',
      [site, account]
    );

    if (accountResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      );
    }

    const socialAccount = accountResult.rows[0];

    // Get next queued post
    const queueResult = await pool.query(
      `SELECT * FROM post_queue
       WHERE social_account_id = $1 AND status = 'queued'
       ORDER BY scheduled_for ASC NULLS FIRST, created_at ASC
       LIMIT 1`,
      [socialAccount.id]
    );

    if (queueResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No posts in queue' },
        { status: 404 }
      );
    }

    const queuedPost = queueResult.rows[0];

    // Check if platform is supported
    if (socialAccount.platform !== 'twitter') {
      return NextResponse.json(
        { error: `Platform ${socialAccount.platform} not yet supported` },
        { status: 400 }
      );
    }

    // Post to Twitter
    if (!isTwitterConfigured()) {
      return NextResponse.json(
        { error: 'Twitter API not configured' },
        { status: 500 }
      );
    }

    const twitter = getTwitterClient();
    const { data: tweet } = await twitter.v2.tweet(queuedPost.post_content);
    console.log(`✅ Posted tweet: ${tweet.id}`);

    const tweetUrl = `https://twitter.com/${account.replace('@', '')}/status/${tweet.id}`;

    // Move to posted_content
    await pool.query(
      `INSERT INTO posted_content (
        social_account_id,
        content_idea_id,
        post_content,
        post_url,
        platform_post_id,
        posted_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        socialAccount.id,
        queuedPost.content_idea_id,
        queuedPost.post_content,
        tweetUrl,
        tweet.id,
      ]
    );

    // Remove from queue
    await pool.query(
      'DELETE FROM post_queue WHERE id = $1',
      [queuedPost.id]
    );

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweet.id,
        url: tweetUrl,
      },
    });
  } catch (error: any) {
    console.error('Error posting:', error);
    return NextResponse.json(
      { error: 'Failed to post', details: error.message },
      { status: 500 }
    );
  }
}
