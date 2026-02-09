import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET /api/signatures
 * List all signatures for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('API Signatures GET: Auth Error:', authError);
    }

    // Check for any auth method (unified auth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Data is keyed by Supabase user_id


    const { data: signatures, error } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[signatures] Error fetching:', error);
      return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 });
    }

    return NextResponse.json({ signatures: signatures || [] });
  } catch (error) {
    console.error('[signatures] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/signatures
 * Create a new signature
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('API Signatures: Auth Error:', authError);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Non-Supabase users cannot create signatures (requires user_id)


    const body = await request.json();
    const {
      signature_name,
      signature_type,
      svg_data,
      svg_thumbnail,
      image_data,
      typed_text,
      typed_font,
      wallet_type,
      wallet_address,
      verification_message,
      wallet_signature,
      is_default = false,
    } = body;

    // Validation
    if (!signature_type || !['drawn', 'typed', 'upload'].includes(signature_type)) {
      return NextResponse.json(
        { error: 'Invalid signature_type. Must be "drawn", "typed", or "upload"' },
        { status: 400 }
      );
    }

    if (signature_type === 'drawn' && !svg_data) {
      return NextResponse.json({ error: 'svg_data is required for drawn signatures' }, { status: 400 });
    }

    if (signature_type === 'typed' && !typed_text) {
      return NextResponse.json({ error: 'typed_text is required for typed signatures' }, { status: 400 });
    }

    if (signature_type === 'upload' && !image_data) {
      return NextResponse.json({ error: 'image_data is required for uploaded signatures' }, { status: 400 });
    }

    // Create signature
    const { data: signature, error } = await supabase
      .from('user_signatures')
      .insert({
        user_id: user.id,
        signature_name: signature_name || 'Default',
        signature_type,
        svg_data: signature_type === 'drawn' ? svg_data : null,
        svg_thumbnail: signature_type === 'drawn' ? svg_thumbnail : null,
        image_data: signature_type === 'upload' ? image_data : null,
        typed_text: signature_type === 'typed' ? typed_text : null,
        typed_font: signature_type === 'typed' ? (typed_font || 'dancing-script') : null,
        wallet_type,
        wallet_address,
        verification_message,
        wallet_signature,
        is_default,
      })
      .select()
      .single();

    if (error) {
      console.error('[signatures] Error creating:', error);
      return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
    }

    return NextResponse.json({ signature }, { status: 201 });
  } catch (error) {
    console.error('[signatures] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
