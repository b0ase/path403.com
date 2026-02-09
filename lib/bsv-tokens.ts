/**
 * BSV-20 Token Transfer Library for b0ase.com
 *
 * Handles BSV-21 (V2) token transfers using js-1sat-ord with @bsv/sdk.
 * Based on implementation from moneybutton2 project.
 */

import { PrivateKey } from '@bsv/sdk';
import {
  transferOrdTokens,
  TokenType,
  TokenInputMode,
  oneSatBroadcaster,
  fetchPayUtxos,
  type TokenUtxo,
  type Utxo
} from 'js-1sat-ord';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const GORILLAPOOL_API = 'https://ordinals.gorillapool.io/api';
const FETCH_TIMEOUT_MS = 30000;

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
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
 * Fetch with retry
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      console.log(`[bsv] Retry ${i + 1}/${retries} after server error...`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`[bsv] Retry ${i + 1}/${retries} after: ${lastError.message}`);
    }

    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Fetch BSV-20 token UTXOs from GorillaPool API
 */
async function fetchBSV20TokenUtxos(address: string, tokenId: string): Promise<TokenUtxo[]> {
  const url = `${GORILLAPOOL_API}/bsv20/${address}/unspent?id=${tokenId}`;
  console.log(`[bsv] Fetching token UTXOs from: ${url}`);

  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch token UTXOs: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[bsv] API returned ${data.length} UTXOs`);

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const utxos: TokenUtxo[] = data.map((item: { txid: string; vout: number; script: string; amt?: string }) => ({
    txid: item.txid,
    vout: item.vout,
    satoshis: 1 as const,
    script: item.script,
    amt: item.amt || '0',
    id: tokenId
  }));

  return utxos;
}

interface UTXO {
  txid: string;
  vout: number;
  satoshis: number;
  script?: string;
}

export interface TransferResult {
  txid: string;
  recipientOutpoint: string;
  changeOutpoint: string | null;
}

/**
 * Fetch UTXOs for an address from WhatsOnChain
 */
export async function getUTXOs(address: string): Promise<UTXO[]> {
  const response = await fetchWithRetry(`${WHATSONCHAIN_API}/address/${address}/unspent`);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }
  const data = await response.json();
  return data.map((u: { tx_hash: string; tx_pos: number; value: number }) => ({
    txid: u.tx_hash,
    vout: u.tx_pos,
    satoshis: u.value
  }));
}

/**
 * Transfer BSV-20 tokens
 */
export async function transferTokens(
  privateKeyWIF: string,
  tokenId: string,
  amount: bigint,
  recipientAddress: string,
  changeAddress: string
): Promise<TransferResult> {

  if (amount <= BigInt(0)) {
    throw new Error('Transfer amount must be positive');
  }

  console.log(`[bsv] Transferring ${amount} tokens (ID: ${tokenId}) to ${recipientAddress}`);

  const ordPk = PrivateKey.fromWif(privateKeyWIF);
  const paymentPk = ordPk;
  const ordAddress = ordPk.toAddress().toString();

  console.log(`[bsv] Ord address: ${ordAddress}`);

  // Fetch token UTXOs
  let inputTokens: TokenUtxo[];
  try {
    inputTokens = await fetchBSV20TokenUtxos(ordAddress, tokenId);
  } catch (error) {
    console.error(`[bsv] Error fetching token UTXOs:`, error);
    throw new Error(`Failed to fetch token UTXOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!inputTokens || inputTokens.length === 0) {
    throw new Error(`No token UTXOs found for ${tokenId} at ${ordAddress}`);
  }

  console.log(`[bsv] Found ${inputTokens.length} token UTXOs`);

  const totalTokensAvailable = inputTokens.reduce((sum, t) => sum + parseFloat(t.amt), 0);
  console.log(`[bsv] Total tokens available: ${totalTokensAvailable}`);

  if (Number(amount) > totalTokensAvailable) {
    throw new Error(`Insufficient tokens on-chain: ${amount} requested, ${totalTokensAvailable} available`);
  }

  const remainingTokens = BigInt(Math.floor(totalTokensAvailable)) - amount;

  // Fetch payment UTXOs
  let paymentUtxos: Utxo[];
  try {
    paymentUtxos = await fetchPayUtxos(ordAddress);
  } catch (error) {
    throw new Error(`Failed to fetch payment UTXOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (paymentUtxos.length === 0) {
    throw new Error(`No payment UTXOs found at ${ordAddress} - need satoshis for fees`);
  }

  const distributions = [
    { address: recipientAddress, tokens: Number(amount) }
  ];

  const config = {
    protocol: TokenType.BSV21,
    tokenID: tokenId,
    utxos: paymentUtxos,
    inputTokens: inputTokens,
    distributions: distributions,
    paymentPk: paymentPk,
    ordPk: ordPk,
    decimals: 0,
    changeAddress: changeAddress,
    tokenInputMode: TokenInputMode.Needed
  };

  console.log(`[bsv] Building transfer transaction...`);

  let result;
  try {
    result = await transferOrdTokens(config);
  } catch (error) {
    throw new Error(`Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  let txHex: string;
  try {
    txHex = result.tx.toHex();
  } catch (hexError) {
    throw new Error(`Failed to serialize transaction: ${hexError instanceof Error ? hexError.message : 'Unknown error'}`);
  }

  // Broadcast - try WhatsOnChain first, fallback to 1sat
  let txid: string | undefined;

  try {
    console.log('[bsv] Broadcasting via WhatsOnChain...');
    txid = await broadcastToWhatsOnChain(txHex);
    console.log(`[bsv] Broadcast successful: ${txid}`);
  } catch (wocError) {
    console.log('[bsv] WhatsOnChain failed, trying 1sat...');
    try {
      const broadcastResult = await result.tx.broadcast(oneSatBroadcaster()) as { status: string; txid?: string; message?: string };
      if (broadcastResult.status === 'success' && broadcastResult.txid) {
        txid = broadcastResult.txid;
      } else {
        throw new Error(broadcastResult.message || 'Unknown error');
      }
    } catch (oneSatErr) {
      throw new Error(`Broadcast failed: ${oneSatErr instanceof Error ? oneSatErr.message : String(oneSatErr)}`);
    }
  }

  if (!txid) {
    throw new Error('Broadcast failed: No txid returned');
  }

  const changeOutpoint = remainingTokens > BigInt(0) ? `${txid}_1` : null;

  return {
    txid,
    recipientOutpoint: `${txid}_0`,
    changeOutpoint
  };
}

/**
 * Broadcast transaction to WhatsOnChain
 */
async function broadcastToWhatsOnChain(txHex: string): Promise<string> {
  const response = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txHex })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsOnChain broadcast failed: ${response.status} - ${errorText}`);
  }

  const txid = await response.json();
  return String(txid).replace(/"/g, '');
}

/**
 * Find current token UTXO by tracing from origin
 */
export async function findCurrentTokenUtxo(originOutpoint: string): Promise<UTXO | null> {
  try {
    const response = await fetchWithRetry(`${GORILLAPOOL_API}/inscriptions/${originOutpoint}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.spend) {
      return findCurrentTokenUtxo(data.spend);
    }

    const [txid, voutStr] = originOutpoint.split('_');
    return {
      txid,
      vout: parseInt(voutStr, 10),
      satoshis: data.satoshis || 1
    };
  } catch (error) {
    console.error(`[bsv] Error finding token UTXO:`, error);
    return null;
  }
}
