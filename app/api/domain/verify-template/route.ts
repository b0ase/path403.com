import { NextRequest, NextResponse } from 'next/server';

// POST /api/domain/verify-template
// Returns payload + suggested inscription template for self-broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, issuer_address, handle, message } = body;

    if (!domain || !issuer_address) {
      return NextResponse.json({
        error: 'domain and issuer_address are required',
      }, { status: 400 });
    }

    const canonicalMessage = message || `path402-domain:${domain}`;
    const issuerHandle = handle || '<handle>';
    const signaturePlaceholder = '<base64_signature>';
    const txPlaceholder = '<bsv_txid>';

    const payload = {
      p: '$402',
      op: 'domain-verify',
      domain,
      issuer_address,
      message: canonicalMessage,
      signature: signaturePlaceholder,
    };

    return NextResponse.json({
      message: canonicalMessage,
      payload,
      inscription: {
        content_type: 'application/json',
        data: payload,
        output: {
          satoshis: 1,
          address: issuer_address,
        },
      },
      well_known: {
        issuer: issuerHandle,
        issuer_address,
        domain_message: canonicalMessage,
        domain_signature_tx_id: txPlaceholder,
        domain_signature: signaturePlaceholder,
      },
      dns_txt: [
        `path402=${issuerHandle}`,
        `issuer_address=${issuer_address}`,
        `domain_message=${canonicalMessage}`,
        `domain_signature_tx_id=${txPlaceholder}`,
        `domain_signature=${signaturePlaceholder}`,
      ],
    });
  } catch (error) {
    console.error('[/api/domain/verify-template] Error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
