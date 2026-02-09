
/**
 * Deploy $402 PoW-20 Protocol
 * 
 * Uses @bsv/sdk to inscribe the Genesis "deploy" operation.
 * 
 * Run: npx tsx scripts/deploy-402-pow.ts
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const TREASURY_KEY = process.env.BOASE_TREASURY_PRIVATE_KEY ||
    process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY ||
    process.env.TREASURY_PRIVATE_KEY;

// The "Constitution" of the $402 Economy
const POW20_DEPLOYMENT = {
    p: "pow-20",
    op: "deploy",
    tick: "402",
    max: "21000000",
    lim: "1000",
    diff: "5",       // Start with 5 leading zeros
    work: "sha256"   // SHA256(SHA256(tick+address+block+nonce))
};

async function broadcast(txHex: string): Promise<string> {
    const res = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txhex: txHex })
    });
    if (!res.ok) throw new Error(await res.text());
    const txid = await res.text();
    return txid.replace(/"/g, '');
}

async function fetchUtxos(address: string) {
    const res = await fetch(`${WHATSONCHAIN_API}/address/${address}/unspent`);
    return res.json();
}

async function start() {
    if (!TREASURY_KEY) {
        console.error('❌ Missing TREASURY_PRIVATE_KEY (BOASE or generic)');
        process.exit(1);
    }

    const privKey = PrivateKey.fromWif(TREASURY_KEY);
    const address = privKey.toPublicKey().toAddress().toString();

    console.log('🚀 Deploying $402 PoW-20...');
    console.log('Deployer:', address);
    console.log('Config:', JSON.stringify(POW20_DEPLOYMENT, null, 2));

    // 1. Get UTXOs
    const utxos = await fetchUtxos(address);
    if (!utxos.length) throw new Error('No funds in ' + address);
    const utxo = utxos[0];
    console.log('Using UTXO:', utxo.tx_hash, 'pos:', utxo.tx_pos, 'value:', utxo.value);

    if (utxo.value === undefined) throw new Error("UTXO value is missing");

    // 2. Prepare JSON
    const json = JSON.stringify(POW20_DEPLOYMENT);

    // 3. Build Tx
    const tx = new Transaction();

    // FIX: Provide a mock source transaction with CORRECT locking script
    // SIGHASH checks the script code of the input being signed.
    const mockSourceTx = new Transaction();
    const utxoScript = new P2PKH().lock(address); // <--- This matches our address

    // Add dummy outputs until we reach the index
    for (let i = 0; i <= utxo.tx_pos; i++) {
        mockSourceTx.addOutput({
            lockingScript: i === utxo.tx_pos ? utxoScript : new Script(),
            satoshis: i === utxo.tx_pos ? utxo.value : 1
        });
    }

    tx.addInput({
        sourceTXID: utxo.tx_hash,
        sourceOutputIndex: utxo.tx_pos,
        unlockingScriptTemplate: new P2PKH().unlock(privKey),
        sourceTransaction: mockSourceTx
    });

    // 4. Build Output with 1Sat Ordinal Inscription

    // Generate standard P2PKH script first
    const p2pkhScript = new P2PKH().lock(address);
    const inscriptionScript = new Script();

    // Copy P2PKH parts by DIRECT chunk manipulation
    if (p2pkhScript.chunks) {
        for (const chunk of p2pkhScript.chunks) {
            inscriptionScript.chunks.push(chunk);
        }
    }

    // Append Inscription Envelope (1Sat Ordinal)
    inscriptionScript.chunks.push({ op: 0 });  // OP_FALSE
    inscriptionScript.chunks.push({ op: 99 }); // OP_IF (0x63)
    inscriptionScript.chunks.push({ data: Array.from(Buffer.from("ord", "utf8")) });
    inscriptionScript.chunks.push({ op: 1 });  // OP_1
    inscriptionScript.chunks.push({ data: Array.from(Buffer.from("application/json", "utf8")) });
    inscriptionScript.chunks.push({ op: 0 });  // OP_0
    inscriptionScript.chunks.push({ data: Array.from(Buffer.from(json, "utf8")) });
    inscriptionScript.chunks.push({ op: 104 }); // OP_ENDIF (0x68)

    tx.addOutput({
        lockingScript: inscriptionScript,
        satoshis: 1
    });

    // 5. Change Output
    const fee = 500;
    const change = utxo.value - 1 - fee;
    if (change > 0) {
        tx.addOutput({
            lockingScript: new P2PKH().lock(address),
            satoshis: change
        });
    }

    await tx.sign();
    const txHex = tx.toHex();

    console.log('Broadcasting...');
    const txid = await broadcast(txHex);
    console.log('✅ DEPLOYED:', txid);
    console.log(`https://whatsonchain.com/tx/${txid}`);

    console.log('\n--- NEXT STEPS ---');
    console.log('The $402 token is now live.');
}

start();
