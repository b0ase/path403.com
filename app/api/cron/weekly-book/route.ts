import { NextRequest, NextResponse } from 'next/server';
import { BookGenerator } from '@/lib/auto-book/book-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - book generation takes time

/**
 * Weekly Book Generation Cron Job
 *
 * Processes the next queued book from the AutoBook table.
 * Pipeline:
 * 1. Find next DRAFT/QUEUED book
 * 2. Run ResearchAgent for outline
 * 3. Run WritingAgent for each chapter
 * 4. Compile into final markdown
 * 5. Mark as PUBLISHED
 *
 * Schedule: Every Sunday at 2 AM UTC
 * Vercel Cron: "0 2 * * 0"
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');

    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualWithSecret = secretParam === cronSecret;
    // Security: Always require authentication, even in development
    if (!isVercelCron && !isManualWithSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Weekly Book] Starting book generation...');

    const result = await BookGenerator.processNextBook();

    if (!result.success) {
      console.log('[Weekly Book] No book processed:', result.error);
      return NextResponse.json({
        success: false,
        message: result.error,
      });
    }

    console.log(`[Weekly Book] Generated: ${result.title} (${result.chapters} chapters)`);

    return NextResponse.json({
      success: true,
      message: `Generated book: ${result.title}`,
      book: {
        id: result.bookId,
        title: result.title,
        chapters: result.chapters,
      },
    });
  } catch (error) {
    console.error('[Weekly Book] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST endpoint for manual trigger with specific book ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, bookId } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result;

    if (bookId) {
      // Generate specific book
      result = await BookGenerator.generateFullBook(bookId);
    } else {
      // Process next queued book
      result = await BookGenerator.processNextBook();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Weekly Book POST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
