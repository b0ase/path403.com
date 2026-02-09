import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';
import { isTwitterConfigured } from '@/lib/integrations/twitter';
import { generateEngagementTweet } from '@/lib/tweet-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const pool = getDbPool();

    // Demo mode check
    if (!isTwitterConfigured()) {
        return NextResponse.json({
            message: 'Twitter cron is in DEMO MODE - no real operations',
            demoMode: true
        });
    }

    try {
        // verify signature if needed, or just rely on Vercel's protection if configured
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting Twitter Cron Job...');

        // 1. Fetch unused content ideas
        const result = await pool.query(`
            SELECT * FROM content_ideas
            WHERE used = false
            AND source_type = 'tweet'
            ORDER BY created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('No new content ideas found.');
            return NextResponse.json({ message: 'No content ideas to post' });
        }

        const idea = result.rows[0];
        console.log(`Processing idea: ${idea.title}`);

        // 2. Generate engagement-optimized tweet
        console.log('Generating engagement-optimized tweet...');
        const generatedTweet = await generateEngagementTweet({
            title: idea.title,
            excerpt: idea.notes,
            url: idea.url,
            tags: idea.tags,
        });

        console.log(`Tweet generated using "${generatedTweet.template}" template`);

        // 3. Get social account for b0ase.com Twitter
        const accountResult = await pool.query(`
            SELECT id FROM social_accounts
            WHERE site = 'b0ase.com' AND platform = 'twitter'
            LIMIT 1
        `);

        if (accountResult.rows.length === 0) {
            return NextResponse.json({
                error: 'Social account not configured',
                details: 'b0ase.com Twitter account not found in social_accounts table'
            }, { status: 500 });
        }

        const socialAccountId = accountResult.rows[0].id;

        // 4. Add to post queue with 'pending_review' status
        await pool.query(`
            INSERT INTO post_queue (social_account_id, content_idea_id, post_content, status, metadata)
            VALUES ($1, $2, $3, 'pending_review', $4)
        `, [
            socialAccountId,
            idea.id,
            generatedTweet.content,
            JSON.stringify({
                template: generatedTweet.template,
                hook: generatedTweet.hook,
                hasQuestion: generatedTweet.hasQuestion,
                contentIdeaTitle: idea.title,
                generatedAt: new Date().toISOString(),
            }),
        ]);

        console.log(`Tweet added to review queue (pending_review)`);

        // 5. Mark idea as used
        await pool.query(`
            UPDATE content_ideas
            SET used = true
            WHERE id = $1
        `, [idea.id]);

        return NextResponse.json({
            success: true,
            action: 'pending_review',
            content: generatedTweet.content,
            template: generatedTweet.template,
            note: 'Tweet queued for human review before posting'
        });

    } catch (error: any) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
