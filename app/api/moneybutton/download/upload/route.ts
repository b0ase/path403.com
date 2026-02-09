import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  UPLOAD_LIMITS,
  PRICE_LIMITS,
  ALLOWED_FILE_TYPES,
  STORAGE_BUCKET,
  isValidHandcashHandle,
  isValidEmail,
} from '@/lib/moneybutton/constants';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const sellerEmail = formData.get('email') as string;
    const sellerHandcash = formData.get('handcash') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
    }

    if (!priceStr || isNaN(parseFloat(priceStr))) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    if (price < PRICE_LIMITS.MIN_PRICE_USD || price > PRICE_LIMITS.MAX_PRICE_USD) {
      return NextResponse.json(
        { error: `Price must be between $${PRICE_LIMITS.MIN_PRICE_USD} and $${PRICE_LIMITS.MAX_PRICE_USD}` },
        { status: 400 }
      );
    }

    if (!sellerEmail || !isValidEmail(sellerEmail)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!sellerHandcash || !isValidHandcashHandle(sellerHandcash)) {
      return NextResponse.json(
        { error: 'Valid HandCash handle required (3-20 alphanumeric characters)' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${UPLOAD_LIMITS.MAX_FILE_SIZE_DISPLAY}` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: PDF, images, audio, video, zip, documents' },
        { status: 400 }
      );
    }

    // Create safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage (private bucket)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Create database record
    const { data: listing, error: dbError } = await supabase
      .from('paid_downloads')
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        title: title.trim(),
        description: description?.trim() || null,
        price_usd: price,
        seller_email: sellerEmail.toLowerCase().trim(),
        seller_handcash: sellerHandcash.trim(),
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

      console.error('Database error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        price_usd: listing.price_usd,
        file_name: listing.file_name,
        file_size: listing.file_size,
        created_at: listing.created_at,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
