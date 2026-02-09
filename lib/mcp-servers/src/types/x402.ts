/**
 * x402 Protocol Types
 *
 * Compatible with Coinbase x402 specification.
 * PATH402.com extensions for BSV inscription and multi-chain verification.
 *
 * @see https://path402.com/402 for full specification
 * @see https://path402.com/.well-known/x402.json for discovery
 */

// ── Supported Networks ─────────────────────────────────────────────

export type SupportedNetwork = 'bsv' | 'base' | 'solana' | 'ethereum';

export type PaymentScheme = 'exact' | 'upto';

// ── Payment Authorization ──────────────────────────────────────────

export interface PaymentAuthorization {
  from: string;           // Payer address
  to: string;             // Recipient address
  value: string;          // Amount in smallest unit
  validAfter: string;     // Unix timestamp
  validBefore: string;    // Unix timestamp
  nonce: string;          // Unique nonce for replay protection
}

export interface PaymentPayload {
  signature: string;
  authorization: PaymentAuthorization;
}

// ── Verify Request/Response ────────────────────────────────────────

export interface X402VerifyRequest {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  payload: PaymentPayload;
  inscribe?: boolean;     // PATH402 extension: inscribe on BSV
}

export interface X402VerifyResponse {
  [key: string]: unknown;  // MCP compatibility
  valid: boolean;
  invalidReason?: string;
  // PATH402 extensions
  inscriptionId?: string;
  inscriptionTxId?: string;
  fee?: {
    verification: number;
    inscription: number;
    total: number;
  };
}

// ── Settle Request/Response ────────────────────────────────────────

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

export interface X402SettleRequest {
  x402Version: number;
  scheme: PaymentScheme;
  network: SupportedNetwork;
  payload: PaymentPayload;
  paymentRequirements?: Partial<PaymentRequirements>;
  settleOn?: SupportedNetwork;  // PATH402: choose settlement chain
}

export interface X402SettleResponse {
  [key: string]: unknown;  // MCP compatibility
  success: boolean;
  error?: string;
  transaction?: string;
  network?: SupportedNetwork;
  // PATH402 extensions
  inscriptionId?: string;
  inscriptionTxId?: string;
  settlementChain?: SupportedNetwork;
  fee?: {
    settlement: number;
    inscription: number;
    total: number;
    currency: string;
  };
  costComparison?: {
    bsv: number;
    base: number;
    solana: number;
    ethereum: number;
    cheapest: SupportedNetwork;
  };
}

// ── Inscription ────────────────────────────────────────────────────

export interface X402InscriptionProof {
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

export interface X402Inscription {
  id: string;
  txId: string;
  blockHeight?: number;
  timestamp: number;
  fee: number;
  proof: X402InscriptionProof;
  explorerUrl: string;
}

export interface X402InscriptionResponse {
  [key: string]: unknown;  // MCP compatibility
  id: string;
  txId: string;
  blockHeight?: number;
  timestamp: number;
  fee: number;
  proof: X402InscriptionProof;
  explorerUrl: string;
}

// ── Stats ──────────────────────────────────────────────────────────

export interface X402FacilitatorStats {
  [key: string]: unknown;  // MCP compatibility
  facilitator: string;
  version: string;
  status: string;
  stats: {
    totalInscriptions: number;
    totalFeesCollected: number;
    byOriginChain: Record<SupportedNetwork, number>;
  };
  supportedNetworks: Array<{
    network: string;
    name: string;
    chainId?: number;
    explorerUrl: string;
  }>;
  fees: {
    verification: {
      amount: number;
      currency: string;
    };
    inscription: {
      amount: number;
      currency: string;
    };
    settlement: {
      percent: number;
      minimum: number;
      currency: string;
    };
  };
  endpoints: {
    verify: string;
    settle: string;
    inscription: string;
    stats: string;
    discovery: string;
  };
}

// ── Discovery Document ─────────────────────────────────────────────

export interface X402Discovery {
  [key: string]: unknown;  // MCP compatibility
  x402Version: number;
  facilitator: {
    name: string;
    description: string;
    website: string;
    documentation: string;
  };
  supportedNetworks: SupportedNetwork[];
  supportedSchemes: PaymentScheme[];
  supportedAssets: Record<SupportedNetwork, string[]>;
  endpoints: {
    verify: string;
    settle: string;
    inscription: string;
    stats: string;
  };
  fees: {
    verification: {
      amount: number;
      currency: string;
      description: string;
    };
    inscription: {
      amount: number;
      currency: string;
      description: string;
    };
    settlement: {
      percent: number;
      minimum: number;
      currency: string;
      description: string;
    };
  };
  token?: {
    symbol: string;
    name: string;
    protocol: string;
    inscriptionId?: string;
    totalSupply: number;
    decimals: number;
    marketUrl?: string;
  };
  pricing?: {
    model: string;
    formula: string;
    basePriceSats: number;
    currentPriceSats: number;
    treasuryRemaining: number;
  };
  features: {
    multiChainVerification: boolean;
    bsvInscription: boolean;
    crossChainSettlement: boolean;
    cheapestRouting: boolean;
    dividendDistribution?: boolean;
  };
  license: string;
  licenseUrl: string;
}

// ── Fee Constants ──────────────────────────────────────────────────

export const X402_FEES = {
  verification: 200,        // sats
  inscription: 500,         // sats
  settlementPercent: 0.001, // 0.1%
  routingPercent: 0.0005,   // 0.05%
} as const;

// ── Network Configuration ──────────────────────────────────────────

export const NETWORK_CONFIG: Record<SupportedNetwork, {
  name: string;
  chainId?: number;
  explorerUrl: string;
  explorerTxPath: string;
}> = {
  bsv: {
    name: 'Bitcoin SV',
    explorerUrl: 'https://whatsonchain.com',
    explorerTxPath: '/tx/',
  },
  base: {
    name: 'Base',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    explorerTxPath: '/tx/',
  },
  solana: {
    name: 'Solana',
    explorerUrl: 'https://solscan.io',
    explorerTxPath: '/tx/',
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    explorerTxPath: '/tx/',
  },
};

// ── Supported Assets ───────────────────────────────────────────────

export const SUPPORTED_ASSETS: Record<SupportedNetwork, string[]> = {
  bsv: ['BSV', 'PATH402'],
  base: ['USDC', 'ETH'],
  solana: ['USDC', 'SOL'],
  ethereum: ['USDC', 'ETH', 'USDT'],
};
