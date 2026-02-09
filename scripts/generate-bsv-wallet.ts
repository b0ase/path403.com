/**
 * Generate BSV Wallet for b0ase.com Platform
 * 
 * This script generates a new BSV wallet address and private key
 * for the platform to hold tokens and manage on-chain operations.
 * 
 * Run: npx tsx scripts/generate-bsv-wallet.ts
 */

import { PrivateKey } from '@bsv/sdk';

function generateBsvWallet() {
    console.log('🔐 Generating new BSV wallet for b0ase.com platform...\n');
    
    // Generate new private key
    const privateKey = PrivateKey.fromRandom();
    
    // Get WIF (Wallet Import Format) - used for BSV_PRIVATE_KEY
    const wif = privateKey.toWif();
    
    // Get public key and address
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();
    
    console.log('✅ Wallet generated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Add these to your .env.local file:\n');
    console.log(`BSV_ORDINALS_ADDRESS=${address}`);
    console.log(`BSV_PRIVATE_KEY=${wif}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Keep the private key SECRET - never commit to git');
    console.log('   2. This address will hold all platform tokens');
    console.log('   3. Fund this address with some BSV for transaction fees');
    console.log('   4. Recommended: ~0.01 BSV to start (for gas fees)\n');
    
    console.log('💰 To fund this wallet:');
    console.log(`   1. Send BSV to: ${address}`);
    console.log('   2. Use a faucet or exchange to get BSV');
    console.log('   3. Minimum recommended: 0.01 BSV for fees\n');
    
    console.log('🔍 Verify balance at:');
    console.log(`   https://whatsonchain.com/address/${address}\n`);
}

// Run the generator
generateBsvWallet();
