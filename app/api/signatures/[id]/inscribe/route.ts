import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { inscribeBitSignData } from '@/lib/bitsign-inscription';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/signatures/[id]/inscribe
 * Inscribe a signature on the BSV blockchain
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get signature
    const { data: signature, error: fetchError } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !signature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    // Check if already inscribed
    if (signature.inscription_txid) {
      return NextResponse.json({
        error: 'Signature already inscribed',
        inscription_txid: signature.inscription_txid,
        inscription_url: signature.inscription_url,
      }, { status: 400 });
    }

    // Get user profile for inscription data
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, handle, email')
      .eq('id', user.id)
      .single();

    // Inscribe on BSV
    const result = await inscribeBitSignData({
      type: 'signature_registration',
      signatureId: signature.id,
      signatureType: signature.signature_type,
      signatureHash: await hashSignature(signature),
      ownerName: profile?.name || profile?.handle || 'Anonymous',
      walletAddress: signature.wallet_address,
      walletType: signature.wallet_type,
      createdAt: signature.created_at,
    });

    // Update signature with inscription data
    const { data: updated, error: updateError } = await supabase
      .from('user_signatures')
      .update({
        inscription_txid: result.txid,
        inscription_url: result.blockchainExplorerUrl,
        inscribed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[signatures/inscribe] Error updating:', updateError);
      // Still return success since inscription happened
    }

    return NextResponse.json({
      success: true,
      inscription_txid: result.txid,
      inscription_url: result.blockchainExplorerUrl,
      signature: updated || signature,
    });
  } catch (error) {
    console.error('[signatures/inscribe] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to inscribe signature' },
      { status: 500 }
    );
  }
}

/**
 * Generate SHA-256 hash of signature data
 */
async function hashSignature(signature: any): Promise<string> {
  const content = signature.signature_type === 'drawn'
    ? signature.svg_data
    : `${signature.typed_text}:${signature.typed_font}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
