import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  inscribeBlogPost,
  createBlogInscriptionDataFromMarkdown,
  verifyBlogInscription,
  BlogInscriptionResult,
} from '@/lib/blog-inscription';
import { getDbPool } from '@/lib/database/pool';

export const dynamic = 'force-dynamic';

/**
 * POST /api/blog/inscribe
 *
 * Inscribes a blog post on the BSV blockchain.
 *
 * Body:
 * - slug: string (for markdown files in content/blog/)
 * - blogPostId: string (for database blog posts)
 * - verify: boolean (optional, verify existing inscription instead of creating)
 * - txid: string (required if verify is true)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, blogPostId, verify, txid } = body;

    // Verify mode - check existing inscription
    if (verify && txid) {
      const verification = await verifyBlogInscription(txid);
      return NextResponse.json({
        success: verification.found,
        verification,
      });
    }

    // Must provide either slug or blogPostId
    if (!slug && !blogPostId) {
      return NextResponse.json(
        { error: 'Either slug (for markdown) or blogPostId (for database) is required' },
        { status: 400 }
      );
    }

    let inscriptionResult: BlogInscriptionResult;

    if (slug) {
      // Inscribe from markdown file
      const contentDir = join(process.cwd(), 'content', 'blog');
      const filePath = join(contentDir, `${slug}.md`);

      if (!existsSync(filePath)) {
        return NextResponse.json(
          { error: `Blog post not found: ${slug}` },
          { status: 404 }
        );
      }

      const markdown = readFileSync(filePath, 'utf-8');
      const inscriptionData = createBlogInscriptionDataFromMarkdown(slug, markdown);

      console.log(`[api/blog/inscribe] Inscribing markdown post: ${slug}`);
      inscriptionResult = await inscribeBlogPost(inscriptionData);

    } else {
      // Inscribe from database
      const pool = getDbPool();
      const result = await pool.query(
        'SELECT * FROM blog_posts WHERE id = $1',
        [blogPostId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Blog post not found in database' },
          { status: 404 }
        );
      }

      const post = result.rows[0];

      console.log(`[api/blog/inscribe] Inscribing database post: ${post.slug}`);
      inscriptionResult = await inscribeBlogPost({
        slug: post.slug,
        title: post.title,
        author: post.author_name || 'b0ase.com',
        date: post.published_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        excerpt: post.excerpt,
        tags: post.tags || [],
        content: post.content,
      });

      // Try to update blog post with inscription data (columns may not exist yet)
      try {
        await pool.query(
          `UPDATE blog_posts
           SET inscription_txid = $1,
               inscription_id = $2,
               inscription_hash = $3,
               inscribed_at = NOW()
           WHERE id = $4`,
          [
            inscriptionResult.txid,
            inscriptionResult.inscriptionId,
            inscriptionResult.contentHash,
            blogPostId,
          ]
        );
      } catch (dbError: any) {
        // Inscription columns may not exist in schema yet - log but don't fail
        console.warn('[api/blog/inscribe] Could not update blog_posts with inscription data:', dbError.message);
      }
    }

    return NextResponse.json({
      success: true,
      inscription: inscriptionResult,
      message: 'Blog post inscribed on BSV blockchain',
    });

  } catch (error: any) {
    console.error('[api/blog/inscribe] Error:', error);

    // Handle specific errors
    if (error.message?.includes('No UTXOs found')) {
      return NextResponse.json(
        {
          error: 'Insufficient funds for inscription',
          details: 'Please fund the BSV address with satoshis',
        },
        { status: 402 }
      );
    }

    if (error.message?.includes('BSV_ORDINALS_PRIVATE_KEY')) {
      return NextResponse.json(
        {
          error: 'BSV private key not configured',
          details: 'Set BSV_ORDINALS_PRIVATE_KEY in environment variables',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to inscribe blog post',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/inscribe?txid=xxx
 *
 * Verify an existing blog inscription
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txid = searchParams.get('txid');

    if (!txid) {
      return NextResponse.json(
        { error: 'txid query parameter is required' },
        { status: 400 }
      );
    }

    const verification = await verifyBlogInscription(txid);

    return NextResponse.json({
      success: verification.found,
      verification,
      explorerUrl: `https://whatsonchain.com/tx/${txid}`,
    });

  } catch (error: any) {
    console.error('[api/blog/inscribe] Verify error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify inscription',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
