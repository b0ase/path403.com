// BSV-20 On-Chain Transfer Implementation
// Creates and broadcasts BSV-20 transfer inscriptions

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bsv = require('bsv');
import { TOKEN_CONFIG } from './types';

const { PrivKey, PubKey, Address, Tx, TxIn, TxOut, Script, Bn, KeyPair, Sig } = bsv;

interface TransferResult {
  success: boolean;
  txId?: string;
  error?: string;
}

// Create a BSV-20 transfer inscription
export function createTransferInscription(
  amount: number
): { inscription: string; data: object } {
  const transferData = {
    p: 'bsv-20',
    op: 'transfer',
    tick: TOKEN_CONFIG.symbol,
    amt: amount.toString(),
  };

  return {
    inscription: JSON.stringify(transferData),
    data: transferData,
  };
}

// Fetch UTXOs for an address
async function fetchUTXOs(address: string): Promise<Array<{
  txid: string;
  vout: number;
  satoshis: number;
  scriptHex: string;
}>> {
  try {
    const response = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.status}`);
    }

    const data = await response.json();

    // Get script for P2PKH address
    const addr = Address.fromString(address);
    const scriptHex = addr.toTxOutScript().toHex();

    return data.map((utxo: { tx_hash: string; tx_pos: number; value: number }) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      satoshis: utxo.value,
      scriptHex,
    }));
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    return [];
  }
}

// Build and sign a BSV-20 transfer transaction using BSV v2 API
export async function createTransferTransaction(
  amount: number,
  toAddress: string,
  privateKeyWIF: string
): Promise<{ txHex: string; txId: string }> {
  // BSV v2 API
  const privKey = PrivKey.fromWif(privateKeyWIF);
  const pubKey = PubKey.fromPrivKey(privKey);
  const fromAddress = Address.fromPubKey(pubKey).toString();

  // Get UTXOs
  const utxos = await fetchUTXOs(fromAddress);

  if (!utxos || utxos.length === 0) {
    throw new Error('No UTXOs available for treasury');
  }

  // Create inscription data
  const { inscription } = createTransferInscription(amount);
  const inscriptionBuffer = Buffer.from(inscription, 'utf8');

  // Build transaction manually with BSV v2
  const tx = new Tx();

  // Add inputs
  let totalInput = 0;
  const usedUtxos: typeof utxos = [];

  for (const utxo of utxos) {
    const txHashBuf = Buffer.from(utxo.txid, 'hex').reverse();
    const txIn = TxIn.fromProperties(txHashBuf, utxo.vout, new Script(), 0xffffffff);
    tx.addTxIn(txIn);
    totalInput += utxo.satoshis;
    usedUtxos.push(utxo);

    if (totalInput >= 1000) break;
  }

  // Calculate fee
  const estimatedSize = 300 + inscriptionBuffer.length;
  const fee = Math.max(estimatedSize, 500);

  if (totalInput < fee + 1) {
    throw new Error(`Insufficient funds: have ${totalInput}, need ${fee + 1}`);
  }

  // Build inscription script (OP_FALSE OP_IF ... OP_ENDIF for ordinals)
  const inscriptionScript = new Script();
  inscriptionScript.writeOpCode(0x00); // OP_FALSE
  inscriptionScript.writeOpCode(0x63); // OP_IF
  inscriptionScript.writeBuffer(Buffer.from('ord', 'utf8'));
  inscriptionScript.writeOpCode(0x01); // Push 1 byte
  inscriptionScript.writeBuffer(Buffer.from('application/bsv-20', 'utf8'));
  inscriptionScript.writeOpCode(0x00); // Push 0
  inscriptionScript.writeBuffer(inscriptionBuffer);
  inscriptionScript.writeOpCode(0x68); // OP_ENDIF

  // Output 1: To recipient with inscription (1 sat)
  const recipientAddress = Address.fromString(toAddress);
  const recipientScript = recipientAddress.toTxOutScript();

  // Combine P2PKH + inscription
  for (const chunk of inscriptionScript.chunks) {
    recipientScript.chunks.push(chunk);
  }

  const txOut1 = TxOut.fromProperties(new Bn(1), recipientScript);
  tx.addTxOut(txOut1);

  // Output 2: Change back to treasury
  const change = totalInput - fee - 1;
  if (change > 546) {
    const changeScript = Address.fromString(fromAddress).toTxOutScript();
    const txOut2 = TxOut.fromProperties(new Bn(change), changeScript);
    tx.addTxOut(txOut2);
  }

  // Sign each input
  const keyPair = KeyPair.fromPrivKey(privKey);
  const hashType = Sig.SIGHASH_ALL | Sig.SIGHASH_FORKID;

  for (let i = 0; i < tx.txIns.length; i++) {
    const utxo = usedUtxos[i];
    const script = Script.fromHex(utxo.scriptHex);
    const valueBn = new Bn(utxo.satoshis);

    // Sign
    const sig = tx.sign(keyPair, hashType, i, script, valueBn);

    // Build input script (signature + pubkey)
    const inputScript = new Script();
    inputScript.writeBuffer(sig.toTxFormat());
    inputScript.writeBuffer(pubKey.toBuffer());
    tx.txIns[i].setScript(inputScript);
  }

  const txHex = tx.toHex();
  const txId = tx.id();

  return { txHex, txId };
}

// Broadcast a transaction
async function broadcastTransaction(txHex: string): Promise<string> {
  const response = await fetch(
    'https://api.whatsonchain.com/v1/bsv/main/tx/raw',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txhex: txHex }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Broadcast failed: ${error}`);
  }

  const txId = await response.text();
  return txId.replace(/"/g, '');
}

// Execute a full BSV-20 transfer
export async function executeTransfer(
  amount: number,
  toAddress: string
): Promise<TransferResult> {
  const privateKeyWIF = process.env.TREASURY_PRIVATE_KEY;

  if (!privateKeyWIF) {
    return {
      success: false,
      error: 'Treasury private key not configured',
    };
  }

  try {
    // Create and sign the transaction
    const { txHex, txId } = await createTransferTransaction(
      amount,
      toAddress,
      privateKeyWIF
    );

    // Broadcast to network
    const broadcastTxId = await broadcastTransaction(txHex);

    console.log(`BSV-20 transfer broadcast: ${broadcastTxId}`);

    return {
      success: true,
      txId: broadcastTxId || txId,
    };
  } catch (error) {
    console.error('BSV-20 transfer failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Check if user has a derived on-chain address
export async function getUserOnChainAddress(): Promise<string | null> {
  return null;
}
