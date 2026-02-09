// Client-Side Wallet Derivation
// ALL private key operations happen in the browser - server NEVER sees the WIF

import { Buffer } from 'buffer';

// Make Buffer available globally for bsv library
if (typeof window !== 'undefined') {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

const DERIVATION_VERSION = 'PATH402-v1';

export interface ClientDerivedWallet {
  address: string;
  publicKey: string;
  wif: string;
  encryptedWif: string;
  encryptionSalt: string;
}

/**
 * Derive wallet entirely client-side using Web Crypto API + bsv library
 * The WIF never leaves the browser unencrypted
 */
export async function deriveWalletClientSide(
  signature: string,
  handle: string
): Promise<ClientDerivedWallet> {
  // Dynamic import of bsv library (browser-compatible)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bsv = await import('bsv') as any;
  const { PrivKey, PubKey, Address, Bn } = bsv;

  // Step 1: Derive seed using HMAC-SHA256 (Web Crypto API)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(DERIVATION_VERSION);
  const messageData = encoder.encode(signature + handle);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const seedBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const seed = new Uint8Array(seedBuffer);

  // Step 2: Create private key from seed (first 32 bytes)
  const bn = Bn.fromBuffer(Buffer.from(seed.slice(0, 32)));
  const privateKey = PrivKey.fromBn(bn);

  // Step 3: Derive public key and address
  const publicKey = PubKey.fromPrivKey(privateKey);
  const address = Address.fromPubKey(publicKey);

  // Step 4: Get WIF
  const wif = privateKey.toWif();

  // Step 5: Encrypt WIF client-side before sending anywhere
  const salt = generateRandomSalt();
  const encryptedWif = await encryptWifClientSide(wif, handle, salt);

  return {
    address: address.toString(),
    publicKey: publicKey.toString(),
    wif, // Only shown to user, never sent to server
    encryptedWif,
    encryptionSalt: salt,
  };
}

/**
 * Generate random salt using Web Crypto API
 */
function generateRandomSalt(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypt WIF using AES-256-GCM with handle-derived key (client-side)
 */
async function encryptWifClientSide(
  wif: string,
  handle: string,
  salt: string
): Promise<string> {
  const encoder = new TextEncoder();

  // Derive encryption key from handle + salt using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(handle.toLowerCase() + salt),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('PATH402-WIF-ENCRYPTION'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    encoder.encode(wif)
  );

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt WIF client-side (for export)
 */
export async function decryptWifClientSide(
  encryptedWif: string,
  handle: string,
  salt: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedWif), (c) => c.charCodeAt(0));

  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  // Derive encryption key from handle + salt using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(handle.toLowerCase() + salt),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('PATH402-WIF-ENCRYPTION'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    encryptedData
  );

  return decoder.decode(decryptedData);
}
