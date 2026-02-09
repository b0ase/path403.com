/**
 * @b0ase/stripe-bsv-bridge
 *
 * Fiat onramp for BSV via Stripe payment processing.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Supported fiat currencies */
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF';

/** Payment status */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

/** BSV delivery status */
export type DeliveryStatus =
  | 'pending'
  | 'queued'
  | 'broadcasting'
  | 'confirmed'
  | 'failed';

/** Price quote */
export interface PriceQuote {
  id: string;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  bsvAmount: number;
  exchangeRate: number;
  fee: number;
  feePercent: number;
  totalFiat: number;
  expiresAt: Date;
  createdAt: Date;
}

/** Purchase order */
export interface PurchaseOrder {
  id: string;
  userId?: string;
  quote: PriceQuote;
  destinationAddress: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  bsvTxid?: string;
  bsvConfirmations?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/** Stripe session config */
export interface StripeSessionConfig {
  orderId: string;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/** Stripe session response */
export interface StripeSessionResponse {
  sessionId: string;
  url: string;
}

/** Webhook event type */
export type WebhookEventType =
  | 'checkout.session.completed'
  | 'payment_intent.succeeded'
  | 'payment_intent.failed'
  | 'charge.refunded';

/** Webhook event */
export interface WebhookEvent {
  type: WebhookEventType;
  orderId: string;
  stripePaymentIntent?: string;
  amount?: number;
  currency?: string;
  timestamp: Date;
}

/** Bridge configuration */
export interface BridgeConfig {
  stripeApiKey: string;
  stripeWebhookSecret: string;
  bsvWalletAddress: string;
  feePercent: number;
  minPurchase: Record<FiatCurrency, number>;
  maxPurchase: Record<FiatCurrency, number>;
  exchangeRateProvider?: ExchangeRateProvider;
}

/** Exchange rate provider interface */
export interface ExchangeRateProvider {
  getRate(currency: FiatCurrency): Promise<number>;
}

/** Transaction record */
export interface TransactionRecord {
  orderId: string;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  bsvAmount: number;
  exchangeRate: number;
  fee: number;
  txid: string;
  destinationAddress: string;
  timestamp: Date;
}

// ============================================================================
// Default Exchange Rate Provider
// ============================================================================

export class CoinGeckoRateProvider implements ExchangeRateProvider {
  private cache: Map<FiatCurrency, { rate: number; timestamp: number }> = new Map();
  private cacheTTL = 60000; // 1 minute

  async getRate(currency: FiatCurrency): Promise<number> {
    const cached = this.cache.get(currency);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.rate;
    }

    const currencyId = currency.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash-sv&vs_currencies=${currencyId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch rate: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<string, Record<string, number>>;
      const rate = data['bitcoin-cash-sv']?.[currencyId];

      if (!rate) {
        throw new Error(`No rate found for ${currency}`);
      }

      this.cache.set(currency, { rate, timestamp: Date.now() });
      return rate;
    } catch (error) {
      // Return cached value if available, even if expired
      if (cached) {
        return cached.rate;
      }
      throw error;
    }
  }
}

// ============================================================================
// Stripe BSV Bridge
// ============================================================================

export class StripeBSVBridge {
  private config: BridgeConfig;
  private orders: Map<string, PurchaseOrder> = new Map();
  private transactions: TransactionRecord[] = [];
  private rateProvider: ExchangeRateProvider;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.rateProvider = config.exchangeRateProvider || new CoinGeckoRateProvider();
  }

  /**
   * Get a price quote for purchasing BSV
   */
  async getQuote(fiatAmount: number, currency: FiatCurrency): Promise<PriceQuote> {
    // Validate limits
    const min = this.config.minPurchase[currency] || 10;
    const max = this.config.maxPurchase[currency] || 10000;

    if (fiatAmount < min) {
      throw new Error(`Minimum purchase is ${min} ${currency}`);
    }
    if (fiatAmount > max) {
      throw new Error(`Maximum purchase is ${max} ${currency}`);
    }

    // Get exchange rate
    const exchangeRate = await this.rateProvider.getRate(currency);

    // Calculate fee
    const fee = fiatAmount * (this.config.feePercent / 100);
    const netFiat = fiatAmount - fee;
    const bsvAmount = netFiat / exchangeRate;

    const quote: PriceQuote = {
      id: this.generateId('quote'),
      fiatAmount,
      fiatCurrency: currency,
      bsvAmount: Math.floor(bsvAmount * 100000000) / 100000000, // 8 decimals
      exchangeRate,
      fee,
      feePercent: this.config.feePercent,
      totalFiat: fiatAmount,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      createdAt: new Date(),
    };

    return quote;
  }

  /**
   * Create a purchase order
   */
  async createOrder(quote: PriceQuote, destinationAddress: string, userId?: string): Promise<PurchaseOrder> {
    // Validate quote hasn't expired
    if (new Date() > quote.expiresAt) {
      throw new Error('Quote has expired');
    }

    // Validate BSV address (basic check)
    if (!this.isValidBSVAddress(destinationAddress)) {
      throw new Error('Invalid BSV address');
    }

    const order: PurchaseOrder = {
      id: this.generateId('order'),
      userId,
      quote,
      destinationAddress,
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  /**
   * Create Stripe checkout session for an order
   */
  async createStripeSession(
    orderId: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string
  ): Promise<StripeSessionResponse> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'pending') {
      throw new Error('Order already processed');
    }

    // This would call Stripe API - returning mock for types package
    const sessionConfig: StripeSessionConfig = {
      orderId: order.id,
      fiatAmount: order.quote.fiatAmount,
      fiatCurrency: order.quote.fiatCurrency,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: {
        orderId: order.id,
        bsvAddress: order.destinationAddress,
        bsvAmount: order.quote.bsvAmount.toString(),
      },
    };

    // In real implementation, this would call stripe.checkout.sessions.create
    const sessionId = `cs_${this.generateId('session')}`;
    order.stripeSessionId = sessionId;
    order.paymentStatus = 'processing';
    order.updatedAt = new Date();

    return {
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
    };
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    const order = this.orders.get(event.orderId);
    if (!order) {
      console.warn(`Order not found for webhook: ${event.orderId}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'payment_intent.succeeded':
        order.paymentStatus = 'paid';
        order.stripePaymentIntent = event.stripePaymentIntent;
        order.deliveryStatus = 'queued';
        order.updatedAt = new Date();
        // In real implementation, queue BSV delivery
        break;

      case 'payment_intent.failed':
        order.paymentStatus = 'failed';
        order.updatedAt = new Date();
        break;

      case 'charge.refunded':
        order.paymentStatus = 'refunded';
        order.updatedAt = new Date();
        break;
    }
  }

  /**
   * Record BSV delivery
   */
  recordDelivery(orderId: string, txid: string, confirmations: number = 0): void {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.bsvTxid = txid;
    order.bsvConfirmations = confirmations;
    order.deliveryStatus = confirmations > 0 ? 'confirmed' : 'broadcasting';
    order.updatedAt = new Date();

    if (confirmations > 0) {
      order.completedAt = new Date();

      // Record transaction
      this.transactions.push({
        orderId: order.id,
        fiatAmount: order.quote.fiatAmount,
        fiatCurrency: order.quote.fiatCurrency,
        bsvAmount: order.quote.bsvAmount,
        exchangeRate: order.quote.exchangeRate,
        fee: order.quote.fee,
        txid,
        destinationAddress: order.destinationAddress,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update BSV confirmation count
   */
  updateConfirmations(orderId: string, confirmations: number): void {
    const order = this.orders.get(orderId);
    if (!order) return;

    order.bsvConfirmations = confirmations;
    if (confirmations > 0 && order.deliveryStatus === 'broadcasting') {
      order.deliveryStatus = 'confirmed';
      order.completedAt = new Date();
    }
    order.updatedAt = new Date();
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): PurchaseOrder | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get orders for a user
   */
  getUserOrders(userId: string): PurchaseOrder[] {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get transaction history
   */
  getTransactions(limit?: number): TransactionRecord[] {
    const sorted = [...this.transactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get bridge statistics
   */
  getStats(): {
    totalOrders: number;
    completedOrders: number;
    totalVolume: Record<FiatCurrency, number>;
    totalBSVSold: number;
    totalFees: Record<FiatCurrency, number>;
  } {
    const orders = Array.from(this.orders.values());
    const completedOrders = orders.filter(o => o.completedAt);

    const totalVolume: Record<string, number> = {};
    const totalFees: Record<string, number> = {};
    let totalBSVSold = 0;

    for (const order of completedOrders) {
      const currency = order.quote.fiatCurrency;
      totalVolume[currency] = (totalVolume[currency] || 0) + order.quote.fiatAmount;
      totalFees[currency] = (totalFees[currency] || 0) + order.quote.fee;
      totalBSVSold += order.quote.bsvAmount;
    }

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalVolume: totalVolume as Record<FiatCurrency, number>,
      totalBSVSold,
      totalFees: totalFees as Record<FiatCurrency, number>,
    };
  }

  /**
   * Helper to validate BSV address
   */
  private isValidBSVAddress(address: string): boolean {
    // Basic validation - real implementation would use proper validation
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
           /^(bitcoincash:)?[qp][a-z0-9]{41}$/.test(address.toLowerCase());
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createStripeBSVBridge(config: BridgeConfig): StripeBSVBridge {
  return new StripeBSVBridge(config);
}

export function createDefaultConfig(
  stripeApiKey: string,
  stripeWebhookSecret: string,
  bsvWalletAddress: string
): BridgeConfig {
  return {
    stripeApiKey,
    stripeWebhookSecret,
    bsvWalletAddress,
    feePercent: 2.5,
    minPurchase: {
      USD: 10,
      EUR: 10,
      GBP: 10,
      CAD: 15,
      AUD: 15,
      JPY: 1500,
      CHF: 10,
    },
    maxPurchase: {
      USD: 10000,
      EUR: 10000,
      GBP: 10000,
      CAD: 15000,
      AUD: 15000,
      JPY: 1500000,
      CHF: 10000,
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatFiatAmount(amount: number, currency: FiatCurrency): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function formatBSVAmount(amount: number): string {
  return amount.toFixed(8) + ' BSV';
}

export function calculateExchangeRate(fiatAmount: number, bsvAmount: number): number {
  return fiatAmount / bsvAmount;
}

export function estimateBSVForFiat(
  fiatAmount: number,
  exchangeRate: number,
  feePercent: number
): number {
  const fee = fiatAmount * (feePercent / 100);
  const netFiat = fiatAmount - fee;
  return netFiat / exchangeRate;
}

export function estimateFiatForBSV(
  bsvAmount: number,
  exchangeRate: number,
  feePercent: number
): number {
  const grossFiat = bsvAmount * exchangeRate;
  return grossFiat / (1 - feePercent / 100);
}

export function isQuoteValid(quote: PriceQuote): boolean {
  return new Date() < quote.expiresAt;
}

export function getQuoteTimeRemaining(quote: PriceQuote): number {
  const remaining = quote.expiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
}
