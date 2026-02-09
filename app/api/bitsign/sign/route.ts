import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { inscribeBitSignData } from '@/lib/bitsign-inscription';

/**
 * POST /api/bitsign/sign
 * Sign a document with a user's signature
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    const cookieStore = await cookies();
    const twitterUser = cookieStore.get('b0ase_twitter_user')?.value;
    const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
    const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;

    if (!user && !twitterUser && !handcashHandle && !walletProvider) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in with a full account to sign documents' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      signature_id,
      document_type,
      document_id,
      document_hash,
      document_title,
      message_signed,
      wallet_signature,
      wallet_address,
      wallet_type,
      inscribe = false,
    } = body;

    // Validation
    if (!signature_id || !document_hash || !message_signed || !wallet_signature || !wallet_address || !wallet_type) {
      return NextResponse.json({
        error: 'Missing required fields: signature_id, document_hash, message_signed, wallet_signature, wallet_address, wallet_type'
      }, { status: 400 });
    }

    // Verify signature exists and belongs to user
    const { data: signature, error: sigError } = await supabase
      .from('user_signatures')
      .select('id, wallet_address, wallet_type')
      .eq('id', signature_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (sigError || !signature) {
      return NextResponse.json({ error: 'Signature not found or inactive' }, { status: 404 });
    }

    // Create document signature record
    const { data: docSignature, error: createError } = await supabase
      .from('document_signatures')
      .insert({
        signer_user_id: user.id,
        signature_id,
        document_type: document_type || 'generic',
        document_id,
        document_hash,
        document_title,
        message_signed,
        wallet_signature,
        wallet_address,
        wallet_type,
        signed_at: new Date().toISOString(),
        status: 'signed',
      })
      .select()
      .single();

    if (createError) {
      console.error('[bitsign/sign] Error creating document signature:', createError);
      return NextResponse.json({ error: 'Failed to record signature' }, { status: 500 });
    }

    // Optionally inscribe on blockchain
    let inscriptionResult = null;
    if (inscribe) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, handle')
          .eq('id', user.id)
          .single();

        inscriptionResult = await inscribeBitSignData({
          type: 'document_signature',
          documentSignatureId: docSignature.id,
          documentHash,
          signatureId: signature_id,
          signerName: profile?.name || profile?.handle || 'Anonymous',
          walletAddress,
          walletType,
          signedAt: docSignature.signed_at,
        });

        // Update with inscription data
        await supabase
          .from('document_signatures')
          .update({
            inscription_txid: inscriptionResult.txid,
            inscription_url: inscriptionResult.blockchainExplorerUrl,
            inscribed_at: new Date().toISOString(),
          })
          .eq('id', docSignature.id);

        docSignature.inscription_txid = inscriptionResult.txid;
        docSignature.inscription_url = inscriptionResult.blockchainExplorerUrl;
      } catch (inscribeError) {
        console.error('[bitsign/sign] Inscription error:', inscribeError);
        // Don't fail the whole request, signature was still recorded
      }
    }

    return NextResponse.json({
      success: true,
      document_signature: docSignature,
      inscription: inscriptionResult ? {
        txid: inscriptionResult.txid,
        url: inscriptionResult.blockchainExplorerUrl,
      } : null,
    }, { status: 201 });
  } catch (error) {
    console.error('[bitsign/sign] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
