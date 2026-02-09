/**
 * @b0ase/crypto-utils
 *
 * Common cryptographic utilities for hashing, encoding, and key operations.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Hash algorithm */
export type HashAlgorithm = 'sha256' | 'sha512' | 'sha1' | 'md5' | 'ripemd160';

/** Encoding type */
export type EncodingType = 'hex' | 'base64' | 'base58' | 'utf8';

/** Key type */
export type KeyType = 'private' | 'public' | 'extended';

/** Network type */
export type NetworkType = 'mainnet' | 'testnet';

/** Key pair */
export interface KeyPair {
  privateKey: string;
  publicKey: string;
  address?: string;
}

/** Extended key */
export interface ExtendedKey {
  key: string;
  chainCode: string;
  depth: number;
  index: number;
  parentFingerprint: string;
}

/** Signature */
export interface Signature {
  r: string;
  s: string;
  recovery?: number;
}

/** Verification result */
export interface VerificationResult {
  valid: boolean;
  publicKey?: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const HEX_CHARS = '0123456789abcdef';

export const ADDRESS_VERSIONS = {
  mainnet: {
    p2pkh: 0x00,
    p2sh: 0x05,
    wif: 0x80,
  },
  testnet: {
    p2pkh: 0x6f,
    p2sh: 0xc4,
    wif: 0xef,
  },
} as const;

// ============================================================================
// Hex Encoding
// ============================================================================

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isValidHex(str: string): boolean {
  if (str.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]*$/.test(str);
}

export function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g) || [];
  return bytes.reverse().join('');
}

// ============================================================================
// Base64 Encoding
// ============================================================================

export function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function base64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  return base64Encode(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64Decode(base64);
}

// ============================================================================
// Base58 Encoding
// ============================================================================

export function base58Encode(bytes: Uint8Array): string {
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }

  let result = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = BASE58_ALPHABET[remainder] + result;
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }

  return result || '1';
}

export function base58Decode(str: string): Uint8Array {
  let num = 0n;
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    num = num * 58n + BigInt(index);
  }

  // Convert to bytes
  const hex = num.toString(16).padStart(2, '0');
  const bytes = hexToBytes(hex.length % 2 ? '0' + hex : hex);

  // Count leading zeros
  let leadingZeros = 0;
  for (const char of str) {
    if (char !== '1') break;
    leadingZeros++;
  }

  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}

export function isValidBase58(str: string): boolean {
  for (const char of str) {
    if (BASE58_ALPHABET.indexOf(char) === -1) {
      return false;
    }
  }
  return true;
}

// ============================================================================
// Base58Check Encoding (Bitcoin addresses)
// ============================================================================

export function base58CheckEncode(payload: Uint8Array): string {
  const checksum = sha256d(payload).slice(0, 4);
  const data = new Uint8Array(payload.length + 4);
  data.set(payload);
  data.set(checksum, payload.length);
  return base58Encode(data);
}

export function base58CheckDecode(str: string): Uint8Array {
  const data = base58Decode(str);
  if (data.length < 5) {
    throw new Error('Invalid base58check string');
  }

  const payload = data.slice(0, -4);
  const checksum = data.slice(-4);
  const expectedChecksum = sha256d(payload).slice(0, 4);

  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expectedChecksum[i]) {
      throw new Error('Invalid checksum');
    }
  }

  return payload;
}

export function isValidBase58Check(str: string): boolean {
  try {
    base58CheckDecode(str);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// SHA256 (Software implementation)
// ============================================================================

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const SHA256_H = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function sha256(data: Uint8Array): Uint8Array {
  // Pre-processing: adding padding bits
  const bitLength = data.length * 8;
  const paddingLength = (64 - ((data.length + 9) % 64)) % 64;
  const paddedLength = data.length + 1 + paddingLength + 8;

  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;

  // Append length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength, false);

  // Initialize hash values
  const h = new Uint32Array(SHA256_H);

  // Process each 512-bit block
  const w = new Uint32Array(64);

  for (let i = 0; i < paddedLength; i += 64) {
    // Copy block into first 16 words
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }

    // Extend to 64 words
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    // Initialize working variables
    let a = h[0], b = h[1], c = h[2], d = h[3];
    let e = h[4], f = h[5], g = h[6], hh = h[7];

    // Main loop
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + SHA256_K[j] + w[j]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Add to hash
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  // Produce final hash
  const result = new Uint8Array(32);
  const resultView = new DataView(result.buffer);
  for (let i = 0; i < 8; i++) {
    resultView.setUint32(i * 4, h[i], false);
  }

  return result;
}

export function sha256d(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

export function sha256Hex(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return bytesToHex(sha256(bytes));
}

// ============================================================================
// RIPEMD160 (Software implementation)
// ============================================================================

const RIPEMD160_RL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];

const RIPEMD160_RR = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];

const RIPEMD160_SL = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];

const RIPEMD160_SR = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

export function ripemd160(data: Uint8Array): Uint8Array {
  // Pad message
  const bitLength = data.length * 8;
  const paddingLength = (64 - ((data.length + 9) % 64)) % 64;
  const paddedLength = data.length + 1 + paddingLength + 8;

  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength, true);

  // Initialize
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  // Process blocks
  for (let i = 0; i < paddedLength; i += 64) {
    const w = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, true);
    }

    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;

    for (let j = 0; j < 80; j++) {
      let fl: number, kl: number, fr: number, kr: number;

      if (j < 16) {
        fl = bl ^ cl ^ dl;
        kl = 0x00000000;
        fr = br ^ (cr | ~dr);
        kr = 0x50a28be6;
      } else if (j < 32) {
        fl = (bl & cl) | (~bl & dl);
        kl = 0x5a827999;
        fr = (br & dr) | (cr & ~dr);
        kr = 0x5c4dd124;
      } else if (j < 48) {
        fl = (bl | ~cl) ^ dl;
        kl = 0x6ed9eba1;
        fr = (br | ~cr) ^ dr;
        kr = 0x6d703ef3;
      } else if (j < 64) {
        fl = (bl & dl) | (cl & ~dl);
        kl = 0x8f1bbcdc;
        fr = (br & cr) | (~br & dr);
        kr = 0x7a6d76e9;
      } else {
        fl = bl ^ (cl | ~dl);
        kl = 0xa953fd4e;
        fr = br ^ cr ^ dr;
        kr = 0x00000000;
      }

      let t = (al + fl + w[RIPEMD160_RL[j]] + kl) >>> 0;
      t = (rotl(t, RIPEMD160_SL[j]) + el) >>> 0;
      al = el;
      el = dl;
      dl = rotl(cl, 10);
      cl = bl;
      bl = t;

      t = (ar + fr + w[RIPEMD160_RR[j]] + kr) >>> 0;
      t = (rotl(t, RIPEMD160_SR[j]) + er) >>> 0;
      ar = er;
      er = dr;
      dr = rotl(cr, 10);
      cr = br;
      br = t;
    }

    const t = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = t;
  }

  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, h0, true);
  resultView.setUint32(4, h1, true);
  resultView.setUint32(8, h2, true);
  resultView.setUint32(12, h3, true);
  resultView.setUint32(16, h4, true);

  return result;
}

export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

export function hash160Hex(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? hexToBytes(data) : data;
  return bytesToHex(hash160(bytes));
}

// ============================================================================
// Address Utilities
// ============================================================================

export function publicKeyToAddress(publicKey: string, network: NetworkType = 'mainnet'): string {
  const pubKeyBytes = hexToBytes(publicKey);
  const hash = hash160(pubKeyBytes);

  const version = ADDRESS_VERSIONS[network].p2pkh;
  const payload = new Uint8Array(21);
  payload[0] = version;
  payload.set(hash, 1);

  return base58CheckEncode(payload);
}

export function addressToHash160(address: string): string {
  const decoded = base58CheckDecode(address);
  return bytesToHex(decoded.slice(1));
}

export function isValidAddress(address: string, network?: NetworkType): boolean {
  try {
    const decoded = base58CheckDecode(address);
    if (decoded.length !== 21) return false;

    const version = decoded[0];
    if (network) {
      return version === ADDRESS_VERSIONS[network].p2pkh ||
             version === ADDRESS_VERSIONS[network].p2sh;
    }

    return Object.values(ADDRESS_VERSIONS).some(n =>
      n.p2pkh === version || n.p2sh === version
    );
  } catch {
    return false;
  }
}

export function getAddressType(address: string): 'p2pkh' | 'p2sh' | null {
  try {
    const decoded = base58CheckDecode(address);
    const version = decoded[0];

    for (const network of Object.values(ADDRESS_VERSIONS)) {
      if (version === network.p2pkh) return 'p2pkh';
      if (version === network.p2sh) return 'p2sh';
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// WIF (Wallet Import Format)
// ============================================================================

export function privateKeyToWIF(privateKey: string, compressed: boolean = true, network: NetworkType = 'mainnet'): string {
  const keyBytes = hexToBytes(privateKey);
  const version = ADDRESS_VERSIONS[network].wif;

  const payload = new Uint8Array(compressed ? 34 : 33);
  payload[0] = version;
  payload.set(keyBytes, 1);
  if (compressed) {
    payload[33] = 0x01;
  }

  return base58CheckEncode(payload);
}

export function wifToPrivateKey(wif: string): { privateKey: string; compressed: boolean; network: NetworkType } {
  const decoded = base58CheckDecode(wif);
  const version = decoded[0];

  let network: NetworkType;
  if (version === ADDRESS_VERSIONS.mainnet.wif) {
    network = 'mainnet';
  } else if (version === ADDRESS_VERSIONS.testnet.wif) {
    network = 'testnet';
  } else {
    throw new Error('Invalid WIF version');
  }

  const compressed = decoded.length === 34 && decoded[33] === 0x01;
  const privateKey = bytesToHex(decoded.slice(1, 33));

  return { privateKey, compressed, network };
}

export function isValidWIF(wif: string): boolean {
  try {
    wifToPrivateKey(wif);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Random Generation
// ============================================================================

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for non-browser environments
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export function randomHex(length: number): string {
  return bytesToHex(randomBytes(length));
}

export function generateId(length: number = 16): string {
  const bytes = randomBytes(length);
  return bytesToHex(bytes);
}

// ============================================================================
// Comparison Utilities
// ============================================================================

export function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export function secureZero(data: Uint8Array): void {
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
}
