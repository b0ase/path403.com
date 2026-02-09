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

// GET - Fetch user's brand assets
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch brand assets for current user
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching brand assets:', error);
      return NextResponse.json({ error: 'Failed to fetch brand assets' }, { status: 500 });
    }

    // If no brand assets exist, return defaults
    if (!data) {
      return NextResponse.json({
        brandAssets: {
          user_id: user.id,
          primary_logo_url: null,
          inverted_logo_url: null,
          favicon_url: null,
          social_image_url: null,
          primary_color: '#000000',
          secondary_color: '#FFFFFF',
          background_color: '#000000',
          text_color: '#FFFFFF',
          accent_color: '#FBBF24',
          heading_font: null,
          body_font: null,
        },
      });
    }

    return NextResponse.json({ brandAssets: data });
  } catch (error) {
    console.error('Error in GET /api/brand-assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update brand assets
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      primary_logo_url,
      inverted_logo_url,
      favicon_url,
      social_image_url,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      accent_color,
      heading_font,
      body_font,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};

    if (primary_logo_url !== undefined) updates.primary_logo_url = primary_logo_url;
    if (inverted_logo_url !== undefined) updates.inverted_logo_url = inverted_logo_url;
    if (favicon_url !== undefined) updates.favicon_url = favicon_url;
    if (social_image_url !== undefined) updates.social_image_url = social_image_url;

    // Validate color formats if provided
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    if (primary_color !== undefined) {
      if (!hexColorRegex.test(primary_color)) {
        return NextResponse.json(
          { error: 'Invalid primary_color format. Must be hex format like #FBBF24' },
          { status: 400 }
        );
      }
      updates.primary_color = primary_color.toUpperCase();
    }

    if (secondary_color !== undefined) {
      if (!hexColorRegex.test(secondary_color)) {
        return NextResponse.json(
          { error: 'Invalid secondary_color format. Must be hex format like #FBBF24' },
          { status: 400 }
        );
      }
      updates.secondary_color = secondary_color.toUpperCase();
    }

    if (background_color !== undefined) {
      if (!hexColorRegex.test(background_color)) {
        return NextResponse.json(
          { error: 'Invalid background_color format. Must be hex format like #FBBF24' },
          { status: 400 }
        );
      }
      updates.background_color = background_color.toUpperCase();
    }

    if (text_color !== undefined) {
      if (!hexColorRegex.test(text_color)) {
        return NextResponse.json(
          { error: 'Invalid text_color format. Must be hex format like #FBBF24' },
          { status: 400 }
        );
      }
      updates.text_color = text_color.toUpperCase();
    }

    if (accent_color !== undefined) {
      if (!hexColorRegex.test(accent_color)) {
        return NextResponse.json(
          { error: 'Invalid accent_color format. Must be hex format like #FBBF24' },
          { status: 400 }
        );
      }
      updates.accent_color = accent_color.toUpperCase();
    }

    if (heading_font !== undefined) updates.heading_font = heading_font;
    if (body_font !== undefined) updates.body_font = body_font;

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Check if brand assets exist for this user
    const { data: existing } = await supabase
      .from('brand_assets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let data;
    let error;

    if (existing) {
      // Update existing brand assets
      const result = await supabase
        .from('brand_assets')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new brand assets with defaults
      const result = await supabase
        .from('brand_assets')
        .insert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating brand assets:', error);
      return NextResponse.json({ error: 'Failed to update brand assets' }, { status: 500 });
    }

    return NextResponse.json({ success: true, brandAssets: data });
  } catch (error) {
    console.error('Error in PATCH /api/brand-assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
