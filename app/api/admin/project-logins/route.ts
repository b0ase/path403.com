import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

// Note: Admin auth is enforced by middleware for /api/admin/* routes

// GET: List all project logins
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('client_project_logins')
    .select('id, project_slug, created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: Add new project login
export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const { project_slug, password } = await req.json();
  if (!project_slug || !password) {
    return NextResponse.json({ error: 'Missing project_slug or password' }, { status: 400 });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('client_project_logins')
    .insert([{ project_slug, password_hash }])
    .select('id, project_slug, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

// PUT: Update password for a project login
export async function PUT(req: NextRequest) {
  const supabase = createAdminClient();
  const { project_slug, password } = await req.json();
  if (!project_slug || !password) {
    return NextResponse.json({ error: 'Missing project_slug or password' }, { status: 400 });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('client_project_logins')
    .update({ password_hash })
    .eq('project_slug', project_slug)
    .select('id, project_slug, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE: Remove a project login
export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient();
  const { project_slug } = await req.json();
  if (!project_slug) {
    return NextResponse.json({ error: 'Missing project_slug' }, { status: 400 });
  }
  const { error } = await supabase
    .from('client_project_logins')
    .delete()
    .eq('project_slug', project_slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
} 