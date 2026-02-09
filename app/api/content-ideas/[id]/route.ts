import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (!accessToken) return null;
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  return user;
}

export const dynamic = 'force-dynamic';

// DELETE - Delete a content idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete the content idea (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from('content_ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting content idea:', error);
      return NextResponse.json({ error: 'Failed to delete content idea' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/content-ideas/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a content idea
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { url, title, source_type, tags, notes, used } = body;

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};

    if (url !== undefined) updates.url = url;
    if (title !== undefined) updates.title = title;
    if (source_type !== undefined) {
      const validSourceTypes = ['article', 'tweet', 'repo', 'manual'];
      if (!validSourceTypes.includes(source_type)) {
        return NextResponse.json(
          { error: `Invalid source_type. Must be one of: ${validSourceTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updates.source_type = source_type;
    }
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (notes !== undefined) updates.notes = notes;
    if (used !== undefined) updates.used = Boolean(used);

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update the content idea (RLS ensures user can only update their own)
    const { data, error } = await supabase
      .from('content_ideas')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content idea:', error);
      return NextResponse.json({ error: 'Failed to update content idea' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Content idea not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/content-ideas/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
