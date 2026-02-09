
// Deploy $402 PoW20 Token
// Run with: npx ts-node --skip-project scripts/deploy-pow20.ts

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createAndBroadcastInscription } from '../lib/bsv-inscribe';

// Load .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const TREASURY_KEY = process.env.TREASURY_PRIVATE_KEY;
const TREASURY_ADDR = process.env.TREASURY_ADDRESS;

if (!TREASURY_KEY || !TREASURY_ADDR) {
    console.error('❌ Missing TREASURY_PRIVATE_KEY or TREASURY_ADDRESS in .env.local');
    process.exit(1);
}

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

async function main() {
    console.log('🚀 Deploying $402 PoW20 Token...');
    console.log('--- Configuration ---');
    console.log(JSON.stringify(POW20_DEPLOYMENT, null, 2));
    console.log('---------------------');
    console.log(`Using Address: ${TREASURY_ADDR}`);

    try {
        const result = await createAndBroadcastInscription({
            data: POW20_DEPLOYMENT,
            contentType: 'application/json',
            toAddress: TREASURY_ADDR, // Send to self (treasury)
            privateKeyWIF: TREASURY_KEY
        });

        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log(`Review TX: https://whatsonchain.com/tx/${result.txId}`);
        console.log(`Inscription ID: ${result.inscriptionId}`);
        console.log('\nThe $402 Economy has begun. Miners can now start work.');

    } catch (error) {
        console.error('\n❌ Deployment Failed:', error);
    }
}

main();
