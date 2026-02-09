import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function getSupabaseUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB` },
        { status: 400 }
      );
    }

    // Determine asset type from MIME type
    let assetType = 'document';
    if (file.type.startsWith('video/')) assetType = 'video';
    else if (file.type.startsWith('audio/')) assetType = 'audio';
    else if (file.type.startsWith('image/')) assetType = 'image';

    // Create safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = `${user.id}/${assetType}s/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('content-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-assets')
      .getPublicUrl(filePath);

    // Create database record
    const { data: assetData, error: dbError } = await supabase
      .from('content_assets')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        asset_type: assetType,
        title: title || file.name,
        description: description || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        project_id: projectId || null,
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString(),
          public_url: publicUrl
        }
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage
        .from('content-assets')
        .remove([filePath]);

      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      asset: {
        ...assetData,
        publicUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
