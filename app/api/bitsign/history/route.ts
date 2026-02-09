import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET /api/bitsign/history
 * Get the authenticated user's document signing history
 */
export async function GET(request: Request) {
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

    // Non-Supabase users get empty history (data is keyed by Supabase user_id)
    if (!user) {
      return NextResponse.json({
        history: [],
        pagination: { limit: 50, offset: 0, total: 0 },
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const document_type = searchParams.get('document_type');

    let query = supabase
      .from('document_signatures')
      .select(`
        id,
        document_type,
        document_id,
        document_hash,
        document_title,
        wallet_address,
        wallet_type,
        signed_at,
        inscription_txid,
        inscription_url,
        inscribed_at,
        status,
        signature_id
      `)
      .eq('signer_user_id', user.id)
      .order('signed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    const { data: history, error, count } = await query;

    if (error) {
      console.error('[bitsign/history] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    // Get signature details for each entry
    const signatureIds = [...new Set(history?.map(h => h.signature_id) || [])];

    let signatureMap = new Map();
    if (signatureIds.length > 0) {
      const { data: signatures } = await supabase
        .from('user_signatures')
        .select('id, signature_name, signature_type')
        .in('id', signatureIds);
      signatureMap = new Map(signatures?.map(s => [s.id, s]) || []);
    }

    const enrichedHistory = (history || []).map(entry => ({
      ...entry,
      signature: signatureMap.get(entry.signature_id) || null,
    }));

    return NextResponse.json({
      history: enrichedHistory,
      pagination: {
        limit,
        offset,
        total: count || history?.length || 0,
      },
    });
  } catch (error) {
    console.error('[bitsign/history] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
