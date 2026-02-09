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
/** Signature encoding format */
type SignatureEncoding = 'base64' | 'hex' | 'der';
/** Signing algorithm */
type SigningAlgorithm = 'ecdsa' | 'schnorr';
/** Message signing request */
interface SigningRequest {
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
interface SignedMessage {
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
interface VerificationResult {
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
interface SigningOptions {
    /** Signature encoding (default: base64) */
    encoding?: SignatureEncoding;
    /** Algorithm (default: ecdsa) */
    algorithm?: SigningAlgorithm;
    /** Include timestamp in message */
    includeTimestamp?: boolean;
    /** Message prefix */
    prefix?: string;
}
/** Bitcoin signed message prefix */
declare const BITCOIN_SIGNED_MESSAGE_PREFIX = "Bitcoin Signed Message:\n";
/** BSV signed message prefix */
declare const BSV_SIGNED_MESSAGE_PREFIX = "Bitcoin Signed Message:\n";
/**
 * Generate a random nonce
 */
declare function generateNonce(length?: number): string;
/**
 * Create a signing request
 */
declare function createSigningRequest(options: {
    message: string;
    address: string;
    purpose?: string;
    expiresInMs?: number;
}): SigningRequest;
/**
 * Format message for signing (with optional prefix)
 */
declare function formatMessageForSigning(message: string, options?: {
    includeTimestamp?: boolean;
    includeNonce?: boolean;
    nonce?: string;
    prefix?: string;
}): string;
/**
 * Create a signed message object
 */
declare function formatSignedMessage(options: {
    message: string;
    address: string;
    signature: string;
    encoding?: SignatureEncoding;
    algorithm?: SigningAlgorithm;
    publicKey?: string;
}): SignedMessage;
/**
 * Verify signature format (not cryptographic verification)
 */
declare function verifySignatureFormat(signature: string, encoding?: SignatureEncoding): {
    valid: boolean;
    error?: string;
};
/**
 * Verify Bitcoin address format
 */
declare function verifyAddressFormat(address: string): {
    valid: boolean;
    type?: 'legacy' | 'bech32' | 'bech32m';
    error?: string;
};
/**
 * Parse a signed message string (Bitcoin Core format)
 */
declare function parseSignedMessageString(signedMessageStr: string): {
    address?: string;
    message?: string;
    signature?: string;
    error?: string;
};
/**
 * Format as Bitcoin Core signed message
 */
declare function formatAsBitcoinSignedMessage(message: string, address: string, signature: string): string;
/**
 * Hash message for signing (double SHA-256 with prefix)
 * Note: This is a placeholder - actual implementation needs crypto library
 */
declare function getMessageHash(message: string): string;
/**
 * Create a challenge message for authentication
 */
declare function createAuthChallenge(options: {
    domain: string;
    address: string;
    action?: string;
    expiresInMs?: number;
}): {
    challenge: string;
    request: SigningRequest;
};

export { BITCOIN_SIGNED_MESSAGE_PREFIX, BSV_SIGNED_MESSAGE_PREFIX, type SignatureEncoding, type SignedMessage, type SigningAlgorithm, type SigningOptions, type SigningRequest, type VerificationResult, createAuthChallenge, createSigningRequest, formatAsBitcoinSignedMessage, formatMessageForSigning, formatSignedMessage, generateNonce, getMessageHash, parseSignedMessageString, verifyAddressFormat, verifySignatureFormat };
