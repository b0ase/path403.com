import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteContext {
  params: Promise<{ hash: string }>;
}

/**
 * GET /api/bitsign/verify/[hash]
 * Verify a document signature by document hash
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { hash } = await context.params;

    if (!hash || hash.length < 32) {
      return NextResponse.json({ error: 'Invalid document hash' }, { status: 400 });
    }

    // Find all signatures for this document hash
    const { data: signatures, error } = await supabase
      .from('document_signatures')
      .select(`
        id,
        document_type,
        document_id,
        document_hash,
        document_title,
        message_signed,
        wallet_signature,
        wallet_address,
        wallet_type,
        signed_at,
        inscription_txid,
        inscription_url,
        inscribed_at,
        status,
        signer_user_id
      `)
      .eq('document_hash', hash)
      .eq('status', 'signed')
      .order('signed_at', { ascending: false });

    if (error) {
      console.error('[bitsign/verify] Error:', error);
      return NextResponse.json({ error: 'Failed to verify document' }, { status: 500 });
    }

    if (!signatures || signatures.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'No signatures found for this document hash',
        document_hash: hash,
        signatures: [],
      });
    }

    // Get signer profiles (public info only)
    const signerIds = [...new Set(signatures.map(s => s.signer_user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url')
      .in('id', signerIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Enrich signatures with signer info
    const enrichedSignatures = signatures.map(sig => ({
      id: sig.id,
      signer: {
        name: profileMap.get(sig.signer_user_id)?.name || 'Anonymous',
        handle: profileMap.get(sig.signer_user_id)?.handle,
        avatar_url: profileMap.get(sig.signer_user_id)?.avatar_url,
      },
      wallet_address: sig.wallet_address,
      wallet_type: sig.wallet_type,
      signed_at: sig.signed_at,
      inscription: sig.inscription_txid ? {
        txid: sig.inscription_txid,
        url: sig.inscription_url,
        inscribed_at: sig.inscribed_at,
      } : null,
    }));

    return NextResponse.json({
      verified: true,
      document_hash: hash,
      document_title: signatures[0].document_title,
      document_type: signatures[0].document_type,
      signature_count: signatures.length,
      signatures: enrichedSignatures,
      first_signed_at: signatures[signatures.length - 1].signed_at,
      last_signed_at: signatures[0].signed_at,
    });
  } catch (error) {
    console.error('[bitsign/verify] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
