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

// POST - Create new content idea
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { url, title, source_type, tags, notes } = body;

    // Validate required fields
    if (!url || !source_type) {
      return NextResponse.json(
        { error: 'Missing required fields: url and source_type' },
        { status: 400 }
      );
    }

    // Validate source_type
    const validSourceTypes = ['article', 'tweet', 'repo', 'manual'];
    if (!validSourceTypes.includes(source_type)) {
      return NextResponse.json(
        { error: `Invalid source_type. Must be one of: ${validSourceTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('content_ideas')
      .insert({
        user_id: user.id,
        url,
        title: title || url,
        source_type,
        tags: Array.isArray(tags) ? tags : [],
        notes: notes || '',
        used: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content idea:', error);
      return NextResponse.json({ error: 'Failed to create content idea' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/content-ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch all content ideas for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const usedFilter = searchParams.get('used');
    const sourceType = searchParams.get('source_type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    // Build query
    let query = supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (usedFilter !== null) {
      query = query.eq('used', usedFilter === 'true');
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch content ideas' }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/content-ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
