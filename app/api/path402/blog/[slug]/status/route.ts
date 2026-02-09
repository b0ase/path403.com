/**
 * GET /api/path402/blog/[slug]/status
 *
 * Public endpoint returning token status for a blog post.
 * Used by Blog402Float to decide whether to render and what to show.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBlogTokenStatus } from '@/lib/path402/blog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  try {
    const status = await getBlogTokenStatus(slug);
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[path402/blog/status] Error:', error);
    return NextResponse.json({ tokenized: false });
  }
}
