import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Fetch social accounts to show which accounts are active
    let accounts = [];
    const { data: accountsData, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!accountsError && accountsData) {
      accounts = accountsData;
    }

    // Define cron jobs from vercel.json
    const cronJobs = [
      {
        id: 'finalize-proposals',
        name: 'Finalize Proposals',
        path: '/api/cron/finalize-proposals',
        schedule: '*/5 * * * *',
        description: 'Finalize voting on proposals every 5 minutes',
        twitter_account: null,
        status: 'active'
      },
      {
        id: 'expire-purchases',
        name: 'Expire Purchases',
        path: '/api/cron/expire-purchases',
        schedule: '*/5 * * * *',
        description: 'Expire old purchase records every 5 minutes',
        twitter_account: null,
        status: 'active'
      },
      {
        id: 'twitter-post',
        name: 'Twitter Post (Content Ideas)',
        path: '/api/cron/twitter-post',
        schedule: '0 10 * * *',
        description: 'Queue tweets from content ideas bucket - Daily at 10:00 AM',
        twitter_account: accounts?.find(a => a.handle === '@b0ase' && a.platform === 'twitter')?.handle || 'Not configured',
        status: 'active'
      },
      {
        id: 'blog-post',
        name: 'Auto Blog Generation',
        path: '/api/cron/blog-post',
        schedule: '0 14 * * *',
        description: 'Generate blog post from content ideas using AI - Daily at 2:00 PM',
        twitter_account: accounts?.find(a => a.handle === '@b0ase' && a.platform === 'twitter')?.handle || 'Not configured',
        status: 'active'
      },
      {
        id: 'post-next',
        name: 'Post from Queue',
        path: '/api/cron/post-next',
        schedule: 'Manual only',
        description: 'Post next item from social media queue (not scheduled, manual trigger only)',
        twitter_account: 'All active accounts',
        status: 'manual'
      }
    ];

    // Fetch queue counts per account
    const { data: queueData } = await supabase
      .from('post_queue')
      .select('social_account_id, status');

    const queueByAccount: Record<string, { queued: number; failed: number }> = {};

    if (queueData) {
      queueData.forEach((item: any) => {
        if (!queueByAccount[item.social_account_id]) {
          queueByAccount[item.social_account_id] = { queued: 0, failed: 0 };
        }
        if (item.status === 'queued') {
          queueByAccount[item.social_account_id].queued++;
        } else if (item.status === 'failed') {
          queueByAccount[item.social_account_id].failed++;
        }
      });
    }

    // Add queue counts to accounts
    const accountsWithQueue = accounts?.map(acc => ({
      ...acc,
      queue_count: queueByAccount[acc.id]?.queued || 0,
      failed_count: queueByAccount[acc.id]?.failed || 0
    }));

    return NextResponse.json({
      cronJobs,
      accounts: accountsWithQueue || [],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching cron status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cron status', details: error.message },
      { status: 500 }
    );
  }
}
