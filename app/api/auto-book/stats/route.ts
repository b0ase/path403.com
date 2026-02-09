import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const prisma = getPrisma();

/**
 * GET /api/auto-book/stats
 * Get statistics for the Auto-Book monitoring dashboard
 */
export async function GET() {
  try {
    // Get book counts by status
    const bookStats = await prisma.autoBook.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get total books
    const totalBooks = await prisma.autoBook.count();

    // Get recent books
    const recentBooks = await prisma.autoBook.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get blog post counts by status
    const blogStats = await prisma.blog_posts.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get total blog posts
    const totalBlogPosts = await prisma.blog_posts.count();

    // Get recent blog posts
    const recentBlogPosts = await prisma.blog_posts.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        created_at: true,
        published_at: true,
      },
    });

    // Get content ideas counts by used status
    const usedCount = await prisma.content_ideas.count({
      where: { used: true },
    });
    const unusedCount = await prisma.content_ideas.count({
      where: { used: false },
    });

    // Get total content ideas
    const totalContentIdeas = await prisma.content_ideas.count();

    // Get recent content ideas
    const recentContentIdeas = await prisma.content_ideas.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        source_type: true,
        used: true,
        created_at: true,
      },
    });

    // Calculate cron schedule info
    const cronSchedules = [
      { name: 'Content Collection', schedule: '6 AM UTC daily', endpoint: '/api/cron/collect-content' },
      { name: 'Blog Post Generation', schedule: '2 PM UTC daily', endpoint: '/api/cron/blog-post' },
      { name: 'Weekly Book', schedule: 'Sunday 2 AM UTC', endpoint: '/api/cron/weekly-book' },
      { name: 'Twitter Post', schedule: '10 AM UTC daily', endpoint: '/api/cron/twitter-post' },
    ];

    return NextResponse.json({
      books: {
        total: totalBooks,
        byStatus: bookStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
        recent: recentBooks,
      },
      blogPosts: {
        total: totalBlogPosts,
        byStatus: blogStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
        recent: recentBlogPosts,
        pendingReview: blogStats.find(s => s.status === 'draft')?._count.id || 0,
      },
      contentIdeas: {
        total: totalContentIdeas,
        byStatus: { used: usedCount, unused: unusedCount },
        recent: recentContentIdeas,
        pending: unusedCount,
      },
      cronSchedules,
      systemStatus: {
        database: 'online',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Auto-Book Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
