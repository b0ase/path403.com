
import { NextRequest, NextResponse } from 'next/server';
import { encryptChat } from '@/lib/kintsugi-crypto';
import { inscribeChatSnippet } from '@/lib/kintsugi-inscribe';

export async function POST(req: NextRequest) {
    try {
        const { sessionId, content, prevTxid, sessionCode } = await req.json();

        if (!sessionId || !content || !sessionCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // For now, we use the sessionCode as the direct secret for simplicity
        // in Phase 4 we can use a derived wallet secret.
        const secret = sessionCode;

        // 1. Encrypt Content
        const encryptedContent = await encryptChat(content, secret);

        // 2. Inscribe on Blockchain
        const result = await inscribeChatSnippet({
            sessionId,
            prevTxid: prevTxid || null,
            encryptedContent
        });

        return NextResponse.json({
            success: true,
            txid: result.txid,
            inscriptionId: result.inscriptionId,
            url: result.blockchainExplorerUrl
        });

    } catch (error: any) {
        console.error('Inscription Error:', error);

        // If it's a private key error, we wrap it to be more helpful for the UI
        if (error.message?.includes('private key not found')) {
            return NextResponse.json({
                error: 'Platform inscription key not configured. Please connect a Yours wallet to sign this inscription manually.',
                code: 'WALLET_SIGN_REQUIRED'
            }, { status: 403 });
        }

        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
