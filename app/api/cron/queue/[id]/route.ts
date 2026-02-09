import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/database/pool';
import { validateTweet } from '@/lib/tweet-generator';

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch a single queue item with validation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getDbPool();

  try {
    const { id } = await params;

    const result = await pool.query(
      'SELECT * FROM post_queue WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      );
    }

    const item = result.rows[0];
    const validation = validateTweet(item.post_content);

    return NextResponse.json({
      item,
      validation,
    });
  } catch (error: any) {
    console.error('Error fetching queue item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue item', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a queue item (edit content, approve, reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getDbPool();

  try {
    const { id } = await params;
    const body = await request.json();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (body.post_content !== undefined) {
      updates.push(`post_content = $${paramCount++}`);
      values.push(body.post_content);
    }

    if (body.status !== undefined) {
      const validStatuses = ['pending_review', 'queued', 'rejected'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push(`status = $${paramCount++}`);
      values.push(body.status);
    }

    if (body.scheduled_for !== undefined) {
      updates.push(`scheduled_for = $${paramCount++}`);
      values.push(body.scheduled_for);
    }

    if (body.metadata !== undefined) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(body.metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE post_queue
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      );
    }

    const updated = result.rows[0];
    const validation = validateTweet(updated.post_content);

    return NextResponse.json({
      success: true,
      item: updated,
      validation,
    });
  } catch (error: any) {
    console.error('Error updating queue item:', error);
    return NextResponse.json(
      { error: 'Failed to update queue item', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a queue item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const pool = getDbPool();

  try {
    const { id } = await params;

    const result = await pool.query(
      'DELETE FROM post_queue WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error deleting queue item:', error);
    return NextResponse.json(
      { error: 'Failed to delete queue item', details: error.message },
      { status: 500 }
    );
  }
}
