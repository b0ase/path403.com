import { NextRequest, NextResponse } from 'next/server';
import { BlogGenerator } from '@/lib/auto-book/blog-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for AI generation

/**
 * Daily Blog Post Generator
 *
 * This cron job runs daily at 9 AM UTC to:
 * 1. Fetch unused content ideas from the database
 * 2. Generate a blog topic and full post using AI
 * 3. Save the post as a markdown file
 * 4. Return the blog.ts entry for manual addition
 *
 * Trigger: Vercel Cron at "0 9 * * *"
 * Manual: GET /api/cron/daily-blog?secret=CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');

    const cronSecret = process.env.CRON_SECRET;

    // Allow Vercel cron (no auth needed) or manual with secret
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualWithSecret = secretParam === cronSecret;

    // Security: Always require authentication, even in development
    if (!isVercelCron && !isManualWithSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide valid CRON_SECRET.' },
        { status: 401 }
      );
    }

    console.log('[Daily Blog] Starting generation...');

    const result = await BlogGenerator.generateDailyPost();

    if (!result.success) {
      console.error('[Daily Blog] Generation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Blog post generation failed'
        },
        { status: 500 }
      );
    }

    console.log('[Daily Blog] Success:', result.post?.title);

    // Log the blog.ts entry for manual addition
    console.log('\n[Daily Blog] Add this to lib/blog.ts:\n');
    console.log(result.blogEntry);
    console.log('\n');

    return NextResponse.json({
      success: true,
      message: 'Blog post generated successfully',
      post: {
        title: result.post?.title,
        slug: result.post?.slug,
        tags: result.post?.tags,
        category: result.post?.category
      },
      filePath: result.filePath,
      blogEntry: result.blogEntry,
      nextSteps: [
        'Post saved to content/blog/',
        'Add the blogEntry to lib/blog.ts blogPosts array',
        'Commit and push to deploy'
      ]
    });
  } catch (error) {
    console.error('[Daily Blog] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual trigger with options
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, dryRun } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (dryRun) {
      // Just fetch ideas and generate topic without saving
      const ideas = await BlogGenerator.getContentIdeas(3);

      if (ideas.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No unused content ideas available'
        });
      }

      const { topic, angle } = await BlogGenerator.generateTopic(ideas);

      return NextResponse.json({
        success: true,
        dryRun: true,
        ideas: ideas.map(i => ({ title: i.title, url: i.url })),
        generatedTopic: topic,
        angle
      });
    }

    // Full generation
    const result = await BlogGenerator.generateDailyPost();

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Daily Blog POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
