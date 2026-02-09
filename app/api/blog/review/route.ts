import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const prisma = getPrisma();

/**
 * GET /api/blog/review
 * List blog posts pending review (draft status)
 */
export async function GET() {
  try {
    const posts = await prisma.blog_posts.findMany({
      where: {
        status: 'draft',
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        tags: true,
        created_at: true,
        updated_at: true,
        featured_image_url: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[Blog Review] Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts for review' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/review
 * Update blog post status (approve/reject/edit)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, action, content, title, excerpt, tags } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    if (!action || !['approve', 'reject', 'edit'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let updateData: any = {
      updated_at: new Date(),
    };

    switch (action) {
      case 'approve':
        updateData.status = 'published';
        updateData.published_at = new Date();
        break;

      case 'reject':
        updateData.status = 'archived';
        break;

      case 'edit':
        if (content) updateData.content = content;
        if (title) updateData.title = title;
        if (excerpt) updateData.excerpt = excerpt;
        if (tags) updateData.tags = tags;
        break;
    }

    const updated = await prisma.blog_posts.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      action,
      post: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error('[Blog Review] Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
