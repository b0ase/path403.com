import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, AuthError } from '@/lib/auth';

// GET: List all clients (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Create a new client (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status });
  }

  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('clients').insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// PUT: Update a client (admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status });
  }

  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing client id' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('clients').update(fields).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// DELETE: Delete a client (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing client id' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
