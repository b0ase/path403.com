import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

/**
 * POST /api/domain/verify
 * 
 * Verifies the 3-proof bundle for domain ownership:
 * 1. DNS TXT record at _path402.<domain>
 * 2. /.well-known/path402.json file
 * 3. On-chain inscription (placeholder for now)
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

        const normalizedHandle = handle.startsWith('$') ? handle : `$${handle}`;

        // Results for each proof
        const results = {
            ok: false,
            dns: { ok: false } as any,
            http: { ok: false } as any,
            onchain: { ok: false } as any,
        };

        // 1. Check DNS TXT record
        try {
            const records = await resolveTxt(`_path402.${domain}`);
            const flatRecords = records.flat();
            const matchingRecord = flatRecords.find(r =>
                r.includes('path402-verify=') &&
                r.includes(normalizedHandle)
            );

            if (matchingRecord) {
                results.dns = {
                    ok: true,
                    record: matchingRecord,
                    domain_message: matchingRecord,
                };
            } else {
                results.dns = {
                    ok: false,
                    error: 'No matching TXT record found',
                    found: flatRecords,
                };
            }
        } catch (dnsError: any) {
            results.dns = {
                ok: false,
                error: dnsError.code === 'ENOTFOUND' ? 'No TXT records found' : dnsError.message,
            };
        }

        // 2. Check .well-known/path402.json
        try {
            const wellKnownUrl = `https://${domain}/.well-known/path402.json`;
            const response = await fetch(wellKnownUrl, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 0 }, // No cache
            });

            if (response.ok) {
                const data = await response.json();
                if (data.issuer === normalizedHandle || data.issuer_address === issuer_address) {
                    results.http = {
                        ok: true,
                        data,
                        domain_signature: data.domain_signature,
                        domain_signature_tx_id: data.domain_signature_tx_id,
                    };
                } else {
                    results.http = {
                        ok: false,
                        error: 'Issuer mismatch',
                        expected: normalizedHandle,
                        found: data.issuer,
                    };
                }
            } else {
                results.http = {
                    ok: false,
                    error: `HTTP ${response.status}`,
                };
            }
        } catch (httpError: any) {
            results.http = {
                ok: false,
                error: httpError.message,
            };
        }

        // 3. Check on-chain inscription (placeholder - would query BSV blockchain)
        // For now, auto-pass if DNS and HTTP pass
        if (results.dns.ok && results.http.ok) {
            results.onchain = {
                ok: true,
                note: 'Inscription pending - will be created on verification complete',
            };
        } else {
            results.onchain = {
                ok: false,
                error: 'DNS and HTTP must pass first',
            };
        }

        // Overall result
        results.ok = results.dns.ok && results.http.ok && results.onchain.ok;

        return NextResponse.json(results);

    } catch (error) {
        console.error('[domain/verify] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
