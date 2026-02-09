import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import {
  PLATFORM_HANDCASH_HANDLE,
  calculateFeeSplit,
  generateDownloadToken,
  getTokenExpiryDate,
  DOWNLOAD_TOKEN,
} from '@/lib/moneybutton/constants';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { authToken, buyerHandcash, buyerEmail } = body;

    if (!authToken) {
      return NextResponse.json({ error: 'HandCash auth token required' }, { status: 400 });
    }

    if (!buyerHandcash) {
      return NextResponse.json({ error: 'Buyer HandCash handle required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('paid_downloads')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found or no longer available' }, { status: 404 });
    }

    // Calculate fee split
    const { sellerAmount, platformAmount } = calculateFeeSplit(listing.price_usd);

    // Process payment via HandCash multi-payment
    let paymentResult;
    try {
      paymentResult = await handcashService.sendMultiPayment(authToken, {
        description: `Purchase: ${listing.title}`,
        appAction: 'PURCHASE',
        payments: [
          {
            destination: listing.seller_handcash,
            amount: sellerAmount,
            currencyCode: 'USD',
          },
          {
            destination: PLATFORM_HANDCASH_HANDLE,
            amount: platformAmount,
            currencyCode: 'USD',
          },
        ],
      });
    } catch (paymentError: any) {
      console.error('Payment error:', paymentError);
      return NextResponse.json(
        { error: paymentError.message || 'Payment failed' },
        { status: 402 }
      );
    }

    // Generate download token
    const downloadToken = generateDownloadToken();
    const expiresAt = getTokenExpiryDate();

    // Record purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('paid_download_purchases')
      .insert({
        download_id: listing.id,
        buyer_handcash: buyerHandcash,
        buyer_email: buyerEmail || null,
        amount_usd: listing.price_usd,
        handcash_txid: paymentResult.transactionId,
        seller_amount: sellerAmount,
        platform_amount: platformAmount,
        download_token: downloadToken,
        max_downloads: DOWNLOAD_TOKEN.MAX_DOWNLOADS,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Purchase record error:', purchaseError);
      // Payment went through but record failed - log for manual resolution
      return NextResponse.json(
        {
          error: 'Purchase recorded but token generation failed. Contact support with transaction ID.',
          transactionId: paymentResult.transactionId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        downloadToken,
        expiresAt: expiresAt.toISOString(),
        maxDownloads: DOWNLOAD_TOKEN.MAX_DOWNLOADS,
        transactionId: paymentResult.transactionId,
        listing: {
          id: listing.id,
          title: listing.title,
          fileName: listing.file_name,
        },
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Purchase failed' },
      { status: 500 }
    );
  }
}
