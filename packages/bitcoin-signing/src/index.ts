/**
 * @b0ase/bitcoin-signing
 *
 * BSV message signing and verification utilities.
 * Provides type-safe interfaces for Bitcoin message signing.
 *
 * @example
 * ```typescript
 * import {
 *   createSigningRequest,
 *   verifySignatureFormat,
 *   formatSignedMessage,
 * } from '@b0ase/bitcoin-signing';
 *
 * // Create a signing request
 * const request = createSigningRequest({
 *   message: 'I agree to the terms of service',
 *   address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
 *   purpose: 'terms-agreement',
 * });
 *
 * // After signing with wallet
 * const signedMessage = formatSignedMessage({
 *   message: request.message,
 *   address: request.address,
 *   signature: 'H+signature...',
 * });
 * ```
 *
 * Note: Actual cryptographic signing requires @bsv/sdk or wallet integration.
 * This package provides the type-safe wrapper and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Signature encoding format */
export type SignatureEncoding = 'base64' | 'hex' | 'der';

/** Signing algorithm */
export type SigningAlgorithm = 'ecdsa' | 'schnorr';

/** Message signing request */
export interface SigningRequest {
  /** Message to sign */
  message: string;
  /** Signer's address */
  address: string;
  /** Purpose/context for the signature */
  purpose?: string;
  /** Timestamp of request */
  timestamp: Date;
  /** Nonce for uniqueness */
  nonce: string;
  /** Expiry time */
  expiresAt?: Date;
}

/** Signed message */
export interface SignedMessage {
  /** Original message */
  message: string;
  /** Signer's address */
  address: string;
  /** Signature */
  signature: string;
  /** Signature encoding */
  encoding: SignatureEncoding;
  /** Algorithm used */
  algorithm: SigningAlgorithm;
  /** Timestamp when signed */
  signedAt: Date;
  /** Public key (if available) */
  publicKey?: string;
}

/** Verification result */
export interface VerificationResult {
  /** Is signature valid */
  valid: boolean;
  /** Recovered address (if recoverable) */
  recoveredAddress?: string;
  /** Address matches */
  addressMatches?: boolean;
  /** Error message if invalid */
  error?: string;
}

/** Signing options */
export interface SigningOptions {
  /** Signature encoding (default: base64) */
  encoding?: SignatureEncoding;
  /** Algorithm (default: ecdsa) */
  algorithm?: SigningAlgorithm;
  /** Include timestamp in message */
  includeTimestamp?: boolean;
  /** Message prefix */
  prefix?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Bitcoin signed message prefix */
export const BITCOIN_SIGNED_MESSAGE_PREFIX = 'Bitcoin Signed Message:\n';

/** BSV signed message prefix */
export const BSV_SIGNED_MESSAGE_PREFIX = 'Bitcoin Signed Message:\n';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random nonce
 */
export function generateNonce(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a signing request
 */
export function createSigningRequest(options: {
  message: string;
  address: string;
  purpose?: string;
  expiresInMs?: number;
}): SigningRequest {
  const now = new Date();
  return {
    message: options.message,
    address: options.address,
    purpose: options.purpose,
    timestamp: now,
    nonce: generateNonce(),
    expiresAt: options.expiresInMs
      ? new Date(now.getTime() + options.expiresInMs)
      : undefined,
  };
}

/**
 * Format message for signing (with optional prefix)
 */
export function formatMessageForSigning(
  message: string,
  options?: {
    includeTimestamp?: boolean;
    includeNonce?: boolean;
    nonce?: string;
    prefix?: string;
  }
): string {
  let formatted = message;

  if (options?.prefix) {
    formatted = `${options.prefix}${formatted}`;
  }

  if (options?.includeTimestamp) {
    formatted = `${formatted}\nTimestamp: ${new Date().toISOString()}`;
  }

  if (options?.includeNonce) {
    const nonce = options.nonce || generateNonce();
    formatted = `${formatted}\nNonce: ${nonce}`;
  }

  return formatted;
}

/**
 * Create a signed message object
 */
export function formatSignedMessage(options: {
  message: string;
  address: string;
  signature: string;
  encoding?: SignatureEncoding;
  algorithm?: SigningAlgorithm;
  publicKey?: string;
}): SignedMessage {
  return {
    message: options.message,
    address: options.address,
    signature: options.signature,
    encoding: options.encoding || 'base64',
    algorithm: options.algorithm || 'ecdsa',
    signedAt: new Date(),
    publicKey: options.publicKey,
  };
}

/**
 * Verify signature format (not cryptographic verification)
 */
export function verifySignatureFormat(
  signature: string,
  encoding: SignatureEncoding = 'base64'
): { valid: boolean; error?: string } {
  if (!signature || signature.length === 0) {
    return { valid: false, error: 'Empty signature' };
  }

  switch (encoding) {
    case 'base64':
      // Base64 should only contain these characters
      if (!/^[A-Za-z0-9+/]+=*$/.test(signature)) {
        return { valid: false, error: 'Invalid base64 encoding' };
      }
      // Bitcoin signatures are typically 65 bytes = 88 base64 chars
      if (signature.length < 80 || signature.length > 100) {
        return { valid: false, error: 'Unexpected signature length for base64' };
      }
      break;

    case 'hex':
      if (!/^[0-9a-fA-F]+$/.test(signature)) {
        return { valid: false, error: 'Invalid hex encoding' };
      }
      // 65 bytes = 130 hex chars
      if (signature.length < 128 || signature.length > 150) {
        return { valid: false, error: 'Unexpected signature length for hex' };
      }
      break;

    case 'der':
      if (!/^[0-9a-fA-F]+$/.test(signature)) {
        return { valid: false, error: 'Invalid DER encoding (should be hex)' };
      }
      // DER signatures vary in length
      if (signature.length < 140 || signature.length > 160) {
        return { valid: false, error: 'Unexpected DER signature length' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Verify Bitcoin address format
 */
export function verifyAddressFormat(address: string): {
  valid: boolean;
  type?: 'legacy' | 'bech32' | 'bech32m';
  error?: string;
} {
  if (!address || address.length === 0) {
    return { valid: false, error: 'Empty address' };
  }

  // Legacy P2PKH (starts with 1)
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return { valid: true, type: 'legacy' };
  }

  // Legacy P2SH (starts with 3)
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return { valid: true, type: 'legacy' };
  }

  // Bech32 (starts with bc1q)
  if (/^bc1q[a-z0-9]{38,58}$/.test(address)) {
    return { valid: true, type: 'bech32' };
  }

  // Bech32m (starts with bc1p)
  if (/^bc1p[a-z0-9]{38,58}$/.test(address)) {
    return { valid: true, type: 'bech32m' };
  }

  return { valid: false, error: 'Unrecognized address format' };
}

/**
 * Parse a signed message string (Bitcoin Core format)
 */
export function parseSignedMessageString(signedMessageStr: string): {
  address?: string;
  message?: string;
  signature?: string;
  error?: string;
} {
  const lines = signedMessageStr.trim().split('\n');

  let address: string | undefined;
  let message: string | undefined;
  let signature: string | undefined;
  let inMessage = false;
  let messageLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('-----BEGIN BITCOIN SIGNED MESSAGE-----')) {
      inMessage = true;
      continue;
    }
    if (line.startsWith('-----BEGIN SIGNATURE-----')) {
      inMessage = false;
      message = messageLines.join('\n');
      continue;
    }
    if (line.startsWith('-----END BITCOIN SIGNED MESSAGE-----')) {
      continue;
    }
    if (inMessage) {
      messageLines.push(line);
    } else if (!address && line.length > 0 && !line.startsWith('-----')) {
      // First non-empty line after BEGIN SIGNATURE is the address
      address = line;
    } else if (address && !signature && line.length > 0 && !line.startsWith('-----')) {
      signature = line;
    }
  }

  if (!address || !message || !signature) {
    return { error: 'Could not parse signed message format' };
  }

  return { address, message, signature };
}

/**
 * Format as Bitcoin Core signed message
 */
export function formatAsBitcoinSignedMessage(
  message: string,
  address: string,
  signature: string
): string {
  return `-----BEGIN BITCOIN SIGNED MESSAGE-----
${message}
-----BEGIN SIGNATURE-----
${address}
${signature}
-----END BITCOIN SIGNED MESSAGE-----`;
}

/**
 * Hash message for signing (double SHA-256 with prefix)
 * Note: This is a placeholder - actual implementation needs crypto library
 */
export function getMessageHash(message: string): string {
  // Format: length(prefix) + prefix + length(message) + message
  // Then double SHA-256
  // This is a placeholder - real implementation needs @bsv/sdk
  const prefixed = `${BSV_SIGNED_MESSAGE_PREFIX}${message}`;
  return `hash:${prefixed.length}:${message.substring(0, 8)}...`;
}

/**
 * Create a challenge message for authentication
 */
export function createAuthChallenge(options: {
  domain: string;
  address: string;
  action?: string;
  expiresInMs?: number;
}): {
  challenge: string;
  request: SigningRequest;
} {
  const nonce = generateNonce(32);
  const timestamp = new Date().toISOString();
  const action = options.action || 'authenticate';

  const challenge = [
    `${options.domain} wants you to sign in with your Bitcoin address:`,
    options.address,
    '',
    `Action: ${action}`,
    `Nonce: ${nonce}`,
    `Issued At: ${timestamp}`,
  ].join('\n');

  const request = createSigningRequest({
    message: challenge,
    address: options.address,
    purpose: action,
    expiresInMs: options.expiresInMs || 5 * 60 * 1000, // 5 minutes default
  });

  return { challenge, request };
}
