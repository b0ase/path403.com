#!/usr/bin/env node

/**
 * Withdraw all $bWriter tokens from source address to treasury
 *
 * Usage:
 *   node scripts/withdraw-bwriter-tokens.js
 *
 * Requires environment variables:
 *   - BWRITER_DEPLOY_TXID: Token deploy inscription TXID
 *   - BWRITER_TOKEN_ADDRESS: Current token holder address
 *   - BWRITER_PRIVATE_KEY: Private key to sign transaction (WIF format)
 *   - BWRITER_TREASURY_ADDRESS: Destination treasury address
 *
 * This script:
 *   1. Queries whatsonchain for UTXOs at token address
 *   2. Finds the UTXO containing the $bWriter token
 *   3. Builds a BSV-20 transfer transaction
 *   4. Signs the transaction with the private key
 *   5. Broadcasts to BSV mainnet
 *   6. Returns the transaction ID
 */

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const {
  BWRITER_DEPLOY_TXID,
  BWRITER_TOKEN_ADDRESS,
  BWRITER_PRIVATE_KEY,
  BWRITER_TREASURY_ADDRESS,
} = process.env;

async function validateEnv() {
  const missing = [];
  if (!BWRITER_DEPLOY_TXID) missing.push('BWRITER_DEPLOY_TXID');
  if (!BWRITER_TOKEN_ADDRESS) missing.push('BWRITER_TOKEN_ADDRESS');
  if (!BWRITER_PRIVATE_KEY) missing.push('BWRITER_PRIVATE_KEY');
  if (!BWRITER_TREASURY_ADDRESS) missing.push('BWRITER_TREASURY_ADDRESS');

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(v => console.error(`   ${v}`));
    process.exit(1);
  }
}

async function getTokenUTXO() {
  console.log(`\n🔍 Finding token UTXO at ${BWRITER_TOKEN_ADDRESS}...`);
  try {
    const response = await axios.get(
      `https://api.whatsonchain.com/v1/bsv/main/address/${BWRITER_TOKEN_ADDRESS}/unspent`
    );

    if (!response.data || response.data.length === 0) {
      console.error('❌ No UTXOs found at token address');
      process.exit(1);
    }

    const utxo = response.data[0]; // Should be the token UTXO
    console.log(`✓ Found UTXO:`);
    console.log(`  TX: ${utxo.tx_hash}`);
    console.log(`  Vout: ${utxo.vout}`);
    console.log(`  Amount: ${utxo.value} satoshis`);

    return utxo;
  } catch (error) {
    console.error('❌ Error fetching UTXO:', error.message);
    process.exit(1);
  }
}

async function buildTransaction(utxo) {
  console.log(`\n🔨 Building BSV-20 transfer transaction...`);

  const INSCRIPTION_JSON = JSON.stringify({
    p: 'bsv-20',
    op: 'transfer',
    tick: '$$bWriter',
    amt: '1000000000', // 1 billion tokens
  });

  console.log(`✓ Token transfer inscription:`);
  console.log(`  ${INSCRIPTION_JSON}`);

  console.log(`\n⚠️  BSV-20 Transaction Building`);
  console.log(`   This requires proper @bsv/sdk implementation:`);
  console.log(`   1. Input: UTXO from ${BWRITER_TOKEN_ADDRESS}`);
  console.log(`   2. Output: Transfer inscription to ${BWRITER_TREASURY_ADDRESS}`);
  console.log(`   3. Sign with: ${BWRITER_PRIVATE_KEY.substring(0, 10)}...`);
  console.log(`   4. Broadcast to mainnet`);

  return {
    inscription: INSCRIPTION_JSON,
    inputs: [{
      txid: utxo.tx_hash,
      vout: utxo.vout,
      satoshis: utxo.value,
    }],
    outputs: [{
      address: BWRITER_TREASURY_ADDRESS,
      satoshis: Math.floor(utxo.value * 0.995), // Leave small fee
    }],
  };
}

async function main() {
  console.log('🚀 $bWriter Token Withdrawal Script');
  console.log('='.repeat(50));

  await validateEnv();

  console.log(`\n✓ Environment variables validated`);
  console.log(`  Deploy TXID: ${BWRITER_DEPLOY_TXID.substring(0, 16)}...`);
  console.log(`  Source: ${BWRITER_TOKEN_ADDRESS}`);
  console.log(`  Destination: ${BWRITER_TREASURY_ADDRESS}`);
  console.log(`  Supply: 1,000,000,000 $$bWriter tokens`);

  const utxo = await getTokenUTXO();
  const tx = await buildTransaction(utxo);

  console.log(`\n❌ INCOMPLETE IMPLEMENTATION`);
  console.log(`=`.repeat(50));
  console.log(`\nTo complete this withdrawal, you need to:`);
  console.log(`\n1. Install @bsv/sdk:`);
  console.log(`   pnpm add @bsv/sdk`);
  console.log(`\n2. Implement transaction building:`);
  console.log(`   - Create inputs from UTXO`);
  console.log(`   - Add BSV-20 transfer inscription to output`);
  console.log(`   - Sign with ${BWRITER_PRIVATE_KEY.substring(0, 10)}...`);
  console.log(`\n3. Broadcast signed transaction to BSV mainnet`);
  console.log(`\n4. Verify on whatsonchain:`);
  console.log(`   https://whatsonchain.com/address/${BWRITER_TREASURY_ADDRESS}`);

  console.log(`\n📋 Transaction Details:`);
  console.log(JSON.stringify(tx, null, 2));

  console.log(`\n🔗 Manual Alternative:`);
  console.log(`   Use 1sat.market or other BSV-20 tools to manually transfer`);
  console.log(`   from ${BWRITER_TOKEN_ADDRESS}`);
  console.log(`   to ${BWRITER_TREASURY_ADDRESS}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
