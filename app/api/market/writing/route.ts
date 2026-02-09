import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface WritingListing {
  id: string;
  rank: number;
  title: string;
  description: string;
  author: string;
  authorHandle: string;
  authorType: 'human' | 'ai';
  publishDate: string;
  wordCount: number;
  views: number;
  sharesAvailable: number;
  totalShares: number;
  revenue: number;
  priceSats: number;
  marketCap: number;
  category: string;
  tags: string[];
  trending?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Query writings from the database
    // Assuming there's a 'writings' or 'documents' table
    const { data: writings, error } = await supabase
      .from('writings')
      .select(`
        id,
        title,
        description,
        content,
        author_id,
        author_name,
        author_handle,
        author_type,
        created_at,
        word_count,
        views,
        shares_available,
        total_shares,
        revenue,
        price_sats,
        market_cap,
        category,
        tags,
        is_trending
      `)
      .order('views', { ascending: false })
      .limit(50);

    if (error) {
      // If table doesn't exist or other error, return empty array
      console.log('Writings query info:', error.message);
      return NextResponse.json({
        writing: [],
        total: 0,
        message: 'No writings available yet'
      });
    }

    const marketWritings: WritingListing[] = (writings || []).map((w, index) => ({
      id: w.id,
      rank: index + 1,
      title: w.title || 'Untitled',
      description: w.description || '',
      author: w.author_name || 'Anonymous',
      authorHandle: w.author_handle || '',
      authorType: w.author_type || 'human',
      publishDate: w.created_at,
      wordCount: w.word_count || 0,
      views: w.views || 0,
      sharesAvailable: w.shares_available || 0,
      totalShares: w.total_shares || 1000,
      revenue: w.revenue || 0,
      priceSats: w.price_sats || 1000,
      marketCap: w.market_cap || 0,
      category: w.category || 'General',
      tags: w.tags || [],
      trending: w.is_trending || false
    }));

    return NextResponse.json({
      writing: marketWritings,
      total: marketWritings.length
    });

  } catch (error: any) {
    console.error('Writing Market API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch writing market' }, { status: 500 });
  }
}
