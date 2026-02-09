import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { queued, live, formatted } = body;

    // Upsert the status
    const { data, error } = await supabase
      .from('blog_post_review_status')
      .upsert({
        slug,
        queued: queued ?? false,
        live: live ?? false,
        formatted: formatted ?? false,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in blog status update:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blog_post_review_status')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching blog post status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || { queued: false, live: false, formatted: false } });
  } catch (error) {
    console.error('Error in blog status fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post status' },
      { status: 500 }
    );
  }
}
