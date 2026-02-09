/**
 * Deploy BSV-21 Token Library for b0ase.com
 *
 * Deploys real on-chain BSV-20 V2 tokens.
 * Used for creating project tokens on the BSV blockchain.
 */

import { PrivateKey } from '@bsv/sdk';
import {
  deployBsv21Token,
  oneSatBroadcaster,
  fetchPayUtxos,
} from 'js-1sat-ord';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

export interface DeployResult {
  tokenId: string;
  txid: string;
  symbol: string;
  totalSupply: number;
}

export interface DeployConfig {
  symbol: string;
  totalSupply?: number;
  iconBase64?: string;
  iconContentType?: string;
  destinationAddress?: string;
  // Optional: pass treasury config directly (avoids MONEYBUTTON env vars)
  privateKeyWif?: string;
  treasuryAddress?: string;
}

/**
 * Deploy a new BSV-21 token
 *
 * @param config - Deployment configuration
 * @returns Token ID and transaction ID
 */
export async function deployToken(config: DeployConfig): Promise<DeployResult> {
  const {
    symbol,
    totalSupply = 100_000_000,
    iconBase64,
    iconContentType = 'image/png'
  } = config;

  // Use passed config or fall back to env vars (legacy MONEYBUTTON or new BOASE_TREASURY)
  const privateKeyWIF = config.privateKeyWif
    || process.env.BOASE_TREASURY_PRIVATE_KEY
    || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;
  const treasuryAddress = config.treasuryAddress
    || process.env.BOASE_TREASURY_ORD_ADDRESS
    || process.env.MONEYBUTTON_BSV_ORDINALS_ADDRESS;

  if (!privateKeyWIF || !treasuryAddress) {
    throw new Error('Missing treasury config. Set BOASE_TREASURY_PRIVATE_KEY and BOASE_TREASURY_ORD_ADDRESS');
  }

  const privateKey = PrivateKey.fromWif(privateKeyWIF);
  const destinationAddress = config.destinationAddress || treasuryAddress;

  console.log(`[deployToken] Deploying ${symbol} with ${totalSupply.toLocaleString()} supply`);
  console.log(`[deployToken] Destination: ${destinationAddress}`);

  // Fetch payment UTXOs
  const payUtxos = await fetchPayUtxos(treasuryAddress);
  if (!payUtxos.length) {
    throw new Error('No payment UTXOs found at treasury - need satoshis for deployment');
  }
  console.log(`[deployToken] Found ${payUtxos.length} payment UTXOs`);

  // Use provided icon or minimal 1x1 pixel PNG (67 bytes)
  const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  // Deploy token
  const { tx } = await deployBsv21Token({
    symbol: symbol,
    icon: {
      dataB64: iconBase64 || minimalPngBase64,
      contentType: iconContentType
    },
    utxos: payUtxos,
    initialDistribution: {
      address: destinationAddress,
      tokens: totalSupply
    },
    paymentPk: privateKey,
    destinationAddress: destinationAddress,
    satsPerKb: 1
  });

  console.log('[deployToken] Transaction built, broadcasting...');

  // Try 1sat broadcaster first
  let result = await tx.broadcast(oneSatBroadcaster()) as { status: string; txid?: string; message?: string };

  if (result.status !== 'success') {
    console.log('[deployToken] 1sat broadcast failed, trying WhatsOnChain...');
    const txHex = tx.toHex();
    const res = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txhex: txHex })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Broadcast failed: ${errText}`);
    }

    const txid = (await res.text()).replace(/"/g, '').trim();
    console.log(`[deployToken] Deployed: ${txid}_0`);

    return {
      tokenId: `${txid}_0`,
      txid,
      symbol,
      totalSupply
    };
  }

  console.log(`[deployToken] Deployed: ${result.txid}_0`);

  return {
    tokenId: `${result.txid!}_0`,
    txid: result.txid!,
    symbol,
    totalSupply
  };
}

/**
 * Get token info from 1Sat Ordinals API
 */
export async function getTokenInfo(tokenId: string): Promise<{
  symbol: string;
  totalSupply: number;
  holders: number;
} | null> {
  try {
    const response = await fetch(`https://ordinals.gorillapool.io/api/bsv20/${tokenId}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      symbol: data.sym || data.tick,
      totalSupply: parseInt(data.max || data.amt || '0'),
      holders: data.holders || 0
    };
  } catch (error) {
    console.error('[getTokenInfo] Error:', error);
    return null;
  }
}
