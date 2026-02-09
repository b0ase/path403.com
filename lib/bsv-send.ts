// Simple BSV payment sender (P2PKH)
// Uses treasury key to send sats to an address.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bsv = require('bsv');

const { PrivKey, PubKey, Address, Tx, TxIn, TxOut, Script, Bn, KeyPair, Sig } = bsv;

const WOC_API = 'https://api.whatsonchain.com/v1/bsv/main';

async function fetchUtxos(address: string): Promise<Array<{
  txid: string;
  vout: number;
  satoshis: number;
  scriptHex: string;
}>> {
  const response = await fetch(`${WOC_API}/address/${address}/unspent`);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.status}`);
  }
  const data = await response.json();
  const addr = Address.fromString(address);
  const scriptHex = addr.toTxOutScript().toHex();

  return data.map((utxo: { tx_hash: string; tx_pos: number; value: number }) => ({
    txid: utxo.tx_hash,
    vout: utxo.tx_pos,
    satoshis: utxo.value,
    scriptHex,
  }));
}

async function broadcastTransaction(txHex: string): Promise<string> {
  const response = await fetch(`${WOC_API}/tx/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txhex: txHex }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Broadcast failed: ${error}`);
  }

  const txId = await response.text();
  return txId.replace(/"/g, '');
}

export async function sendBsvPayment(params: {
  toAddress: string;
  amountSats: number;
  privateKeyWIF: string;
}): Promise<{ txId: string }> {
  const { toAddress, amountSats, privateKeyWIF } = params;

  const privKey = PrivKey.fromWif(privateKeyWIF);
  const pubKey = PubKey.fromPrivKey(privKey);
  const fromAddress = Address.fromPubKey(pubKey).toString();

  const utxos = await fetchUtxos(fromAddress);
  if (!utxos.length) throw new Error('No UTXOs available for treasury');

  const tx = new Tx();
  let totalInput = 0;
  const usedUtxos: typeof utxos = [];

  for (const utxo of utxos) {
    const txHashBuf = Buffer.from(utxo.txid, 'hex').reverse();
    const txIn = TxIn.fromProperties(txHashBuf, utxo.vout, new Script(), 0xffffffff);
    tx.addTxIn(txIn);
    totalInput += utxo.satoshis;
    usedUtxos.push(utxo);
    if (totalInput >= amountSats + 500) break;
  }

  const estimatedSize = 225 + usedUtxos.length * 50;
  const fee = Math.max(estimatedSize, 500);
  const totalNeeded = amountSats + fee;

  if (totalInput < totalNeeded) {
    throw new Error(`Insufficient funds: have ${totalInput}, need ${totalNeeded}`);
  }

  const recipientScript = Address.fromString(toAddress).toTxOutScript();
  const txOut1 = TxOut.fromProperties(new Bn(amountSats), recipientScript);
  tx.addTxOut(txOut1);

  const change = totalInput - totalNeeded;
  if (change > 546) {
    const changeScript = Address.fromString(fromAddress).toTxOutScript();
    const txOut2 = TxOut.fromProperties(new Bn(change), changeScript);
    tx.addTxOut(txOut2);
  }

  const keyPair = KeyPair.fromPrivKey(privKey);
  const hashType = Sig.SIGHASH_ALL | Sig.SIGHASH_FORKID;

  for (let i = 0; i < tx.txIns.length; i++) {
    const utxo = usedUtxos[i];
    const script = Script.fromHex(utxo.scriptHex);
    const valueBn = new Bn(utxo.satoshis);
    const sig = tx.sign(keyPair, hashType, i, script, valueBn);
    const inputScript = new Script();
    inputScript.writeBuffer(sig.toTxFormat());
    inputScript.writeBuffer(pubKey.toBuffer());
    tx.txIns[i].setScript(inputScript);
  }

  const txHex = tx.toHex();
  const txId = await broadcastTransaction(txHex);

  return { txId };
}
