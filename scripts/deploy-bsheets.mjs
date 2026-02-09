import { readFileSync } from 'fs';
import { PrivateKey } from '@bsv/sdk';
import { deployBsv21Token, oneSatBroadcaster, fetchPayUtxos } from 'js-1sat-ord';

// Load env
const envContent = readFileSync('.env.local', 'utf-8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`"?${key}"?\\s*[:=]\\s*["']?([^"',\n}]+)["']?`));
  return match ? match[1].trim() : null;
};

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

async function deploy() {
  // Use payPk for the funded address (Yours wallet payPk matches the visible address)
  const privateKeyWIF = getEnv('payPk') || getEnv('bSHEETS_TREASURY_PRIVATE_KEY');
  const treasuryAddress = getEnv('bSHEETS_TREASURY_ADDRESS');

  if (!privateKeyWIF || !treasuryAddress) {
    throw new Error('Missing BSV_ORDINALS_PRIVATE_KEY or BSV_ORDINALS_ADDRESS');
  }

  console.log('Treasury address:', treasuryAddress);

  // Load icon
  const iconBuffer = readFileSync('public/images/tokens/bsheets-icon.png');
  const iconBase64 = iconBuffer.toString('base64');

  console.log('Icon size:', iconBuffer.length, 'bytes');

  const privateKey = PrivateKey.fromWif(privateKeyWIF);
  const totalSupply = 1_000_000_000; // 1 billion

  console.log('Fetching UTXOs...');
  const payUtxos = await fetchPayUtxos(treasuryAddress);
  console.log('Found', payUtxos.length, 'UTXOs with', payUtxos.reduce((s,u) => s + u.satoshis, 0), 'satoshis');

  if (!payUtxos.length) {
    throw new Error('No payment UTXOs found - need satoshis for deployment');
  }

  console.log('Deploying BSHEETS token with', totalSupply.toLocaleString(), 'supply...');

  const { tx } = await deployBsv21Token({
    symbol: 'BSHEETS',
    icon: {
      dataB64: iconBase64,
      contentType: 'image/png'
    },
    utxos: payUtxos,
    initialDistribution: {
      address: treasuryAddress,
      tokens: totalSupply
    },
    paymentPk: privateKey,
    destinationAddress: treasuryAddress,
    satsPerKb: 1
  });

  console.log('Broadcasting...');

  let result = await tx.broadcast(oneSatBroadcaster());

  if (result.status !== 'success') {
    console.log('1sat broadcast failed, trying WhatsOnChain...');
    const txHex = tx.toHex();
    const res = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txhex: txHex })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Broadcast failed: ${errText}`);
    }

    const txid = (await res.text()).replace(/"/g, '').trim();
    console.log('\n✓ Token deployed!');
    console.log('Token ID:', `${txid}_0`);
    console.log('TXID:', txid);
    console.log('Explorer:', `https://whatsonchain.com/tx/${txid}`);
    console.log('Market:', `https://1sat.market/bsv21/bsheets`);
    return;
  }

  console.log('\n✓ Token deployed!');
  console.log('Token ID:', `${result.txid}_0`);
  console.log('TXID:', result.txid);
  console.log('Explorer:', `https://whatsonchain.com/tx/${result.txid}`);
  console.log('Market:', `https://1sat.market/bsv21/bsheets`);
}

deploy().catch(err => {
  console.error('Deployment failed:', err.message);
  process.exit(1);
});
