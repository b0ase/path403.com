/**
 * Mint $KINTSUGI Token to Treasury
 *
 * Run with: npx tsx scripts/mint-kintsugi.ts
 *
 * Prerequisites:
 * - BOASE_TREASURY_PRIVATE_KEY set (WIF format)
 * - BOASE_TREASURY_ORD_ADDRESS set
 * - Treasury has BSV for transaction fee (~0.001 BSV)
 */

import { deployToken } from '../lib/bsv-deploy-token';
import { getTreasuryConfig } from '../lib/boase-treasury';
import fs from 'fs';
import path from 'path';

const KINTSUGI_CONFIG = {
  symbol: 'KINTSUGI',
  totalSupply: 1_000_000_000, // 1 billion tokens
  iconPath: path.join(__dirname, '../public/tokens/kintsugi-icon-400.jpg'), // 400x400 for BSV-21
};

async function main() {
  console.log('=== Minting $KINTSUGI Token ===\n');

  // Check environment using unified treasury config
  let treasuryConfig;
  try {
    treasuryConfig = getTreasuryConfig();
  } catch (error) {
    console.error('ERROR:', error instanceof Error ? error.message : error);
    console.error('\nRequired env vars:');
    console.error('  BOASE_TREASURY_PRIVATE_KEY=<WIF format private key>');
    console.error('  BOASE_TREASURY_ORD_ADDRESS=<ordinals address>');
    process.exit(1);
  }

  console.log('Treasury address:', treasuryConfig.ordAddress);
  console.log('Token symbol:', KINTSUGI_CONFIG.symbol);
  console.log('Total supply:', KINTSUGI_CONFIG.totalSupply.toLocaleString());

  // Load icon
  let iconBase64: string | undefined;
  if (fs.existsSync(KINTSUGI_CONFIG.iconPath)) {
    const iconBuffer = fs.readFileSync(KINTSUGI_CONFIG.iconPath);
    iconBase64 = iconBuffer.toString('base64');
    console.log('Icon loaded:', KINTSUGI_CONFIG.iconPath);
    console.log('Icon size:', Math.round(iconBuffer.length / 1024), 'KB');
  } else {
    console.log('Warning: Icon not found, using minimal placeholder');
  }

  console.log('\nDeploying to BSV mainnet...\n');

  try {
    const result = await deployToken({
      symbol: KINTSUGI_CONFIG.symbol,
      totalSupply: KINTSUGI_CONFIG.totalSupply,
      iconBase64,
      iconContentType: 'image/jpeg',
      privateKeyWif: treasuryConfig.privateKey,
      treasuryAddress: treasuryConfig.ordAddress,
    });

    console.log('\n=== SUCCESS ===');
    console.log('Token ID:', result.tokenId);
    console.log('Transaction:', result.txid);
    console.log('Symbol:', result.symbol);
    console.log('Supply:', result.totalSupply.toLocaleString());
    console.log('\nView on 1Sat Market:');
    console.log(`https://1sat.market/market/bsv21/${result.tokenId}`);
    console.log('\nView transaction:');
    console.log(`https://whatsonchain.com/tx/${result.txid}`);

    // Save result for reference
    const resultPath = path.join(__dirname, '../data/kintsugi-token-deploy.json');
    fs.mkdirSync(path.dirname(resultPath), { recursive: true });
    fs.writeFileSync(resultPath, JSON.stringify({
      ...result,
      deployedAt: new Date().toISOString(),
      treasuryAddress: treasuryConfig.ordAddress,
    }, null, 2));
    console.log('\nResult saved to:', resultPath);

  } catch (error) {
    console.error('\n=== FAILED ===');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
