// BSV inscription helper for OP_RETURN (ordinals-style)
// Uses treasury key to create and broadcast a transaction.

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

function buildOrdinalsScript(contentType: string, data: Buffer) {
  const script = new Script();
  script.writeOpCode(0x00); // OP_FALSE
  script.writeOpCode(0x63); // OP_IF
  script.writeBuffer(Buffer.from('ord', 'utf8'));
  script.writeOpCode(0x01); // Push 1 byte
  script.writeBuffer(Buffer.from(contentType, 'utf8'));
  script.writeOpCode(0x00); // Push 0
  script.writeBuffer(data);
  script.writeOpCode(0x68); // OP_ENDIF
  return script;
}

export async function createAndBroadcastInscription(params: {
  data: object | string;
  contentType?: string;
  toAddress: string;
  privateKeyWIF: string;
}): Promise<{ txHex: string; txId: string; inscriptionId: string }> {
  const { data, contentType = 'application/json', toAddress, privateKeyWIF } = params;

  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const payloadBuffer = Buffer.from(payload, 'utf8');

  const privKey = PrivKey.fromWif(privateKeyWIF);
  const pubKey = PubKey.fromPrivKey(privKey);
  const fromAddress = Address.fromPubKey(pubKey).toString();

  const utxos = await fetchUtxos(fromAddress);
  if (!utxos.length) {
    throw new Error('No UTXOs available for treasury');
  }

  const tx = new Tx();
  let totalInput = 0;
  const usedUtxos: typeof utxos = [];

  for (const utxo of utxos) {
    const txHashBuf = Buffer.from(utxo.txid, 'hex').reverse();
    const txIn = TxIn.fromProperties(txHashBuf, utxo.vout, new Script(), 0xffffffff);
    tx.addTxIn(txIn);
    totalInput += utxo.satoshis;
    usedUtxos.push(utxo);
    if (totalInput >= 1000) break;
  }

  const estimatedSize = 300 + payloadBuffer.length;
  const fee = Math.max(estimatedSize, 500);
  if (totalInput < fee + 1) {
    throw new Error(`Insufficient funds: have ${totalInput}, need ${fee + 1}`);
  }

  const ordScript = buildOrdinalsScript(contentType, payloadBuffer);
  const recipientAddress = Address.fromString(toAddress);
  const recipientScript = recipientAddress.toTxOutScript();
  for (const chunk of ordScript.chunks) {
    recipientScript.chunks.push(chunk);
  }

  const txOut1 = TxOut.fromProperties(new Bn(1), recipientScript);
  tx.addTxOut(txOut1);

  const change = totalInput - fee - 1;
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
  const inscriptionId = `${txId}_0`;

  return { txHex, txId, inscriptionId };
}
