/**
 * BitSign Inscription Library
 *
 * Inscribes BitSign data (signatures and document signings) on BSV blockchain.
 * Extends the b0ase contract inscription protocol for digital signature verification.
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const FETCH_TIMEOUT_MS = 30000;

/**
 * BitSign inscription types
 */
export interface BitSignInscriptionData {
  type: 'signature_registration' | 'document_signature';

  // For signature registration
  signatureId?: string;
  signatureType?: 'drawn' | 'typed';
  signatureHash?: string;
  ownerName?: string;

  // For document signing
  documentSignatureId?: string;
  documentHash?: string;
  signerName?: string;

  // Common fields
  walletAddress?: string;
  walletType?: string;
  createdAt?: string;
  signedAt?: string;
}

/**
 * Result of BitSign inscription
 */
export interface BitSignInscriptionResult {
  txid: string;
  inscriptionUrl: string;
  dataHash: string;
  blockchainExplorerUrl: string;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Fetch UTXOs for an address from WhatsOnChain
 */
async function fetchUtxos(address: string): Promise<any[]> {
  const url = `${WHATSONCHAIN_API}/address/${address}/unspent`;
  console.log(`[bitsign] Fetching UTXOs from: ${url}`);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }

  const utxos = await response.json();
  console.log(`[bitsign] Found ${utxos.length} UTXOs`);
  return utxos;
}

/**
 * Broadcast transaction to BSV network
 */
async function broadcastTransaction(rawTx: string): Promise<string> {
  const url = `${WHATSONCHAIN_API}/tx/raw`;
  console.log(`[bitsign] Broadcasting transaction...`);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txhex: rawTx }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to broadcast transaction: ${response.statusText} - ${errorText}`);
  }

  const txid = await response.text();
  console.log(`[bitsign] Transaction broadcast successfully: ${txid}`);
  return txid.replace(/"/g, '');
}

/**
 * Calculate SHA-256 hash
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate BitSign inscription JSON
 */
function generateBitSignJson(data: BitSignInscriptionData): string {
  const inscriptionData: Record<string, any> = {
    protocol: 'b0ase-bitsign',
    version: '1.0',
    type: data.type,
    timestamp: new Date().toISOString(),
  };

  if (data.type === 'signature_registration') {
    inscriptionData.signatureId = data.signatureId;
    inscriptionData.signatureType = data.signatureType;
    inscriptionData.signatureHash = data.signatureHash;
    inscriptionData.ownerName = data.ownerName;
    inscriptionData.walletAddress = data.walletAddress;
    inscriptionData.walletType = data.walletType;
    inscriptionData.createdAt = data.createdAt;
  } else if (data.type === 'document_signature') {
    inscriptionData.documentSignatureId = data.documentSignatureId;
    inscriptionData.documentHash = data.documentHash;
    inscriptionData.signatureId = data.signatureId;
    inscriptionData.signerName = data.signerName;
    inscriptionData.signerWallet = data.walletAddress;
    inscriptionData.walletType = data.walletType;
    inscriptionData.signedAt = data.signedAt;
  }

  return JSON.stringify(inscriptionData, null, 2);
}

/**
 * Inscribe BitSign data on BSV blockchain
 *
 * Creates an OP_RETURN transaction with BitSign protocol data.
 */
export async function inscribeBitSignData(
  data: BitSignInscriptionData,
  privateKeyWif?: string
): Promise<BitSignInscriptionResult> {
  try {
    // Generate inscription JSON
    const inscriptionJson = generateBitSignJson(data);
    const dataHash = await hashData(inscriptionJson);

    console.log(`[bitsign] Inscription type: ${data.type}`);
    console.log(`[bitsign] Data hash: ${dataHash}`);
    console.log(`[bitsign] Data size: ${inscriptionJson.length} bytes`);

    // Use platform private key if not provided
    // Uses MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY - the platform's BSV wallet for inscriptions
    const wif = privateKeyWif || process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;
    if (!wif) {
      throw new Error('BOASE_TREASURY_PRIVATE_KEY not configured');
    }

    // Create private key
    const privateKey = PrivateKey.fromWif(wif);
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();

    console.log(`[bitsign] Inscribing from address: ${address}`);

    // Fetch UTXOs
    const utxos = await fetchUtxos(address);
    if (utxos.length === 0) {
      throw new Error('No UTXOs found for inscription. Please fund the address.');
    }

    // Create transaction
    const tx = new Transaction();

    // Add inputs (use first UTXO)
    const utxo = utxos[0];
    tx.addInput({
      sourceTXID: utxo.tx_hash,
      sourceOutputIndex: utxo.tx_pos,
      unlockingScriptTemplate: new P2PKH().unlock(privateKey),
    });

    // Create OP_RETURN script with BitSign data
    const protocol = Buffer.from('b0ase-bitsign', 'utf8');
    const contentType = Buffer.from('application/json', 'utf8');
    const inscriptionData = Buffer.from(inscriptionJson, 'utf8');

    const opReturnScript = new Script();
    opReturnScript.writeOpCode(106); // OP_RETURN
    opReturnScript.writeData(protocol);
    opReturnScript.writeData(contentType);
    opReturnScript.writeData(inscriptionData);

    // Add OP_RETURN output (1 satoshi for ordinal)
    tx.addOutput({
      lockingScript: opReturnScript,
      satoshis: 1,
    });

    // Calculate change
    const minerFee = 500;
    const ordinalFee = 1;
    const inputSatoshis = utxo.value;
    const changeSatoshis = inputSatoshis - minerFee - ordinalFee;

    if (changeSatoshis < 0) {
      throw new Error('Insufficient satoshis for inscription');
    }

    // Add change output
    if (changeSatoshis > 0) {
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: changeSatoshis,
      });
    }

    // Sign transaction
    await tx.sign();

    // Broadcast transaction
    const rawTx = tx.toHex();
    const txid = await broadcastTransaction(rawTx);

    console.log(`[bitsign] Inscription successful: ${txid}`);

    return {
      txid,
      inscriptionUrl: `${WHATSONCHAIN_API}/tx/${txid}`,
      dataHash,
      blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`,
    };
  } catch (error) {
    console.error('[bitsign] Inscription error:', error);
    throw error;
  }
}

/**
 * Verify BitSign inscription on blockchain
 */
export async function verifyBitSignInscription(txid: string): Promise<{
  found: boolean;
  data?: BitSignInscriptionData;
  dataHash?: string;
}> {
  try {
    const url = `${WHATSONCHAIN_API}/tx/${txid}/hex`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return { found: false };
    }

    const txHex = await response.text();
    const tx = Transaction.fromHex(txHex);

    // Look for OP_RETURN output with BitSign protocol
    for (const output of tx.outputs) {
      const script = output.lockingScript;
      const chunks = script.chunks;

      // Check if OP_RETURN
      if (chunks.length > 0 && chunks[0].op === 106) {
        // Check protocol identifier
        if (chunks.length >= 4) {
          const protocol = chunks[1].data?.toString('utf8');
          if (protocol === 'b0ase-bitsign') {
            const jsonData = chunks[3].data?.toString('utf8');
            if (jsonData) {
              const data = JSON.parse(jsonData) as BitSignInscriptionData;
              const dataHash = await hashData(jsonData);
              return {
                found: true,
                data,
                dataHash,
              };
            }
          }
        }
      }
    }

    return { found: false };
  } catch (error) {
    console.error('[bitsign] Verify error:', error);
    return { found: false };
  }
}

/**
 * Generate signing message for BitSign
 */
export function generateSigningMessage(params: {
  documentTitle?: string;
  documentHash: string;
  signerName?: string;
  walletAddress: string;
  timestamp?: string;
}): string {
  const timestamp = params.timestamp || new Date().toISOString();
  const nonce = crypto.randomUUID();

  return `BitSign Document Signature
==========================
Document: ${params.documentTitle || 'Untitled Document'}
Hash: ${params.documentHash}
Signer: ${params.signerName || 'Anonymous'}
Wallet: ${params.walletAddress}
Time: ${timestamp}
Nonce: ${nonce}

By signing, I confirm I have reviewed and agree to this document.`;
}
