import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/signatures/[id]
 * Get a specific signature
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    const { data: signature, error } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !signature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('[signatures] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/signatures/[id]
 * Update a signature
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    // Verify ownership
    const { data: existing } = await supabase
      .from('user_signatures')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      'signature_name',
      'svg_data',
      'svg_thumbnail',
      'typed_text',
      'typed_font',
      'wallet_type',
      'wallet_address',
      'verification_message',
      'wallet_signature',
      'is_default',
      'is_active',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: signature, error } = await supabase
      .from('user_signatures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[signatures] Error updating:', error);
      return NextResponse.json({ error: 'Failed to update signature' }, { status: 500 });
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('[signatures] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/signatures/[id]
 * Soft delete a signature (mark as inactive)
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for any auth method (unified auth)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    // Soft delete (mark as inactive)
    const { error } = await supabase
      .from('user_signatures')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[signatures] Error deleting:', error);
      return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[signatures] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
