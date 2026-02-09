import { PrivateKey, Transaction, P2PKH } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

async function main() {
  const wif = process.env.TREASURY_PRIVATE_KEY;
  if (!wif) {
    console.log('TREASURY_PRIVATE_KEY not set');
    process.exit(1);
  }

  const privateKey = PrivateKey.fromWif(wif);
  const publicKey = privateKey.toPublicKey();
  const address = publicKey.toAddress();
  
  const ordinalOwner = '1sPzWgCv5ftiv2VtJAspLYgz6bUtrgtVj';
  const destination = '1suhQEFh1k6sezyvcbWQattPLtzGy3uMa';
  
  console.log('Treasury controls:', address);
  console.log('Ordinal owner:', ordinalOwner);
  console.log('Match:', address === ordinalOwner);
  console.log('Destination:', destination);
  
  // Check for UTXOs at the ordinal location
  const utxoResp = await fetch(`${WHATSONCHAIN_API}/address/${ordinalOwner}/unspent`);
  const utxos = await utxoResp.json();
  console.log('\nUTXOs at ordinal owner address:', utxos.length);
  
  for (const utxo of utxos as any[]) {
    console.log(`  - ${utxo.tx_hash}:${utxo.tx_pos} (${utxo.value} sats)`);
  }
}

main().catch(console.error);
