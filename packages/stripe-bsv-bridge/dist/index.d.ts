/**
 * @b0ase/stripe-bsv-bridge
 *
 * Fiat onramp for BSV via Stripe payment processing.
 *
 * @packageDocumentation
 */
/** Supported fiat currencies */
type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF';
/** Payment status */
type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
/** BSV delivery status */
type DeliveryStatus = 'pending' | 'queued' | 'broadcasting' | 'confirmed' | 'failed';
/** Price quote */
interface PriceQuote {
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
interface PurchaseOrder {
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
interface StripeSessionConfig {
    orderId: string;
    fiatAmount: number;
    fiatCurrency: FiatCurrency;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}
/** Stripe session response */
interface StripeSessionResponse {
    sessionId: string;
    url: string;
}
/** Webhook event type */
type WebhookEventType = 'checkout.session.completed' | 'payment_intent.succeeded' | 'payment_intent.failed' | 'charge.refunded';
/** Webhook event */
interface WebhookEvent {
    type: WebhookEventType;
    orderId: string;
    stripePaymentIntent?: string;
    amount?: number;
    currency?: string;
    timestamp: Date;
}
/** Bridge configuration */
interface BridgeConfig {
    stripeApiKey: string;
    stripeWebhookSecret: string;
    bsvWalletAddress: string;
    feePercent: number;
    minPurchase: Record<FiatCurrency, number>;
    maxPurchase: Record<FiatCurrency, number>;
    exchangeRateProvider?: ExchangeRateProvider;
}
/** Exchange rate provider interface */
interface ExchangeRateProvider {
    getRate(currency: FiatCurrency): Promise<number>;
}
/** Transaction record */
interface TransactionRecord {
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
declare class CoinGeckoRateProvider implements ExchangeRateProvider {
    private cache;
    private cacheTTL;
    getRate(currency: FiatCurrency): Promise<number>;
}
declare class StripeBSVBridge {
    private config;
    private orders;
    private transactions;
    private rateProvider;
    constructor(config: BridgeConfig);
    /**
     * Get a price quote for purchasing BSV
     */
    getQuote(fiatAmount: number, currency: FiatCurrency): Promise<PriceQuote>;
    /**
     * Create a purchase order
     */
    createOrder(quote: PriceQuote, destinationAddress: string, userId?: string): Promise<PurchaseOrder>;
    /**
     * Create Stripe checkout session for an order
     */
    createStripeSession(orderId: string, successUrl: string, cancelUrl: string, customerEmail?: string): Promise<StripeSessionResponse>;
    /**
     * Handle Stripe webhook event
     */
    handleWebhook(event: WebhookEvent): Promise<void>;
    /**
     * Record BSV delivery
     */
    recordDelivery(orderId: string, txid: string, confirmations?: number): void;
    /**
     * Update BSV confirmation count
     */
    updateConfirmations(orderId: string, confirmations: number): void;
    /**
     * Get order by ID
     */
    getOrder(orderId: string): PurchaseOrder | undefined;
    /**
     * Get orders for a user
     */
    getUserOrders(userId: string): PurchaseOrder[];
    /**
     * Get transaction history
     */
    getTransactions(limit?: number): TransactionRecord[];
    /**
     * Get bridge statistics
     */
    getStats(): {
        totalOrders: number;
        completedOrders: number;
        totalVolume: Record<FiatCurrency, number>;
        totalBSVSold: number;
        totalFees: Record<FiatCurrency, number>;
    };
    /**
     * Helper to validate BSV address
     */
    private isValidBSVAddress;
    /**
     * Generate unique ID
     */
    private generateId;
}
declare function createStripeBSVBridge(config: BridgeConfig): StripeBSVBridge;
declare function createDefaultConfig(stripeApiKey: string, stripeWebhookSecret: string, bsvWalletAddress: string): BridgeConfig;
declare function formatFiatAmount(amount: number, currency: FiatCurrency): string;
declare function formatBSVAmount(amount: number): string;
declare function calculateExchangeRate(fiatAmount: number, bsvAmount: number): number;
declare function estimateBSVForFiat(fiatAmount: number, exchangeRate: number, feePercent: number): number;
declare function estimateFiatForBSV(bsvAmount: number, exchangeRate: number, feePercent: number): number;
declare function isQuoteValid(quote: PriceQuote): boolean;
declare function getQuoteTimeRemaining(quote: PriceQuote): number;

export { type BridgeConfig, CoinGeckoRateProvider, type DeliveryStatus, type ExchangeRateProvider, type FiatCurrency, type PaymentStatus, type PriceQuote, type PurchaseOrder, StripeBSVBridge, type StripeSessionConfig, type StripeSessionResponse, type TransactionRecord, type WebhookEvent, type WebhookEventType, calculateExchangeRate, createDefaultConfig, createStripeBSVBridge, estimateBSVForFiat, estimateFiatForBSV, formatBSVAmount, formatFiatAmount, getQuoteTimeRemaining, isQuoteValid };
