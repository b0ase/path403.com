import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

async function getSourceTransaction(txid: string): Promise<string> {
  const resp = await fetch(`${WHATSONCHAIN_API}/tx/${txid}/hex`);
  return await resp.text();
}

async function transferOrdinal() {
  const wif = process.env.TREASURY_PRIVATE_KEY;
  if (!wif) {
    console.error('TREASURY_PRIVATE_KEY not set');
    process.exit(1);
  }

  const privateKey = PrivateKey.fromWif(wif);
  const fromAddress = privateKey.toPublicKey().toAddress();
  const toAddress = '1suhQEFh1k6sezyvcbWQattPLtzGy3uMa';
  
  // The ordinal UTXO (PATH402.com token)
  const ordinalTxid = '9437e5bfbe0c266363866394ce69dac6e76b73e222103d09391c391626e8b027';
  const ordinalVout = 0;
  
  // Funding UTXO (from the purchase)
  const fundingTxid = '912f9c263140381b2cabad67cd5fcb30315201d3e4e4689722f4cc721726a529';
  const fundingVout = 0;
  const fundingValue = 108730413;
  
  console.log('From:', fromAddress);
  console.log('To:', toAddress);
  console.log('Ordinal:', ordinalTxid + ':' + ordinalVout);
  console.log('Funding:', fundingTxid + ':' + fundingVout, '(' + fundingValue + ' sats)');
  
  // Fetch source transactions
  console.log('\nFetching source transactions...');
  const ordinalSourceTx = Transaction.fromHex(await getSourceTransaction(ordinalTxid));
  const fundingSourceTx = Transaction.fromHex(await getSourceTransaction(fundingTxid));
  
  // Build transaction
  const tx = new Transaction();
  
  // Input 1: The ordinal
  tx.addInput({
    sourceTransaction: ordinalSourceTx,
    sourceOutputIndex: ordinalVout,
    unlockingScriptTemplate: new P2PKH().unlock(privateKey),
  });
  
  // Input 2: Funding for fees
  tx.addInput({
    sourceTransaction: fundingSourceTx,
    sourceOutputIndex: fundingVout,
    unlockingScriptTemplate: new P2PKH().unlock(privateKey),
  });
  
  // Output 1: Ordinal to destination (1 sat)
  tx.addOutput({
    lockingScript: new P2PKH().lock(toAddress),
    satoshis: 1,
  });
  
  // Output 2: Change back to treasury
  const fee = 500;
  const inputSats = (ordinalSourceTx.outputs[ordinalVout]?.satoshis || 1) + fundingValue;
  const change = inputSats - 1 - fee;
  tx.addOutput({
    lockingScript: new P2PKH().lock(fromAddress),
    satoshis: change,
  });
  
  console.log('Input total:', inputSats, 'sats');
  console.log('Fee:', fee, 'sats');
  console.log('Change:', change, 'sats');
  
  // Sign
  await tx.sign();
  
  // Broadcast
  const rawTx = tx.toHex();
  console.log('\nBroadcasting...');
  
  const broadcastResp = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txhex: rawTx }),
  });
  
  if (!broadcastResp.ok) {
    const error = await broadcastResp.text();
    console.error('Broadcast failed:', error);
    process.exit(1);
  }
  
  const txid = (await broadcastResp.text()).replace(/"/g, '');
  console.log('SUCCESS! TxID:', txid);
  console.log('Explorer: https://whatsonchain.com/tx/' + txid);
}

transferOrdinal().catch(console.error);
