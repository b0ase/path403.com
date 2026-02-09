import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unauthorized' }, { status });
  }

  const supabaseAdmin = createAdminClient();

  const { data, error: dbError } = await supabaseAdmin
    .from("client_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) {
    console.error("Error fetching client requests:", dbError);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
