/**
 * @b0ase/x402-revenue
 *
 * HTTP 402 Payment Required protocol for monetizing web content.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Payment method */
export type PaymentMethod = 'bsv' | 'lightning' | 'handcash' | 'paymail' | 'stripe';

/** Payment status */
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'expired';

/** Price model */
export type PriceModel = 'fixed' | 'per-request' | 'time-based' | 'streaming' | 'subscription';

/** Payment request */
export interface PaymentRequest {
  id: string;
  resource: string;
  amount: number;
  currency: string;
  methods: PaymentMethod[];
  priceModel: PriceModel;
  expiresAt: number;
  description?: string;
  metadata?: Record<string, unknown>;
  paymentDetails: PaymentDetails;
}

/** Payment details for each method */
export interface PaymentDetails {
  bsv?: {
    address: string;
    script?: string;
  };
  lightning?: {
    invoice: string;
    nodeId?: string;
  };
  handcash?: {
    handle: string;
    paymentId: string;
  };
  paymail?: {
    address: string;
  };
  stripe?: {
    sessionId: string;
    url: string;
  };
}

/** Payment receipt */
export interface PaymentReceipt {
  id: string;
  requestId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  txid?: string;
  paidAt: number;
  validUntil?: number;
}

/** Access token */
export interface AccessToken {
  token: string;
  resource: string;
  issuedAt: number;
  expiresAt: number;
  usageLimit?: number;
  usageCount: number;
}

/** 402 Response headers */
export interface X402Headers {
  'X-Payment-Required': 'true';
  'X-Payment-Methods': string;
  'X-Payment-Amount': string;
  'X-Payment-Currency': string;
  'X-Payment-Address'?: string;
  'X-Payment-Invoice'?: string;
  'X-Payment-Description'?: string;
  'X-Payment-Expires'?: string;
  'X-Payment-Request-Id': string;
}

/** Resource pricing config */
export interface PricingConfig {
  amount: number;
  currency: string;
  model: PriceModel;
  methods: PaymentMethod[];
  duration?: number; // For time-based access
  requestLimit?: number; // For per-request model
  description?: string;
}

/** Revenue stats */
export interface RevenueStats {
  totalRevenue: number;
  transactionCount: number;
  uniquePayers: number;
  byMethod: Record<PaymentMethod, number>;
  byResource: Record<string, number>;
  period: { start: number; end: number };
}

/** Manager options */
export interface X402Options {
  defaultMethods?: PaymentMethod[];
  defaultCurrency?: string;
  requestExpiry?: number;
  tokenExpiry?: number;
  onPaymentReceived?: (receipt: PaymentReceipt) => void;
}

// ============================================================================
// Constants
// ============================================================================

export const HTTP_402_STATUS = 402;
export const DEFAULT_EXPIRY = 3600000; // 1 hour
export const DEFAULT_CURRENCY = 'USD';

// ============================================================================
// X402 Revenue Manager
// ============================================================================

export class X402RevenueManager {
  private options: Required<X402Options>;
  private requests: Map<string, PaymentRequest> = new Map();
  private receipts: Map<string, PaymentReceipt> = new Map();
  private tokens: Map<string, AccessToken> = new Map();
  private pricing: Map<string, PricingConfig> = new Map();

  constructor(options: X402Options = {}) {
    this.options = {
      defaultMethods: options.defaultMethods || ['bsv', 'handcash'],
      defaultCurrency: options.defaultCurrency || DEFAULT_CURRENCY,
      requestExpiry: options.requestExpiry || DEFAULT_EXPIRY,
      tokenExpiry: options.tokenExpiry || DEFAULT_EXPIRY * 24,
      onPaymentReceived: options.onPaymentReceived || (() => {}),
    };
  }

  // ==========================================================================
  // Resource Pricing
  // ==========================================================================

  setResourcePrice(resource: string, config: PricingConfig): void {
    this.pricing.set(resource, config);
  }

  getResourcePrice(resource: string): PricingConfig | undefined {
    // Check exact match
    if (this.pricing.has(resource)) {
      return this.pricing.get(resource);
    }

    // Check wildcard patterns
    for (const [pattern, config] of this.pricing) {
      if (this.matchPattern(resource, pattern)) {
        return config;
      }
    }

    return undefined;
  }

  removeResourcePrice(resource: string): boolean {
    return this.pricing.delete(resource);
  }

  private matchPattern(resource: string, pattern: string): boolean {
    if (!pattern.includes('*')) return resource === pattern;

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(resource);
  }

  // ==========================================================================
  // Payment Requests
  // ==========================================================================

  createPaymentRequest(resource: string, paymentDetails: PaymentDetails): PaymentRequest {
    const config = this.getResourcePrice(resource);
    if (!config) {
      throw new Error(`No pricing configured for resource: ${resource}`);
    }

    const id = this.generateId('req');
    const request: PaymentRequest = {
      id,
      resource,
      amount: config.amount,
      currency: config.currency,
      methods: config.methods,
      priceModel: config.model,
      expiresAt: Date.now() + this.options.requestExpiry,
      description: config.description,
      paymentDetails,
    };

    this.requests.set(id, request);
    return request;
  }

  getPaymentRequest(id: string): PaymentRequest | undefined {
    return this.requests.get(id);
  }

  isRequestValid(id: string): boolean {
    const request = this.requests.get(id);
    if (!request) return false;
    return Date.now() < request.expiresAt;
  }

  // ==========================================================================
  // Payment Verification
  // ==========================================================================

  async verifyPayment(
    requestId: string,
    method: PaymentMethod,
    proof: { txid?: string; signature?: string }
  ): Promise<PaymentReceipt | null> {
    const request = this.requests.get(requestId);
    if (!request) return null;

    if (!this.isRequestValid(requestId)) return null;

    // In production, verify the actual payment on-chain or via API
    // For now, assume valid if proof is provided
    if (!proof.txid && !proof.signature) return null;

    const receipt: PaymentReceipt = {
      id: this.generateId('rcpt'),
      requestId,
      method,
      amount: request.amount,
      currency: request.currency,
      txid: proof.txid,
      paidAt: Date.now(),
      validUntil: request.priceModel === 'time-based'
        ? Date.now() + (this.getResourcePrice(request.resource)?.duration || DEFAULT_EXPIRY)
        : undefined,
    };

    this.receipts.set(receipt.id, receipt);
    this.options.onPaymentReceived(receipt);

    return receipt;
  }

  getReceipt(id: string): PaymentReceipt | undefined {
    return this.receipts.get(id);
  }

  // ==========================================================================
  // Access Tokens
  // ==========================================================================

  createAccessToken(receipt: PaymentReceipt): AccessToken {
    const request = this.requests.get(receipt.requestId);
    if (!request) {
      throw new Error('Invalid receipt');
    }

    const config = this.getResourcePrice(request.resource);
    const token: AccessToken = {
      token: this.generateToken(),
      resource: request.resource,
      issuedAt: Date.now(),
      expiresAt: receipt.validUntil || Date.now() + this.options.tokenExpiry,
      usageLimit: config?.requestLimit,
      usageCount: 0,
    };

    this.tokens.set(token.token, token);
    return token;
  }

  validateToken(token: string, resource: string): boolean {
    const accessToken = this.tokens.get(token);
    if (!accessToken) return false;

    if (Date.now() > accessToken.expiresAt) {
      this.tokens.delete(token);
      return false;
    }

    if (!this.matchPattern(resource, accessToken.resource)) {
      return false;
    }

    if (accessToken.usageLimit && accessToken.usageCount >= accessToken.usageLimit) {
      return false;
    }

    accessToken.usageCount++;
    return true;
  }

  revokeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  // ==========================================================================
  // HTTP Response Helpers
  // ==========================================================================

  create402Response(resource: string, paymentDetails: PaymentDetails): {
    status: 402;
    headers: X402Headers;
    body: PaymentRequest;
  } {
    const request = this.createPaymentRequest(resource, paymentDetails);

    const headers: X402Headers = {
      'X-Payment-Required': 'true',
      'X-Payment-Methods': request.methods.join(','),
      'X-Payment-Amount': request.amount.toString(),
      'X-Payment-Currency': request.currency,
      'X-Payment-Request-Id': request.id,
    };

    if (paymentDetails.bsv?.address) {
      headers['X-Payment-Address'] = paymentDetails.bsv.address;
    }

    if (paymentDetails.lightning?.invoice) {
      headers['X-Payment-Invoice'] = paymentDetails.lightning.invoice;
    }

    if (request.description) {
      headers['X-Payment-Description'] = request.description;
    }

    headers['X-Payment-Expires'] = new Date(request.expiresAt).toISOString();

    return {
      status: HTTP_402_STATUS,
      headers,
      body: request,
    };
  }

  parsePaymentHeader(authorization: string): { token?: string; receipt?: string } | null {
    if (!authorization) return null;

    if (authorization.startsWith('X402-Token ')) {
      return { token: authorization.slice(11) };
    }

    if (authorization.startsWith('X402-Receipt ')) {
      return { receipt: authorization.slice(13) };
    }

    return null;
  }

  // ==========================================================================
  // Analytics
  // ==========================================================================

  getRevenueStats(startTime?: number, endTime?: number): RevenueStats {
    const start = startTime || 0;
    const end = endTime || Date.now();

    const receipts = Array.from(this.receipts.values()).filter(
      (r) => r.paidAt >= start && r.paidAt <= end
    );

    const byMethod: Record<PaymentMethod, number> = {
      bsv: 0,
      lightning: 0,
      handcash: 0,
      paymail: 0,
      stripe: 0,
    };

    const byResource: Record<string, number> = {};
    const payers = new Set<string>();

    for (const receipt of receipts) {
      byMethod[receipt.method] += receipt.amount;

      const request = this.requests.get(receipt.requestId);
      if (request) {
        byResource[request.resource] = (byResource[request.resource] || 0) + receipt.amount;
      }

      if (receipt.txid) {
        payers.add(receipt.txid.slice(0, 20)); // Approximate unique payers
      }
    }

    return {
      totalRevenue: receipts.reduce((sum, r) => sum + r.amount, 0),
      transactionCount: receipts.length,
      uniquePayers: payers.size,
      byMethod,
      byResource,
      period: { start, end },
    };
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  cleanup(): void {
    const now = Date.now();

    for (const [id, request] of this.requests) {
      if (now > request.expiresAt) {
        this.requests.delete(id);
      }
    }

    for (const [token, accessToken] of this.tokens) {
      if (now > accessToken.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createX402Manager(options?: X402Options): X402RevenueManager {
  return new X402RevenueManager(options);
}

// ============================================================================
// Middleware Helpers
// ============================================================================

/**
 * Create middleware for 402 protection
 */
export function createPaywall(
  manager: X402RevenueManager,
  getPaymentDetails: (resource: string) => PaymentDetails
): (resource: string, token?: string) => { allowed: boolean; response?: ReturnType<X402RevenueManager['create402Response']> } {
  return (resource: string, token?: string) => {
    if (token && manager.validateToken(token, resource)) {
      return { allowed: true };
    }

    const pricing = manager.getResourcePrice(resource);
    if (!pricing) {
      return { allowed: true }; // No pricing = free access
    }

    const paymentDetails = getPaymentDetails(resource);
    return {
      allowed: false,
      response: manager.create402Response(resource, paymentDetails),
    };
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string): string {
  if (currency === 'sats' || currency === 'SAT') {
    return `${amount} sats`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Convert between currencies (simplified)
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const fromRate = rates[from.toUpperCase()] || 1;
  const toRate = rates[to.toUpperCase()] || 1;
  return (amount / fromRate) * toRate;
}
