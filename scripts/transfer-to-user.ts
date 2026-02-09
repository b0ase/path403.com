// Transfer tokens from treasury to user
// Run with: npx tsx scripts/transfer-to-user.ts

import { readFileSync } from 'fs';
import { executeTransfer } from '../lib/bsv20-transfer';

// Load env
const envContent = readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const TO_ADDRESS = '17Rw7n5z3qrYdbu6r6zzU5hfxPgHorMZBh';
const AMOUNT = 9090909;

async function main() {
  console.log('Transferring', AMOUNT.toLocaleString(), 'PATH402 tokens');
  console.log('To:', TO_ADDRESS);
  console.log('');

  const result = await executeTransfer(AMOUNT, TO_ADDRESS);

  if (result.success) {
    console.log('SUCCESS!');
    console.log('Transaction ID:', result.txId);
    console.log('View: https://whatsonchain.com/tx/' + result.txId);
  } else {
    console.error('FAILED:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
