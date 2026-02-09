import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') === 'asc' ? true : false;

    // Get active listings
    const { data: listings, error, count } = await supabase
      .from('paid_downloads')
      .select('id, title, description, price_usd, file_name, file_size, mime_type, download_count, seller_handcash, created_at', { count: 'exact' })
      .eq('status', 'active')
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('List error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listings: listings || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list downloads' },
      { status: 500 }
    );
  }
}
