import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/user/identities/check - Check if an identity already exists
// Used before linking to determine if a merge prompt is needed
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const providerUserId = searchParams.get('provider_user_id');

    if (!provider || !providerUserId) {
      return NextResponse.json({
        error: 'provider and provider_user_id are required',
      }, { status: 400 });
    }

    // Check if identity exists
    const { data: existingIdentity } = await supabase
      .from('user_identities')
      .select(`
        id,
        unified_user_id,
        provider,
        provider_user_id,
        provider_email,
        provider_handle,
        linked_at
      `)
      .eq('provider', provider)
      .eq('provider_user_id', providerUserId)
      .single();

    if (!existingIdentity) {
      return NextResponse.json({
        exists: false,
        identity: null,
      });
    }

    // Get some info about the unified user (for merge prompt)
    const { data: unifiedUser } = await supabase
      .from('unified_users')
      .select('id, display_name, primary_email, created_at')
      .eq('id', existingIdentity.unified_user_id)
      .single();

    // Count how many identities are linked to that user
    const { count } = await supabase
      .from('user_identities')
      .select('*', { count: 'exact', head: true })
      .eq('unified_user_id', existingIdentity.unified_user_id);

    return NextResponse.json({
      exists: true,
      identity: existingIdentity,
      unified_user: unifiedUser,
      identity_count: count || 0,
    });
  } catch (error) {
    console.error('Identity check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
