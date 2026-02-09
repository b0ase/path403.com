/**
 * GET /api/path402/blog/tokenized
 *
 * Public endpoint returning all tokenized blog slugs.
 * Used by the blog listing page to add $ prefix to links.
 */

import { NextResponse } from 'next/server';
import { getTokenizedBlogSlugs } from '@/lib/path402/blog';

export async function GET() {
  try {
    const slugs = await getTokenizedBlogSlugs();
    return NextResponse.json({ slugs }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}
