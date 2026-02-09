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

// Valid asset types and their allowed extensions
const ASSET_TYPES = {
  primary_logo: ['svg', 'png'],
  inverted_logo: ['svg', 'png'],
  favicon: ['ico', 'png'],
  social_image: ['png', 'jpg', 'jpeg'],
} as const;

type AssetType = keyof typeof ASSET_TYPES;

// POST - Upload brand asset file
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assetType = formData.get('assetType') as AssetType;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!assetType || !ASSET_TYPES[assetType]) {
      return NextResponse.json(
        {
          error: `Invalid assetType. Must be one of: ${Object.keys(ASSET_TYPES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Validate file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ASSET_TYPES[assetType].includes(fileExt as any)) {
      return NextResponse.json(
        {
          error: `Invalid file type for ${assetType}. Allowed: ${ASSET_TYPES[assetType].join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create file path: {user_id}/{assetType}.{ext}
    const filePath = `${user.id}/${assetType}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('brand-assets').getPublicUrl(filePath);

    // Update brand_assets table with new URL
    const columnName = `${assetType}_url`;

    // Check if brand assets record exists
    const { data: existing } = await supabase
      .from('brand_assets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('brand_assets')
        .update({ [columnName]: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating brand assets:', updateError);
        return NextResponse.json({ error: 'Failed to update brand assets' }, { status: 500 });
      }
    } else {
      // Create new record with this asset
      const { error: insertError } = await supabase.from('brand_assets').insert({
        user_id: user.id,
        [columnName]: publicUrl,
      });

      if (insertError) {
        console.error('Error creating brand assets:', insertError);
        return NextResponse.json({ error: 'Failed to create brand assets' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, url: publicUrl, assetType });
  } catch (error) {
    console.error('Error in POST /api/brand-assets/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
