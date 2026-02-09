import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin-only endpoint to enable/disable AI Executive for users
// Usage:
//   POST /api/admin/ai-executive { email: "user@example.com", enabled: true }
//   GET  /api/admin/ai-executive?email=user@example.com

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function isAdmin(supabase: any): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}

// GET - Check AI Executive status for a user
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    if (!await isAdmin(supabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      // Return all AI Executive users
      const { data: users, error } = await supabase
        .from('unified_users')
        .select('id, display_name, primary_email, ai_executive_enabled, created_at')
        .eq('ai_executive_enabled', true)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ai_executive_users: users });
    }

    // Check specific user
    const { data: user, error } = await supabase
      .from('unified_users')
      .select('id, display_name, primary_email, ai_executive_enabled')
      .eq('primary_email', email)
      .single();

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('AI Executive GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Enable/disable AI Executive for a user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    if (!await isAdmin(supabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { email, user_id, enabled } = body;

    if (!email && !user_id) {
      return NextResponse.json({ error: 'email or user_id required' }, { status: 400 });
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be true or false' }, { status: 400 });
    }

    // Build query
    let query = supabase.from('unified_users').update({
      ai_executive_enabled: enabled,
      updated_at: new Date().toISOString()
    });

    if (user_id) {
      query = query.eq('id', user_id);
    } else {
      query = query.eq('primary_email', email);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('AI Executive update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        display_name: data.display_name,
        primary_email: data.primary_email,
        ai_executive_enabled: data.ai_executive_enabled
      },
      message: `AI Executive ${enabled ? 'enabled' : 'disabled'} for ${data.primary_email || data.display_name}`
    });
  } catch (error) {
    console.error('AI Executive POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
