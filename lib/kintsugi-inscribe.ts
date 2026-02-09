
/**
 * Kintsugi Chat Inscription Library
 * Handles sequential inscriptions of encrypted chat logs on BSV.
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const PROTOCOL_ID = 'kintsugi-chat';

export interface KintsugiInscriptionData {
    sessionId: string;
    prevTxid: string | null;
    encryptedContent: string;
}

export interface InscriptionResult {
    txid: string;
    inscriptionId: string;
    blockchainExplorerUrl: string;
}

/**
 * Broadcast transaction to BSV network
 */
async function broadcastTransaction(rawTx: string): Promise<string> {
    const url = `${WHATSONCHAIN_API}/tx/raw`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txhex: rawTx }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Broadcast failed: ${response.statusText} - ${errorText}`);
    }

    const txid = await response.text();
    return txid.replace(/"/g, '');
}

/**
 * Fetch UTXOs for an address
 */
async function fetchUtxos(address: string): Promise<any[]> {
    const url = `${WHATSONCHAIN_API}/address/${address}/unspent`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch UTXOs');
    return await response.json();
}

/**
 * Inscribes an encrypted chat snippet on the BSV blockchain.
 */
export async function inscribeChatSnippet(
    data: KintsugiInscriptionData,
    privateKeyWif?: string
): Promise<InscriptionResult> {
    // Use Kintsugi's own treasury for inscriptions (separate from BOASE)
    const wif = privateKeyWif
      || process.env.KINTSUGI_TREASURY_PRIVATE_KEY
      || process.env.BOASE_TREASURY_PRIVATE_KEY;
    if (!wif) throw new Error('KINTSUGI_TREASURY_PRIVATE_KEY not configured');

    const privateKey = PrivateKey.fromWif(wif);
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();

    const utxos = await fetchUtxos(address);
    if (utxos.length === 0) throw new Error('No UTXOs found. Please fund the address.');

    const tx = new Transaction();
    const utxo = utxos[0];

    tx.addInput({
        sourceTXID: utxo.tx_hash,
        sourceOutputIndex: utxo.tx_pos,
        unlockingScriptTemplate: new P2PKH().unlock(privateKey),
    });

    // Prepare Inscription Document
    const document = JSON.stringify({
        p: PROTOCOL_ID,
        v: '1.0',
        sid: data.sessionId,
        prev: data.prevTxid,
        data: data.encryptedContent,
        ts: new Date().toISOString()
    });

    const opReturnScript = new Script() as any;
    opReturnScript.writeOpCode(106); // OP_RETURN
    opReturnScript.writeData(Buffer.from(PROTOCOL_ID, 'utf8'));
    opReturnScript.writeData(Buffer.from('application/json', 'utf8'));
    opReturnScript.writeData(Buffer.from(document, 'utf8'));

    tx.addOutput({
        lockingScript: opReturnScript,
        satoshis: 0,
    });

    // Calculate fees (approx 0.5 sat/byte)
    const estimatedSize = document.length + 200;
    const minerFee = Math.max(500, Math.ceil(estimatedSize * 0.5));
    const changeSatoshis = utxo.value - minerFee;

    if (changeSatoshis < 0) throw new Error('Insufficient funds for fee');

    if (changeSatoshis > 0) {
        tx.addOutput({
            lockingScript: new P2PKH().lock(address),
            satoshis: changeSatoshis,
        });
    }

    await tx.sign();
    const txid = await broadcastTransaction(tx.toHex());

    return {
        txid,
        inscriptionId: `${txid}_0`,
        blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`
    };
}
