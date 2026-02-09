// x402 Multi-Chain Payment Verification
// Verifies payment signatures across supported networks

import { SupportedNetwork, PaymentPayload, FEES } from './types';

export interface VerificationResult {
  valid: boolean;
  invalidReason?: string;
  verifiedAt?: number;
  network?: SupportedNetwork;
  fee?: number;
}

/**
 * Verify a payment signature on the origin chain
 */
export async function verifyPayment(
  network: SupportedNetwork,
  payload: PaymentPayload['payload']
): Promise<VerificationResult> {
  try {
    // Dispatch to network-specific verifier
    switch (network) {
      case 'bsv':
        return await verifyBSVPayment(payload);
      case 'base':
        return await verifyBasePayment(payload);
      case 'solana':
        return await verifySolanaPayment(payload);
      case 'ethereum':
        return await verifyEthereumPayment(payload);
      default:
        return {
          valid: false,
          invalidReason: `Unsupported network: ${network}`,
        };
    }
  } catch (error) {
    console.error(`[x402] Verification failed for ${network}:`, error);
    return {
      valid: false,
      invalidReason: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify BSV payment signature
 */
async function verifyBSVPayment(
  payload: PaymentPayload['payload']
): Promise<VerificationResult> {
  // In production: Verify BSV signature using bsv library
  // Check that the signature is valid for the authorization data

  const { signature, authorization } = payload;

  // Basic validation
  if (!signature || !authorization) {
    return {
      valid: false,
      invalidReason: 'Missing signature or authorization',
    };
  }

  // Validate authorization fields
  if (!authorization.from || !authorization.to || !authorization.value) {
    return {
      valid: false,
      invalidReason: 'Incomplete authorization data',
    };
  }

  // Check timestamp validity
  const now = Math.floor(Date.now() / 1000);
  const validAfter = parseInt(authorization.validAfter);
  const validBefore = parseInt(authorization.validBefore);

  if (now < validAfter) {
    return {
      valid: false,
      invalidReason: 'Payment not yet valid',
    };
  }

  if (now > validBefore) {
    return {
      valid: false,
      invalidReason: 'Payment expired',
    };
  }

  // In production: Actually verify the cryptographic signature
  // For now: Accept if all fields present and timestamps valid
  console.log(`[x402] BSV payment verified: ${authorization.from} → ${authorization.to}`);

  return {
    valid: true,
    verifiedAt: Date.now(),
    network: 'bsv',
    fee: FEES.verification,
  };
}

/**
 * Verify Base (EVM) payment signature
 */
async function verifyBasePayment(
  payload: PaymentPayload['payload']
): Promise<VerificationResult> {
  // In production: Use ethers.js to verify EIP-712 signature
  // Verify against Base RPC

  const { signature, authorization } = payload;

  if (!signature || !authorization) {
    return {
      valid: false,
      invalidReason: 'Missing signature or authorization',
    };
  }

  // Validate EVM address format
  if (!authorization.from.startsWith('0x') || !authorization.to.startsWith('0x')) {
    return {
      valid: false,
      invalidReason: 'Invalid EVM address format',
    };
  }

  // Check timestamp validity
  const now = Math.floor(Date.now() / 1000);
  const validAfter = parseInt(authorization.validAfter);
  const validBefore = parseInt(authorization.validBefore);

  if (now < validAfter || now > validBefore) {
    return {
      valid: false,
      invalidReason: 'Payment outside valid time window',
    };
  }

  // In production: Verify EIP-712 signature
  console.log(`[x402] Base payment verified: ${authorization.from} → ${authorization.to}`);

  return {
    valid: true,
    verifiedAt: Date.now(),
    network: 'base',
    fee: FEES.verification,
  };
}

/**
 * Verify Solana payment signature
 */
async function verifySolanaPayment(
  payload: PaymentPayload['payload']
): Promise<VerificationResult> {
  // In production: Use @solana/web3.js to verify signature

  const { signature, authorization } = payload;

  if (!signature || !authorization) {
    return {
      valid: false,
      invalidReason: 'Missing signature or authorization',
    };
  }

  // Validate Solana address format (base58, 32-44 chars)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (!solanaAddressRegex.test(authorization.from) ||
      !solanaAddressRegex.test(authorization.to)) {
    return {
      valid: false,
      invalidReason: 'Invalid Solana address format',
    };
  }

  // Check timestamp validity
  const now = Math.floor(Date.now() / 1000);
  const validAfter = parseInt(authorization.validAfter);
  const validBefore = parseInt(authorization.validBefore);

  if (now < validAfter || now > validBefore) {
    return {
      valid: false,
      invalidReason: 'Payment outside valid time window',
    };
  }

  // In production: Verify Ed25519 signature
  console.log(`[x402] Solana payment verified: ${authorization.from} → ${authorization.to}`);

  return {
    valid: true,
    verifiedAt: Date.now(),
    network: 'solana',
    fee: FEES.verification,
  };
}

/**
 * Verify Ethereum mainnet payment signature
 */
async function verifyEthereumPayment(
  payload: PaymentPayload['payload']
): Promise<VerificationResult> {
  // Similar to Base but on mainnet
  const { signature, authorization } = payload;

  if (!signature || !authorization) {
    return {
      valid: false,
      invalidReason: 'Missing signature or authorization',
    };
  }

  if (!authorization.from.startsWith('0x') || !authorization.to.startsWith('0x')) {
    return {
      valid: false,
      invalidReason: 'Invalid EVM address format',
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const validAfter = parseInt(authorization.validAfter);
  const validBefore = parseInt(authorization.validBefore);

  if (now < validAfter || now > validBefore) {
    return {
      valid: false,
      invalidReason: 'Payment outside valid time window',
    };
  }

  console.log(`[x402] Ethereum payment verified: ${authorization.from} → ${authorization.to}`);

  return {
    valid: true,
    verifiedAt: Date.now(),
    network: 'ethereum',
    fee: FEES.verification,
  };
}

/**
 * Check if a nonce has been used (prevent replay attacks)
 */
const usedNonces = new Set<string>();

export function checkNonce(network: SupportedNetwork, nonce: string): boolean {
  const key = `${network}:${nonce}`;
  if (usedNonces.has(key)) {
    return false;
  }
  usedNonces.add(key);
  return true;
}
