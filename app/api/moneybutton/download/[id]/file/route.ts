import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_BUCKET, SIGNED_URL_EXPIRY } from '@/lib/moneybutton/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Download token required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get purchase by token
    const { data: purchase, error: purchaseError } = await supabase
      .from('paid_download_purchases')
      .select('*, paid_downloads(*)')
      .eq('download_token', token)
      .eq('download_id', id)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Invalid or expired download token' }, { status: 403 });
    }

    // Check if token is expired
    if (new Date(purchase.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download token has expired' }, { status: 403 });
    }

    // Check download count
    if (purchase.download_count >= purchase.max_downloads) {
      return NextResponse.json(
        { error: `Maximum downloads reached (${purchase.max_downloads})` },
        { status: 403 }
      );
    }

    const listing = purchase.paid_downloads;
    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing no longer available' }, { status: 404 });
    }

    // Increment download count
    await supabase
      .from('paid_download_purchases')
      .update({ download_count: purchase.download_count + 1 })
      .eq('id', purchase.id);

    // Generate signed URL for the file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(listing.file_path, SIGNED_URL_EXPIRY);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      download: {
        url: signedUrlData.signedUrl,
        fileName: listing.file_name,
        fileSize: listing.file_size,
        mimeType: listing.mime_type,
        downloadsRemaining: purchase.max_downloads - purchase.download_count - 1,
        expiresAt: purchase.expires_at,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download failed' },
      { status: 500 }
    );
  }
}
