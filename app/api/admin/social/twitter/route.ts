import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import { isTwitterConfigured } from '@/lib/integrations/twitter';

/**
 * GET /api/admin/social/twitter
 *
 * Fetch Twitter accounts, post queue, and posted history for admin management.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Twitter accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', 'twitter')
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('[admin/social/twitter] Accounts error:', accountsError);
    }

    // Get post queue
    const { data: queue, error: queueError } = await supabase
      .from('post_queue')
      .select('*')
      .order('scheduled_for', { ascending: true, nullsFirst: true });

    if (queueError) {
      console.error('[admin/social/twitter] Queue error:', queueError);
    }

    // Get recently posted (last 50)
    const { data: posted, error: postedError } = await supabase
      .from('posted_content')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(50);

    if (postedError) {
      console.error('[admin/social/twitter] Posted error:', postedError);
    }

    // Check Twitter configuration
    const configured = isTwitterConfigured();

    return NextResponse.json({
      accounts: accounts || [],
      queue: queue || [],
      posted: posted || [],
      configStatus: {
        configured,
        message: configured
          ? 'Twitter API configured and ready'
          : 'Twitter API not configured. Set TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET in environment.',
      },
    });
  } catch (error) {
    console.error('[admin/social/twitter] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
