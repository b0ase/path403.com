import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { rawTx, broadcasterType, customEndpoint } = await req.json();

        if (!rawTx) {
            return NextResponse.json(
                { success: false, error: 'Raw transaction hex is required' },
                { status: 400 }
            );
        }

        let endpoint: string;
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        switch (broadcasterType) {
            case 'onesat':
                endpoint = 'https://ordinals.gorillapool.io/api/tx';
                break;
            case 'woc':
                endpoint = 'https://api.whatsonchain.com/v1/bsv/main/tx/raw';
                break;
            case 'custom':
                if (!customEndpoint) {
                    return NextResponse.json(
                        { success: false, error: 'Custom endpoint is required' },
                        { status: 400 }
                    );
                }
                endpoint = customEndpoint;
                break;
            default:
                endpoint = 'https://ordinals.gorillapool.io/api/tx';
        }

        // Broadcast the transaction
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                rawtx: rawTx,
                // Some APIs use different field names
                txhex: rawTx,
            }),
        });

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            // Some APIs return plain txid string
            if (response.ok && responseText.length === 64) {
                data = { txid: responseText };
            } else {
                data = { error: responseText };
            }
        }

        if (response.ok) {
            const txid = data.txid || data.result || data;
            return NextResponse.json({
                success: true,
                txid: typeof txid === 'string' ? txid : JSON.stringify(txid),
            });
        } else {
            return NextResponse.json({
                success: false,
                error: data.error || data.message || 'Broadcast failed',
            });
        }
    } catch (error) {
        console.error('Broadcast error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
