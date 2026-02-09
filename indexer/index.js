#!/usr/bin/env node
// PATH402 Simple Indexer
// Watches treasury address for BSV-20 transfers and updates database

const { createClient } = require('@supabase/supabase-js');

// Configuration
const CONFIG = {
  treasuryAddress: '1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1',
  tokenTick: 'PATH402.com',  // Must match on-chain BSV-20 ticker exactly
  pollIntervalMs: 30000, // 30 seconds
  wocApi: 'https://api.whatsonchain.com/v1/bsv/main',
};

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Track last processed tx to avoid duplicates
let lastProcessedTxs = new Set();

// Fetch recent transactions from treasury
async function fetchTreasuryTxs() {
  try {
    const res = await fetch(
      `${CONFIG.wocApi}/address/${CONFIG.treasuryAddress}/history`
    );
    if (!res.ok) {
      console.error('Failed to fetch treasury history:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching treasury txs:', error.message);
    return [];
  }
}

// Fetch full transaction details
async function fetchTxDetails(txid) {
  try {
    const res = await fetch(`${CONFIG.wocApi}/tx/${txid}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching tx ${txid}:`, error.message);
    return null;
  }
}

// Parse BSV-20 transfer from script hex
function parseBsv20Transfer(scriptHex) {
  try {
    // Look for BSV-20 JSON in the script
    // Format: OP_FALSE OP_IF "ord" <content-type> <data> OP_ENDIF
    const hexStr = scriptHex.toLowerCase();

    // Find the JSON payload - look for {"p":"bsv-20"
    const jsonMarker = Buffer.from('{"p":"bsv-20"').toString('hex');
    const jsonStart = hexStr.indexOf(jsonMarker);

    if (jsonStart === -1) return null;

    // Extract JSON - find the closing brace
    let depth = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < hexStr.length; i += 2) {
      const byte = parseInt(hexStr.substr(i, 2), 16);
      const char = String.fromCharCode(byte);
      if (char === '{') depth++;
      if (char === '}') {
        depth--;
        if (depth === 0) {
          jsonEnd = i + 2;
          break;
        }
      }
    }

    const jsonHex = hexStr.substring(jsonStart, jsonEnd);
    const jsonStr = Buffer.from(jsonHex, 'hex').toString('utf8');
    const data = JSON.parse(jsonStr);

    if (data.p === 'bsv-20' && data.op === 'transfer' && data.tick === CONFIG.tokenTick) {
      return {
        tick: data.tick,
        amount: parseInt(data.amt),
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Get recipient address from output script
function getAddressFromScript(scriptHex) {
  try {
    // P2PKH: 76a914 <20-byte-hash> 88ac
    if (scriptHex.startsWith('76a914') && scriptHex.includes('88ac')) {
      const hashHex = scriptHex.substring(6, 46);
      // Convert to address (simplified - assumes mainnet)
      const hashBytes = Buffer.from(hashHex, 'hex');
      const versionByte = Buffer.from([0x00]); // mainnet
      const payload = Buffer.concat([versionByte, hashBytes]);

      // Double SHA256 for checksum
      const crypto = require('crypto');
      const hash1 = crypto.createHash('sha256').update(payload).digest();
      const hash2 = crypto.createHash('sha256').update(hash1).digest();
      const checksum = hash2.slice(0, 4);

      const addressBytes = Buffer.concat([payload, checksum]);
      return base58Encode(addressBytes);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Base58 encode
function base58Encode(buffer) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let num = BigInt('0x' + buffer.toString('hex'));
  let result = '';

  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    result = ALPHABET[Number(remainder)] + result;
  }

  // Handle leading zeros
  for (const byte of buffer) {
    if (byte === 0) result = '1' + result;
    else break;
  }

  return result;
}

// Process a transaction for BSV-20 transfers
async function processTx(txid) {
  if (lastProcessedTxs.has(txid)) return null;

  const tx = await fetchTxDetails(txid);
  if (!tx || !tx.vout) return null;

  // Look for BSV-20 transfer in outputs
  // Any tx in treasury history that has a BSV-20 transfer to non-treasury address
  for (const vout of tx.vout) {
    const scriptHex = vout.scriptPubKey?.hex;
    if (!scriptHex) continue;

    const transfer = parseBsv20Transfer(scriptHex);
    if (!transfer) continue;

    // Get recipient address from the script
    // For BSV-20 inscriptions, the address is embedded in the P2PKH part
    const toAddress = getAddressFromScript(scriptHex);
    if (!toAddress || toAddress === CONFIG.treasuryAddress) continue;

    lastProcessedTxs.add(txid);

    return {
      txid,
      toAddress,
      amount: transfer.amount,
      blockHeight: tx.blockheight,
    };
  }

  return null;
}

// Find holder by address
async function findHolderByAddress(address) {
  // Check user_wallets first
  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('handle')
    .eq('address', address)
    .single();

  if (wallet?.handle) {
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('id')
      .ilike('handle', wallet.handle)
      .single();

    return holder?.id || null;
  }

  return null;
}

// Save transfer to database
async function saveTransfer(transfer) {
  // Check if already exists
  const { data: existing } = await supabase
    .from('path402_transfers')
    .select('id')
    .eq('tx_id', transfer.txid)
    .single();

  if (existing) {
    console.log(`Transfer ${transfer.txid} already recorded`);
    return false;
  }

  // Find holder
  const holderId = await findHolderByAddress(transfer.toAddress);

  const { error } = await supabase
    .from('path402_transfers')
    .insert({
      holder_id: holderId,
      to_address: transfer.toAddress,
      amount: transfer.amount,
      tx_id: transfer.txid,
      status: 'confirmed',
    });

  if (error) {
    console.error('Failed to save transfer:', error.message);
    return false;
  }

  console.log(`Recorded transfer: ${transfer.amount} to ${transfer.toAddress} (tx: ${transfer.txid.slice(0, 16)}...)`);
  return true;
}

// Main poll loop
async function poll() {
  console.log(`[${new Date().toISOString()}] Polling treasury...`);

  const txs = await fetchTreasuryTxs();
  let newTransfers = 0;

  // Process recent transactions (limit to last 20)
  for (const tx of txs.slice(0, 20)) {
    const transfer = await processTx(tx.tx_hash);
    if (transfer) {
      const saved = await saveTransfer(transfer);
      if (saved) newTransfers++;
    }
  }

  if (newTransfers > 0) {
    console.log(`Found ${newTransfers} new transfer(s)`);
  }
}

// Start indexer
async function main() {
  console.log('PATH402 Indexer starting...');
  console.log(`Treasury: ${CONFIG.treasuryAddress}`);
  console.log(`Token: ${CONFIG.tokenTick}`);
  console.log(`Poll interval: ${CONFIG.pollIntervalMs / 1000}s`);
  console.log('');

  // Initial poll
  await poll();

  // Schedule polling
  setInterval(poll, CONFIG.pollIntervalMs);
}

main().catch(console.error);
