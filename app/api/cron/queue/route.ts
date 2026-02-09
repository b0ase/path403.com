import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pool = getDbPool();

  try {
    const searchParams = request.nextUrl.searchParams;
    const site = searchParams.get('site');
    const account = searchParams.get('account');

    if (!site || !account) {
      return NextResponse.json(
        { error: 'site and account parameters required' },
        { status: 400 }
      );
    }

    // Get social account ID
    const accountResult = await pool.query(
      'SELECT id FROM social_accounts WHERE site = $1 AND handle = $2',
      [site, account]
    );

    if (accountResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      );
    }

    const accountId = accountResult.rows[0].id;

    // Fetch pending review items (need human approval)
    const pendingResult = await pool.query(
      `SELECT * FROM post_queue
       WHERE social_account_id = $1 AND status = 'pending_review'
       ORDER BY created_at DESC`,
      [accountId]
    );

    // Fetch approved/queued items (ready to post)
    const queueResult = await pool.query(
      `SELECT * FROM post_queue
       WHERE social_account_id = $1 AND status = 'queued'
       ORDER BY scheduled_for ASC NULLS FIRST, created_at ASC`,
      [accountId]
    );

    // Fetch posted
    const postedResult = await pool.query(
      `SELECT * FROM posted_content
       WHERE social_account_id = $1
       ORDER BY posted_at DESC
       LIMIT 50`,
      [accountId]
    );

    return NextResponse.json({
      pending: pendingResult.rows,
      queue: queueResult.rows,
      posted: postedResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue', details: error.message },
      { status: 500 }
    );
  }
}
