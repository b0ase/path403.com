
import { createClient } from '@/lib/supabase/client';

export async function isUserAdmin(): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return false;

    // Check against environment variable if strictly defined
    // (Assuming NEXT_PUBLIC_ADMIN_EMAIL or similar is available, strictly we should use server check but for client UI hiding it's ok)
    // BETTER: Check the 'role' column in profiles, or hardcode known admin for now if env not exposed to client.

    // Checking profile role is safer/dynamic
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'Admin' || user.email === 'b@b0ase.com' || user.email === 'richard@b0ase.com';
}
