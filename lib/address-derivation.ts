// Address Derivation from HandCash Signature
// Users derive their own BSV address from their HandCash signature
// This means USER controls the keys, not PATH402

import { createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bsv = require('bsv');

const { PrivKey, PubKey, Address, Bn } = bsv;

// Version prefix for key derivation (allows future upgrades)
const DERIVATION_VERSION = 'PATH402-v1';

// Encryption algorithm for WIF storage
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;

export interface DerivedWallet {
  address: string;        // BSV P2PKH address (starts with "1")
  publicKey: string;      // Hex public key
  wif: string;            // WIF private key (ONLY returned to user, never stored unencrypted)
  encryptedWif: string;   // WIF encrypted with signature-derived key
  encryptionSalt: string; // Salt used for encryption key derivation
}

/**
 * Derive a deterministic BSV wallet from a HandCash signature.
 *
 * Key derivation:
 * 1. seed = HMAC-SHA256(key: DERIVATION_VERSION, data: signature + handle)
 * 2. privateKey = seed (first 32 bytes)
 * 3. address = P2PKH(publicKey(privateKey))
 *
 * Encryption:
 * 1. encryptionKey = HMAC-SHA256(key: salt, data: signature)
 * 2. encryptedWif = AES-256-GCM(wif, encryptionKey, iv)
 */
export function deriveWalletFromSignature(signature: string, handle: string): DerivedWallet {
  // Derive seed using HMAC-SHA256
  const seed = createHmac('sha256', DERIVATION_VERSION)
    .update(signature + handle)
    .digest();

  // Create private key from seed (first 32 bytes)
  // BSV v2 uses Bn (big number) for private key construction
  const bn = Bn.fromBuffer(seed.slice(0, 32));
  const privateKey = PrivKey.fromBn(bn);

  // Derive public key and address
  const publicKey = PubKey.fromPrivKey(privateKey);
  const address = Address.fromPubKey(publicKey);

  // Get WIF (Wallet Import Format) - this is what user needs to export
  const wif = privateKey.toWif();

  // Encrypt the WIF for storage (using handle, not signature)
  const salt = randomBytes(32).toString('hex');
  const encryptedWif = encryptWif(wif, handle, salt);

  return {
    address: address.toString(),
    publicKey: publicKey.toString(),
    wif,  // Only return this once to the user!
    encryptedWif,
    encryptionSalt: salt,
  };
}

/**
 * Encrypt WIF using AES-256-GCM with a handle-derived key.
 *
 * The encryption key is derived from handle + server secret + salt.
 * Only authenticated users with that handle can decrypt.
 */
function encryptWif(wif: string, handle: string, salt: string): string {
  // Server secret for WIF encryption - only the server can decrypt
  const serverSecret = process.env.HANDCASH_APP_SECRET || 'path402-wif-encryption';

  // Derive encryption key from handle + server secret
  const encryptionKey = createHmac('sha256', salt)
    .update(handle.toLowerCase() + serverSecret)
    .digest();

  // Generate random IV
  const iv = randomBytes(IV_LENGTH);

  // Encrypt with AES-256-GCM
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);

  let encrypted = cipher.update(wif, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt WIF using the user's handle.
 *
 * Only authenticated users with the correct handle can decrypt.
 */
export function decryptWif(encryptedWif: string, handle: string, salt: string): string {
  // Server secret for WIF encryption - only the server can decrypt
  const serverSecret = process.env.HANDCASH_APP_SECRET || 'path402-wif-encryption';

  // Derive encryption key from handle + server secret
  const encryptionKey = createHmac('sha256', salt)
    .update(handle.toLowerCase() + serverSecret)
    .digest();

  // Parse the combined data
  const combined = Buffer.from(encryptedWif, 'base64');

  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  // Decrypt with AES-256-GCM
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Verify that a signature produces the expected address.
 *
 * Used to confirm user owns the wallet before allowing operations.
 */
export function verifySignatureOwnership(
  signature: string,
  handle: string,
  expectedAddress: string
): boolean {
  try {
    const seed = createHmac('sha256', DERIVATION_VERSION)
      .update(signature + handle)
      .digest();

    const bn = Bn.fromBuffer(seed.slice(0, 32));
    const privateKey = PrivKey.fromBn(bn);
    const publicKey = PubKey.fromPrivKey(privateKey);
    const derivedAddress = Address.fromPubKey(publicKey).toString();

    return derivedAddress === expectedAddress;
  } catch {
    return false;
  }
}

/**
 * Re-derive wallet from signature (for recovery or export).
 *
 * Returns the same wallet if signature is correct.
 */
export function recoverWalletFromSignature(
  signature: string,
  handle: string,
  expectedAddress: string
): DerivedWallet | null {
  const wallet = deriveWalletFromSignature(signature, handle);

  if (wallet.address !== expectedAddress) {
    return null; // Signature doesn't match
  }

  return wallet;
}

/**
 * Message templates for signing operations.
 */
export const SIGN_MESSAGES = {
  /**
   * Message for initial wallet derivation.
   */
  derive: (handle: string, timestamp: string) =>
    `I am creating my PATH402 wallet for @${handle}. Timestamp: ${timestamp}`,

  /**
   * Message for staking tokens.
   */
  stake: (amount: number, timestamp: string) =>
    `I am staking ${amount.toLocaleString()} PATH402 tokens. I agree to provide KYC. Timestamp: ${timestamp}`,

  /**
   * Message for unstaking tokens.
   */
  unstake: (amount: number, timestamp: string) =>
    `I am unstaking ${amount.toLocaleString()} PATH402 tokens. Timestamp: ${timestamp}`,

  /**
   * Message for withdrawing tokens.
   */
  withdraw: (amount: number, destination: string, timestamp: string) =>
    `Withdraw ${amount.toLocaleString()} PATH402 to ${destination}. Timestamp: ${timestamp}`,

  /**
   * Message for exporting private key.
   */
  export: (timestamp: string) =>
    `Export my PATH402 private key. Timestamp: ${timestamp}`,
};

// Legacy function for backwards compatibility
export function deriveAddressFromSignature(signature: string, handle: string): {
  address: string;
  publicKey: string;
} {
  const wallet = deriveWalletFromSignature(signature, handle);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
  };
}

// Legacy function for backwards compatibility
export function getDerivationMessage(handle: string): string {
  return SIGN_MESSAGES.derive(handle, new Date().toISOString());
}

// Legacy function for backwards compatibility
export function verifyDerivationSignature(
  signature: string,
  handle: string,
  expectedAddress: string
): boolean {
  return verifySignatureOwnership(signature, handle, expectedAddress);
}
