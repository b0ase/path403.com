import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';


export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getDbPool();

  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, tags, published_at, author_id
       FROM blog_posts
       WHERE status = $1
       ORDER BY published_at DESC`,
      ['published']
    );

    const posts = result.rows.map(row => ({
      slug: row.slug,
      title: row.title,
      description: row.excerpt,
      author: { name: 'b0ase', url: 'https://b0ase.com' },
      company: { name: 'b0ase.com', url: 'https://b0ase.com' },
      date: row.published_at,
      readTime: '5 min read',
      tags: row.tags || [],
      featured: false
    }));

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts', details: error.message },
      { status: 500 }
    );
  }
}
