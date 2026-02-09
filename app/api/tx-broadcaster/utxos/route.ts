import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');
        const tokenId = searchParams.get('tokenId');

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Address is required' },
                { status: 400 }
            );
        }

        // Validate BSV address format (basic check)
        if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
            return NextResponse.json(
                { success: false, error: 'Invalid BSV address format' },
                { status: 400 }
            );
        }

        let utxos: any[] = [];

        if (tokenId) {
            // Fetch token UTXOs from 1Sat API
            const response = await fetch(
                `https://ordinals.gorillapool.io/api/bsv20/${address}/balance?id=${encodeURIComponent(tokenId)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch token UTXOs');
            }

            const data = await response.json();

            // Also fetch the actual token UTXOs
            const utxoResponse = await fetch(
                `https://ordinals.gorillapool.io/api/txos/address/${address}/unspent?bsv20=true`
            );

            if (utxoResponse.ok) {
                const utxoData = await utxoResponse.json();
                utxos = utxoData.filter((u: any) =>
                    u.data?.bsv20?.id === tokenId ||
                    u.origin?.data?.bsv20?.id === tokenId
                ).map((u: any) => ({
                    txid: u.txid,
                    vout: u.vout,
                    satoshis: u.satoshis,
                    script: u.script,
                    amt: u.data?.bsv20?.amt || u.origin?.data?.bsv20?.amt,
                }));
            }
        } else {
            // Fetch payment UTXOs from WhatsOnChain
            const response = await fetch(
                `https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch UTXOs');
            }

            const data = await response.json();
            utxos = data.map((u: any) => ({
                txid: u.tx_hash,
                vout: u.tx_pos,
                satoshis: u.value,
            }));
        }

        return NextResponse.json({
            success: true,
            address,
            tokenId: tokenId || null,
            utxos,
            count: utxos.length,
            totalSatoshis: utxos.reduce((sum: number, u: any) => sum + (u.satoshis || 0), 0),
        });
    } catch (error) {
        console.error('UTXO fetch error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
