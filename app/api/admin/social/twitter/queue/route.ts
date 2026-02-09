import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import { z } from 'zod';

const addQueueSchema = z.object({
  socialAccountId: z.string().uuid(),
  content: z.string().min(1).max(280),
  scheduledFor: z.string().datetime().optional(),
});

/**
 * POST /api/admin/social/twitter/queue
 *
 * Add a post to the Twitter queue.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = addQueueSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { socialAccountId, content, scheduledFor } = validation.data;

    // Verify the social account exists
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('id, platform')
      .eq('id', socialAccountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 });
    }

    if (account.platform !== 'twitter') {
      return NextResponse.json({ error: 'Account is not a Twitter account' }, { status: 400 });
    }

    // Add to queue
    const { data: queuedPost, error: insertError } = await supabase
      .from('post_queue')
      .insert({
        social_account_id: socialAccountId,
        post_content: content,
        scheduled_for: scheduledFor || null,
        status: 'queued',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[admin/social/twitter/queue] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: queuedPost,
    });
  } catch (error) {
    console.error('[admin/social/twitter/queue] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/social/twitter/queue?id=<uuid>
 *
 * Remove a post from the queue.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('post_queue')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('[admin/social/twitter/queue] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/social/twitter/queue] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
