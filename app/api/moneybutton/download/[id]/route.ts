import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get listing (only active ones are visible via RLS)
    const { data: listing, error } = await supabase
      .from('paid_downloads')
      .select('id, title, description, price_usd, file_name, file_size, mime_type, download_count, seller_handcash, created_at')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get listing' },
      { status: 500 }
    );
  }
}
