import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin client for user management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string;
  providers: string[];
  full_name: string | null;
  avatar_url: string | null;
  handcash_handle: string | null;
  username: string | null;
  is_confirmed: boolean;
  // Profile data
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    handcash_handle: string | null;
    bsv_address: string | null;
    eth_address: string | null;
    sol_address: string | null;
    role: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, we'll rely on the dashboard being protected

    // Fetch all users from auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100,
      page: 1
    });

    if (authError) {
      console.error('[Admin Users] Auth error:', authError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('[Admin Users] Profiles error:', profilesError);
    }

    // Create a map of profiles by user ID
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Transform users into our format
    const users: AdminUser[] = authData.users.map(user => {
      const profile = profileMap.get(user.id);

      // Determine providers from identities
      const providers = user.identities?.map(i => i.provider) || ['email'];

      // Check for HandCash in metadata
      const handcashHandle =
        user.user_metadata?.handcash_handle ||
        user.app_metadata?.handcash_handle ||
        profile?.handcash_handle ||
        null;

      if (handcashHandle && !providers.includes('handcash')) {
        providers.push('handcash');
      }

      // Primary provider (most recent or first)
      const primaryProvider = user.app_metadata?.provider || providers[0] || 'email';

      return {
        id: user.id,
        email: user.email || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        provider: primaryProvider,
        providers: providers,
        full_name: user.user_metadata?.full_name || profile?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url || null,
        handcash_handle: handcashHandle,
        username: profile?.username || null,
        is_confirmed: user.email_confirmed_at !== null,
        profile: profile ? {
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          handcash_handle: profile.handcash_handle,
          bsv_address: profile.bsv_address,
          eth_address: profile.eth_address,
          sol_address: profile.sol_address,
          role: profile.role,
        } : undefined,
      };
    });

    // Sort by created_at descending (newest first)
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      users,
      total: users.length,
      stats: {
        total: users.length,
        email: users.filter(u => u.provider === 'email').length,
        handcash: users.filter(u => u.providers.includes('handcash')).length,
        google: users.filter(u => u.providers.includes('google')).length,
        github: users.filter(u => u.providers.includes('github')).length,
        withProfile: users.filter(u => u.profile).length,
        confirmed: users.filter(u => u.is_confirmed).length,
      }
    });
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
