// x402 Protocol Types
// Compatible with Coinbase x402 specification

export type SupportedNetwork = 'bsv' | 'base' | 'solana' | 'ethereum';

export type PaymentScheme = 'exact' | 'upto';

export interface PaymentRequirements {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  maxAmountRequired: string;
  resource: string;
  description?: string;
  mimeType?: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, unknown>;
}

export interface PaymentPayload {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export interface VerifyRequest {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  payload: PaymentPayload['payload'];
}

export interface VerifyResponse {
  valid: boolean;
  invalidReason?: string;
  // PATH402 extensions
  inscriptionId?: string;
  inscriptionTxId?: string;
}

export interface SettleRequest {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  payload: PaymentPayload['payload'];
  paymentRequirements: PaymentRequirements;
}

export interface SettleResponse {
  success: boolean;
  error?: string;
  transaction?: string;
  network?: SupportedNetwork;
  // PATH402 extensions
  inscriptionId?: string;
  inscriptionTxId?: string;
  settlementChain?: SupportedNetwork;
  fee?: {
    amount: number;
    currency: string;
  };
}

// PATH402 Inscription Schema
export interface X402Inscription {
  p: 'x402-notary';
  v: number;
  origin: {
    chain: SupportedNetwork;
    txId: string;
    block?: number;
  };
  payment: {
    from: string;
    to: string;
    amount: string;
    asset: string;
    timestamp: number;
  };
  signature: string;
  facilitator: string;
  settlementChain?: SupportedNetwork;
  settlementTxId?: string;
}

// Fee structure
export const FEES = {
  inscription: 500, // sats
  verification: 200, // sats
  settlementPercent: 0.001, // 0.1%
  routingPercent: 0.0005, // 0.05%
} as const;

// Supported assets by network
export const SUPPORTED_ASSETS: Record<SupportedNetwork, string[]> = {
  bsv: ['BSV', 'PATH402.com'],
  base: ['USDC', 'ETH'],
  solana: ['USDC', 'SOL'],
  ethereum: ['USDC', 'ETH', 'USDT'],
};

// Network configuration
export const NETWORK_CONFIG: Record<SupportedNetwork, {
  name: string;
  chainId?: number;
  rpcUrl?: string;
  explorerUrl: string;
}> = {
  bsv: {
    name: 'Bitcoin SV',
    explorerUrl: 'https://whatsonchain.com/tx/',
  },
  base: {
    name: 'Base',
    chainId: 8453,
    explorerUrl: 'https://basescan.org/tx/',
  },
  solana: {
    name: 'Solana',
    explorerUrl: 'https://solscan.io/tx/',
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io/tx/',
  },
};
