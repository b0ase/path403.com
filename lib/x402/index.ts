// x402 Facilitator - Main exports
// PATH402.com: The x402 Notary for BSV

export * from './types';
export * from './verify';
export * from './inscription';

// Re-export commonly used items
export {
  FEES,
  SUPPORTED_ASSETS,
  NETWORK_CONFIG,
  type SupportedNetwork,
  type PaymentRequirements,
  type PaymentPayload,
  type VerifyRequest,
  type VerifyResponse,
  type SettleRequest,
  type SettleResponse,
  type X402Inscription,
} from './types';

export {
  verifyPayment,
  checkNonce,
} from './verify';

export {
  createInscription,
  getInscription,
  getInscriptionsByOrigin,
  getInscriptionStats,
  calculateInscriptionFee,
} from './inscription';
