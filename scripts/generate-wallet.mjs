import pkg from 'bsv';
const { KeyPair, Address } = pkg;

// Generate a new random keypair
const keyPair = KeyPair.fromRandom();

// Get the WIF (Wallet Import Format) - this is what you store
const wif = keyPair.privKey.toWif();

// Get the public key
const publicKey = keyPair.pubKey.toString();

// Get the address (for receiving ordinals)
const address = Address.fromPubKey(keyPair.pubKey).toString();

console.log('='.repeat(60));
console.log('BSV ORDINALS WALLET GENERATED');
console.log('='.repeat(60));
console.log('');
console.log('PUBLIC ADDRESS (for receiving):');
console.log(address);
console.log('');
console.log('PRIVATE KEY (WIF) - KEEP SECRET:');
console.log(wif);
console.log('');
console.log('PUBLIC KEY:');
console.log(publicKey);
console.log('');
console.log('='.repeat(60));
console.log('');
console.log('Add to .env.local:');
console.log('');
console.log(`TREASURY_ADDRESS=${address}`);
console.log(`TREASURY_PRIVATE_KEY=${wif}`);
console.log(`TREASURY_PUBLIC_KEY=${publicKey}`);
console.log('');
console.log('='.repeat(60));
