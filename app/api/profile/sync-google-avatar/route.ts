import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the user's metadata from auth.users table
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(user.id);
    
    if (authUserError || !authUser) {
      return NextResponse.json({ error: 'Could not fetch user metadata' }, { status: 500 });
    }

    // Extract Google profile data from user_metadata
    const rawMetadata = authUser.user.user_metadata || {};
    const googleAvatar = rawMetadata.avatar_url || rawMetadata.picture;
    const googleFullName = rawMetadata.full_name || rawMetadata.name;

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Could not fetch profile' }, { status: 500 });
    }

    // Prepare update data
    const updateData: { avatar_url?: string; full_name?: string } = {};
    
    // Only update if current profile doesn't have avatar and Google provides one
    if (!profile.avatar_url && googleAvatar) {
      updateData.avatar_url = googleAvatar;
    }
    
    // Only update if current profile doesn't have full name and Google provides one
    if (!profile.full_name && googleFullName) {
      updateData.full_name = googleFullName;
    }

    // If nothing to update, return success
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        message: 'Profile already up to date',
        updated: false 
      });
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      updated: true,
      changes: updateData
    });

  } catch (error: any) {
    console.error('Error syncing Google avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 