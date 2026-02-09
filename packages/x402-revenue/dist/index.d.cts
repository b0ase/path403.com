/**
 * @b0ase/x402-revenue
 *
 * HTTP 402 Payment Required protocol for monetizing web content.
 *
 * @packageDocumentation
 */
/** Payment method */
type PaymentMethod = 'bsv' | 'lightning' | 'handcash' | 'paymail' | 'stripe';
/** Payment status */
type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'expired';
/** Price model */
type PriceModel = 'fixed' | 'per-request' | 'time-based' | 'streaming' | 'subscription';
/** Payment request */
interface PaymentRequest {
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
interface PaymentDetails {
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
interface PaymentReceipt {
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
interface AccessToken {
    token: string;
    resource: string;
    issuedAt: number;
    expiresAt: number;
    usageLimit?: number;
    usageCount: number;
}
/** 402 Response headers */
interface X402Headers {
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
interface PricingConfig {
    amount: number;
    currency: string;
    model: PriceModel;
    methods: PaymentMethod[];
    duration?: number;
    requestLimit?: number;
    description?: string;
}
/** Revenue stats */
interface RevenueStats {
    totalRevenue: number;
    transactionCount: number;
    uniquePayers: number;
    byMethod: Record<PaymentMethod, number>;
    byResource: Record<string, number>;
    period: {
        start: number;
        end: number;
    };
}
/** Manager options */
interface X402Options {
    defaultMethods?: PaymentMethod[];
    defaultCurrency?: string;
    requestExpiry?: number;
    tokenExpiry?: number;
    onPaymentReceived?: (receipt: PaymentReceipt) => void;
}
declare const HTTP_402_STATUS = 402;
declare const DEFAULT_EXPIRY = 3600000;
declare const DEFAULT_CURRENCY = "USD";
declare class X402RevenueManager {
    private options;
    private requests;
    private receipts;
    private tokens;
    private pricing;
    constructor(options?: X402Options);
    setResourcePrice(resource: string, config: PricingConfig): void;
    getResourcePrice(resource: string): PricingConfig | undefined;
    removeResourcePrice(resource: string): boolean;
    private matchPattern;
    createPaymentRequest(resource: string, paymentDetails: PaymentDetails): PaymentRequest;
    getPaymentRequest(id: string): PaymentRequest | undefined;
    isRequestValid(id: string): boolean;
    verifyPayment(requestId: string, method: PaymentMethod, proof: {
        txid?: string;
        signature?: string;
    }): Promise<PaymentReceipt | null>;
    getReceipt(id: string): PaymentReceipt | undefined;
    createAccessToken(receipt: PaymentReceipt): AccessToken;
    validateToken(token: string, resource: string): boolean;
    revokeToken(token: string): boolean;
    create402Response(resource: string, paymentDetails: PaymentDetails): {
        status: 402;
        headers: X402Headers;
        body: PaymentRequest;
    };
    parsePaymentHeader(authorization: string): {
        token?: string;
        receipt?: string;
    } | null;
    getRevenueStats(startTime?: number, endTime?: number): RevenueStats;
    private generateId;
    private generateToken;
    cleanup(): void;
}
declare function createX402Manager(options?: X402Options): X402RevenueManager;
/**
 * Create middleware for 402 protection
 */
declare function createPaywall(manager: X402RevenueManager, getPaymentDetails: (resource: string) => PaymentDetails): (resource: string, token?: string) => {
    allowed: boolean;
    response?: ReturnType<X402RevenueManager['create402Response']>;
};
/**
 * Format price for display
 */
declare function formatPrice(amount: number, currency: string): string;
/**
 * Convert between currencies (simplified)
 */
declare function convertCurrency(amount: number, from: string, to: string, rates: Record<string, number>): number;

export { type AccessToken, DEFAULT_CURRENCY, DEFAULT_EXPIRY, HTTP_402_STATUS, type PaymentDetails, type PaymentMethod, type PaymentReceipt, type PaymentRequest, type PaymentStatus, type PriceModel, type PricingConfig, type RevenueStats, type X402Headers, type X402Options, X402RevenueManager, convertCurrency, createPaywall, createX402Manager, formatPrice };
