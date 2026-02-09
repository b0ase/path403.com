import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/domain/verify-template
 * 
 * Generates verification templates for the $402 domain tokenization standard.
 * Returns DNS TXT record, .well-known file content, and inscription payload.
 * 
 * Response format matches VerifyTemplateResponse interface in dnsdex.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { domain, handle, issuer_address } = body;

        if (!domain || !handle || !issuer_address) {
            return NextResponse.json(
                { error: 'Missing required fields: domain, handle, issuer_address' },
                { status: 400 }
            );
        }

        // Normalize handle (ensure it starts with $)
        const normalizedHandle = handle.startsWith('$') ? handle : `$${handle}`;

        // Generate verification nonce
        const nonce = crypto.randomBytes(16).toString('hex');
        const timestamp = new Date().toISOString();

        // Create the verification message
        const message = `path402:${domain}:${normalizedHandle}:${issuer_address}:${nonce}`;

        // Placeholder signature (would be real in production)
        const signature = `sig_${crypto.createHash('sha256').update(message).digest('hex').slice(0, 32)}`;
        const signatureTxId = `pending_${nonce.slice(0, 16)}`;

        // DNS TXT Records (array of strings as expected by UI)
        const dns_txt = [
            `path402-verify=${normalizedHandle}:${issuer_address}:${nonce}`,
        ];

        // Well-known file content
        const well_known = {
            issuer: normalizedHandle,
            issuer_address,
            domain_message: message,
            domain_signature_tx_id: signatureTxId,
            domain_signature: signature,
        };

        // Inscription payload
        const inscription = {
            content_type: 'application/json' as const,
            data: {
                p: '$402' as const,
                op: 'domain-verify' as const,
                domain,
                issuer_address,
                message,
                signature,
            },
            output: {
                satoshis: 1,
                address: issuer_address,
            },
        };

        // Response matching VerifyTemplateResponse interface
        return NextResponse.json({
            message: `Verification template for ${domain}`,
            payload: {
                p: '$402',
                op: 'domain-verify',
                domain,
                issuer_address,
                message,
                signature,
            },
            inscription,
            well_known,
            dns_txt,
        });

    } catch (error) {
        console.error('[verify-template] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
