import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Note: For security, token transfers should be done client-side
    // This endpoint is a placeholder that explains the proper approach

    try {
        const body = await req.json();
        const { tokenId, amount, recipientAddress } = body;

        // Validate inputs (don't accept private key on server)
        if (!tokenId || !amount || !recipientAddress) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: tokenId, amount, recipientAddress' },
                { status: 400 }
            );
        }

        // Validate BSV address format (basic check)
        if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(recipientAddress)) {
            return NextResponse.json(
                { success: false, error: 'Invalid recipient BSV address format' },
                { status: 400 }
            );
        }

        // For security reasons, we don't accept private keys on the server
        // Token transfers should be done client-side using:
        // @bitcoin-apps-suite/transaction-broadcaster

        return NextResponse.json({
            success: false,
            error: 'Token transfer requires client-side signing. Use the @bitcoin-apps-suite/transaction-broadcaster library directly in the browser.',
            instructions: {
                step1: 'Install: pnpm add @bitcoin-apps-suite/transaction-broadcaster',
                step2: 'Import BSV21Transfer from the library',
                step3: 'Create transfer instance with tokenId and privateKey',
                step4: 'Call send() with recipientAddress and amount',
                step5: 'The library will sign and broadcast the transaction',
                documentation: 'https://www.npmjs.com/package/@bitcoin-apps-suite/transaction-broadcaster',
            },
            validatedConfig: {
                tokenId,
                amount,
                recipientAddress,
            },
        });
    } catch (error) {
        console.error('Transfer error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
