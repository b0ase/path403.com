import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';
import { generateEngagementTweet } from '@/lib/tweet-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pool = getDbPool();

  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting Blog Generation Cron Job...');

    // Find unused content ideas (not tweets, those go to Twitter directly)
    const result = await pool.query(`
      SELECT * FROM content_ideas
      WHERE used = false
      AND source_type IN ('article', 'repo', 'manual')
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('No content ideas available for blog generation.');
      return NextResponse.json({ message: 'No content ideas to process' });
    }

    const idea = result.rows[0];
    console.log(`Processing content idea: ${idea.title}`);

    // Call the blog generate API internally
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const generateResponse = await fetch(`${baseUrl}/api/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentIdeaId: idea.id }),
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.json();
      throw new Error(`Blog generation failed: ${error.details || error.error}`);
    }

    const { blogPost } = await generateResponse.json();
    console.log(`✅ Blog post created: ${blogPost.title} (${blogPost.slug})`);

    // Generate engagement-optimized tweet for the blog post
    try {
      console.log('Generating engagement-optimized tweet...');

      const generatedTweet = await generateEngagementTweet({
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        url: blogPost.url,
        tags: idea.tags,
      });

      console.log(`✅ Tweet generated using "${generatedTweet.template}" template`);

      // Get social account for b0ase.com Twitter
      const accountResult = await pool.query(`
        SELECT id FROM social_accounts
        WHERE site = 'b0ase.com' AND platform = 'twitter'
        LIMIT 1
      `);

      if (accountResult.rows.length > 0) {
        const socialAccountId = accountResult.rows[0].id;

        // Add to queue with 'pending_review' status - requires human approval
        await pool.query(`
          INSERT INTO post_queue (social_account_id, post_content, status, metadata)
          VALUES ($1, $2, 'pending_review', $3)
        `, [
          socialAccountId,
          generatedTweet.content,
          JSON.stringify({
            template: generatedTweet.template,
            hook: generatedTweet.hook,
            hasQuestion: generatedTweet.hasQuestion,
            blogPostId: blogPost.id,
            blogPostSlug: blogPost.slug,
            generatedAt: new Date().toISOString(),
          }),
        ]);

        console.log(`✅ Tweet added to review queue (pending_review)`);

        return NextResponse.json({
          success: true,
          blogPost,
          tweet: {
            action: 'pending_review',
            content: generatedTweet.content,
            template: generatedTweet.template,
            note: 'Tweet queued for human review before posting',
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          blogPost,
          twitter: 'account not configured',
        });
      }
    } catch (twitterError: any) {
      console.error('Twitter queue failed:', twitterError);
      // Return success anyway - blog was created
      return NextResponse.json({
        success: true,
        blogPost,
        twitterError: twitterError.message,
      });
    }
  } catch (error: any) {
    console.error('Blog cron error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
