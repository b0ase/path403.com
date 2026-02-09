import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/certificates/[id]
 * Public endpoint to fetch certificate details for verification
 */
export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();

        // Note: We intentionally do NOT check for user session here.
        // Certificate verification is a public action.

        const { data: certificate, error } = await supabase
            .from('certificates')
            .select(`
        *,
        user_signatures (
          id,
          signature_name,
          signature_type,
          svg_data,
          image_data,
          typed_text,
          typed_font,
          wallet_address
        )
      `)
            .eq('id', id)
            .single();

        if (error || !certificate) {
            // Try finding by serial number if ID lookup fails
            const { data: bySerial, error: serialError } = await supabase
                .from('certificates')
                .select(`
          *,
          user_signatures (
            id,
            signature_name,
            signature_type,
            svg_data,
            image_data,
            typed_text,
            typed_font,
            wallet_address
          )
        `)
                .eq('serial_number', id) // Allow ID param to be serial number too
                .single();

            if (serialError || !bySerial) {
                return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
            }

            return NextResponse.json({ certificate: bySerial });
        }

        return NextResponse.json({ certificate });
    } catch (error) {
        console.error('[certificates/verify] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
