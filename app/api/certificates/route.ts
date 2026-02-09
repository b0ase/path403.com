import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { isAdmin } from '@/lib/auth/admin';

/**
 * GET /api/certificates
 * List all certificates
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Check auth
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Strict Admin Check
        const isUserAdmin = await isAdmin(user.id);
        if (!isUserAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const body = await request.json();
        const {
            serial_number,
            shareholder_name,
            share_class,
            share_amount,
            director_signature_id,
        } = body;

        // Validation
        if (!serial_number || !shareholder_name || !share_class || !share_amount || !director_signature_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify signature exists
        const { data: signature } = await supabase
            .from('user_signatures')
            .select('id')
            .eq('id', director_signature_id)
            .single();

        if (!signature) {
            return NextResponse.json({ error: 'Invalid director signature' }, { status: 400 });
        }

        // Hash the certificate data (since we don't have the PDF file on server)
        // We create a deterministic string to represent the certificate content
        const certString = JSON.stringify({
            serial_number,
            shareholder_name,
            share_class,
            share_amount,
            director_signature_id,
            issuer: 'b0ase.com'
        });
        const contentHash = createHash('sha256').update(certString).digest('hex');

        // Insert into DB
        const { data: certificate, error } = await supabase
            .from('certificates')
            .insert({
                serial_number,
                shareholder_name,
                share_class,
                share_amount,
                director_signature_id,
                status: 'active',
                pdf_hash: contentHash,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('[certificates] Error issuing:', error);
            return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 });
        }

        // TODO: Trigger blockchain inscription here if enabled

        return NextResponse.json({ certificate }, { status: 201 });
    } catch (error) {
        console.error('[certificates] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
