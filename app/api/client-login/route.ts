import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { config } from '@/lib/config/env';
import bcrypt from 'bcryptjs';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

const ADMIN_EMAIL = config.admin.email;
const ADMIN_PROJECT_PASSWORD = config.admin.password;

const supabase = createAdminClient();

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Client login endpoint' });
}

async function clientLoginHandler(req: NextRequest) {
  try {
    const { projectSlug, password, email } = await req.json();
    if (!projectSlug || !password || !email) {
      return NextResponse.json({ error: 'Missing projectSlug, password, or email' }, { status: 400 });
    }
    // Superuser bypass
    if (email === ADMIN_EMAIL && password === ADMIN_PROJECT_PASSWORD) {
      await supabase.from('client_project_access').insert({ project_slug: projectSlug, email });
      return NextResponse.json({ success: true, superuser: true });
    }
    // Fetch the password hash for the project
    const { data, error } = await supabase
      .from('client_project_logins')
      .select('password_hash')
      .eq('project_slug', projectSlug)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'Project not found or no password set' }, { status: 404 });
    }
    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    // Log the access
    await supabase.from('client_project_access').insert({ project_slug: projectSlug, email });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Rate limit: 5 requests per 15 minutes (strict for login attempts)
export const POST = withRateLimit(clientLoginHandler, rateLimitPresets.auth); 