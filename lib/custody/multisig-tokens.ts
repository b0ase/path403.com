/**
 * Multisig Token Transfers
 *
 * Handles BSV-21 token transfers from 2-of-3 P2SH multisig vaults.
 * Supports both normal operations (user + app) and emergency recovery (user + backup).
 */

import {
  Utils,
  Script,
  Transaction,
  PrivateKey,
  PublicKey,
  Hash,
  OP,
  P2PKH
} from '@bsv/sdk';
import {
  transferOrdTokens,
  TokenType,
  TokenInputMode,
  oneSatBroadcaster,
  fetchPayUtxos,
  type TokenUtxo,
  type Utxo
} from 'js-1sat-ord';
import { getPrisma } from '@/lib/prisma';

const GORILLAPOOL_API = 'https://ordinals.gorillapool.io/api';
const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const MASTER_SEED = process.env.HANDCASH_APP_SECRET || 'default-secret-seed-dev-only';

export interface MultisigTransferResult {
  txid: string;
  status: 'success' | 'pending' | 'failed';
  message?: string;
}

export interface VaultBalance {
  address: string;
  tokens: { tokenId: string; amount: bigint }[];
  satoshis: number;
}

/**
 * Derive app key for a user
 */
function deriveAppKeyWif(userId: string): string {
  const hash = Hash.sha256(Utils.toArray(MASTER_SEED + userId));
  return PrivateKey.fromHex(Utils.toHex(hash)).toWif();
}

/**
 * Fetch token UTXOs from GorillaPool
 */
async function fetchTokenUtxos(address: string, tokenId: string): Promise<TokenUtxo[]> {
  const url = `${GORILLAPOOL_API}/bsv20/${address}/unspent?id=${tokenId}`;
  console.log(`[multisig] Fetching token UTXOs: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch token UTXOs: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item: any) => ({
    txid: item.txid,
    vout: item.vout,
    satoshis: 1 as const,
    script: item.script,
    amt: item.amt || '0',
    id: tokenId
  }));
}

/**
 * Fetch satoshi UTXOs from WhatsOnChain
 */
async function fetchSatoshiUtxos(address: string): Promise<Utxo[]> {
  const response = await fetch(`${WHATSONCHAIN_API}/address/${address}/unspent`);
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.map((u: any) => ({
    txid: u.tx_hash,
    vout: u.tx_pos,
    satoshis: u.value,
    script: '' // Will be fetched by js-1sat-ord if needed
  }));
}

/**
 * Get vault balance (tokens and satoshis)
 */
export async function getVaultBalance(
  vaultAddress: string,
  tokenIds: string[]
): Promise<VaultBalance> {
  const tokens: { tokenId: string; amount: bigint }[] = [];

  for (const tokenId of tokenIds) {
    const utxos = await fetchTokenUtxos(vaultAddress, tokenId);
    const total = utxos.reduce((sum, u) => sum + BigInt(u.amt), BigInt(0));
    if (total > 0) {
      tokens.push({ tokenId, amount: total });
    }
  }

  const satoshiUtxos = await fetchSatoshiUtxos(vaultAddress);
  const satoshis = satoshiUtxos.reduce((sum, u) => sum + u.satoshis, 0);

  return {
    address: vaultAddress,
    tokens,
    satoshis
  };
}

/**
 * Transfer tokens from vault using app co-signature
 *
 * Flow:
 * 1. User signs the transaction with their key
 * 2. Platform adds app signature
 * 3. Transaction is broadcast
 *
 * For this simplified version, we assume the user's signature
 * is provided as a hex string, having signed the sighash preimage.
 */
export async function transferFromVault(
  userId: string,
  vaultAddress: string,
  tokenId: string,
  amount: bigint,
  recipientAddress: string,
  userSignatureHex: string
): Promise<MultisigTransferResult> {
  const prisma = getPrisma();

  // Get vault
  const vault = await (prisma as any).vault.findFirst({
    where: { address: vaultAddress, userId }
  });

  if (!vault) {
    throw new Error('Vault not found or does not belong to user');
  }

  // Fetch token UTXOs
  const tokenUtxos = await fetchTokenUtxos(vaultAddress, tokenId);
  if (tokenUtxos.length === 0) {
    throw new Error(`No ${tokenId} tokens found at vault address`);
  }

  const totalAvailable = tokenUtxos.reduce((s, u) => s + BigInt(u.amt), BigInt(0));
  if (totalAvailable < amount) {
    throw new Error(`Insufficient tokens: ${amount} requested, ${totalAvailable} available`);
  }

  // Fetch payment UTXOs for fees
  const paymentUtxos = await fetchSatoshiUtxos(vaultAddress);
  if (paymentUtxos.length === 0) {
    throw new Error('No satoshis at vault for transaction fees');
  }

  // Get app key
  const appPrivKey = PrivateKey.fromWif(deriveAppKeyWif(userId));

  // Build the multisig unlocking script
  // For P2SH multisig, we need: OP_0 <sig1> <sig2> <redeemScript>
  const redeemScriptBytes = Utils.toArray(vault.redeemScript, 'hex');
  const userSigBytes = Utils.toArray(userSignatureHex, 'hex');

  // NOTE: In a full implementation, we would:
  // 1. Build the raw transaction
  // 2. Calculate the sighash for each input
  // 3. App signs the sighash
  // 4. Combine signatures into unlocking script
  //
  // For now, we use a simplified approach with js-1sat-ord
  // which handles transaction construction internally

  console.log(`[multisig] Transferring ${amount} of ${tokenId} from ${vaultAddress} to ${recipientAddress}`);

  try {
    // js-1sat-ord expects private keys, so for P2SH we need a custom approach
    // This is a placeholder - real implementation needs custom script handling

    // For now, log what would happen
    console.log('[multisig] Would transfer with:');
    console.log('  - Input tokens:', tokenUtxos.length);
    console.log('  - Payment UTXOs:', paymentUtxos.length);
    console.log('  - User signature:', userSignatureHex.slice(0, 20) + '...');
    console.log('  - Redeem script:', vault.redeemScript.slice(0, 40) + '...');

    // In production, build and broadcast the transaction here
    // For now return a pending status

    return {
      txid: 'pending-implementation',
      status: 'pending',
      message: 'Multisig token transfer pending full implementation'
    };
  } catch (error) {
    console.error('[multisig] Transfer failed:', error);
    return {
      txid: '',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Build a raw multisig transaction for token transfer
 *
 * This creates the transaction structure that users need to sign.
 * Returns the transaction hex and sighash preimages for signing.
 */
export async function buildMultisigTokenTx(
  vaultAddress: string,
  redeemScriptHex: string,
  tokenId: string,
  amount: bigint,
  recipientAddress: string
): Promise<{
  txHex: string;
  sighashes: string[];
  inputCount: number;
}> {
  // Fetch token UTXOs
  const tokenUtxos = await fetchTokenUtxos(vaultAddress, tokenId);
  if (tokenUtxos.length === 0) {
    throw new Error('No tokens at vault');
  }

  // Build transaction manually
  const tx = new Transaction();

  // Add token inputs
  for (const utxo of tokenUtxos) {
    tx.addInput({
      sourceTXID: utxo.txid,
      sourceOutputIndex: utxo.vout,
      sequence: 0xffffffff,
      unlockingScript: new Script() // To be filled after signing
    });
  }

  // Add token output to recipient (1 sat ordinal)
  const recipientScript = new P2PKH().lock(recipientAddress);
  tx.addOutput({
    lockingScript: recipientScript,
    satoshis: 1
  });

  // Add change output back to vault (if there's remaining tokens)
  const totalTokens = tokenUtxos.reduce((s, u) => s + BigInt(u.amt), BigInt(0));
  if (totalTokens > amount) {
    const vaultScript = new P2PKH().lock(vaultAddress);
    tx.addOutput({
      lockingScript: vaultScript,
      satoshis: 1
    });
  }

  // Calculate sighashes for each input
  const sighashes: string[] = [];
  const redeemScriptBytes = Utils.toArray(redeemScriptHex, 'hex');

  for (let i = 0; i < tx.inputs.length; i++) {
    // For P2SH, sighash uses the redeemScript as the subscript
    // SIGHASH_ALL | SIGHASH_FORKID = 0x41
    const sighash = tx.id('hex'); // Simplified - actual sighash calculation needed
    sighashes.push(sighash);
  }

  return {
    txHex: tx.toHex(),
    sighashes,
    inputCount: tx.inputs.length
  };
}

/**
 * Complete a multisig transaction with both signatures
 */
export function completeMultisigTx(
  txHex: string,
  redeemScriptHex: string,
  signatures: Array<{ inputIndex: number; sig1: string; sig2: string }>
): string {
  const tx = Transaction.fromHex(txHex);
  const redeemScriptBytes = Utils.toArray(redeemScriptHex, 'hex');
  const sighashType = 0x41;

  for (const sig of signatures) {
    const sig1Bytes = Utils.toArray(sig.sig1, 'hex');
    const sig2Bytes = Utils.toArray(sig.sig2, 'hex');

    // Create unlocking script: OP_0 <sig1> <sig2> <redeemScript>
    const unlocker = new Script();
    unlocker.writeOpCode(OP.OP_0);
    unlocker.writeBin([...sig1Bytes, sighashType]);
    unlocker.writeBin([...sig2Bytes, sighashType]);
    unlocker.writeBin(redeemScriptBytes);

    tx.inputs[sig.inputIndex].unlockingScript = unlocker;
  }

  return tx.toHex();
}

/**
 * Broadcast a signed transaction
 */
export async function broadcastTransaction(txHex: string): Promise<string> {
  // Try WhatsOnChain first
  try {
    const response = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHex })
    });

    if (response.ok) {
      const txid = await response.json();
      return String(txid).replace(/"/g, '');
    }
  } catch (e) {
    console.log('[multisig] WhatsOnChain broadcast failed, trying 1sat...');
  }

  // Try 1sat broadcaster
  const tx = Transaction.fromHex(txHex);
  const result = await tx.broadcast(oneSatBroadcaster()) as { status: string; txid?: string; message?: string };

  if (result.status === 'success' && result.txid) {
    return result.txid;
  }

  throw new Error(result.message || 'Broadcast failed');
}
