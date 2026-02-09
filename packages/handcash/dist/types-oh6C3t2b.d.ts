/**
 * @b0ase/handcash - Shared Types
 *
 * These types are used across all HandCash integrations in the b0ase ecosystem.
 */
interface HandCashPublicProfile {
    id: string;
    handle: string;
    paymail: string;
    displayName: string;
    avatarUrl: string;
    localCurrencyCode: string;
}
interface HandCashPrivateProfile {
    email: string;
    phoneNumber: string;
}
interface HandCashProfile {
    publicProfile: HandCashPublicProfile;
    privateProfile?: HandCashPrivateProfile;
}
interface HandCashBalance {
    bsv: number;
    usd: number;
    satoshis?: number;
}
interface SpendableBalance {
    spendableSatoshiBalance: number;
    spendableFiatBalance: number;
    currencyCode: string;
}
interface HandCashAsset {
    id: string;
    type: 'token' | 'nft' | 'file';
    name: string;
    ticker?: string;
    amount?: number;
    icon?: string;
    metadata?: Record<string, unknown>;
}
interface HandCashItem {
    origin: string;
    name: string;
    description?: string;
    imageUrl?: string;
    attributes?: Record<string, unknown>;
}
interface PaymentDestination {
    destination: string;
    amount: number;
    currencyCode?: string;
}
interface SinglePaymentParams {
    destination: string;
    amount: number;
    currency?: string;
    description?: string;
}
interface MultiPaymentParams {
    payments: PaymentDestination[];
    description?: string;
    appAction?: 'PAY' | 'TIPPING' | 'PAYMENT';
}
/**
 * Payment result from HandCash SDK.
 * Using Record for participants to accommodate SDK type variations.
 */
interface PaymentResult {
    transactionId: string;
    note?: string;
    type?: string;
    time?: number;
    satoshiFees?: number;
    fiatExchangeRate?: number;
    participants?: Array<Record<string, unknown>>;
}
interface HandCashAuthResponse {
    authToken: string;
    profile: HandCashProfile;
}
interface HandCashAuthState {
    isAuthenticated: boolean;
    profile: HandCashProfile | null;
    authToken: string | null;
}
interface TransferItemsParams {
    origins: string[];
    destination: string;
}
interface TransferResult {
    transactionId: string;
}
interface HandCashContextType {
    isAuthenticated: boolean;
    profile: HandCashProfile | null;
    balance: HandCashBalance | null;
    assets: HandCashAsset[];
    isLoading: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    signOut: () => void;
    getOAuthUrl: () => string;
    handleCallback: (code: string) => Promise<boolean>;
    refreshBalance: () => Promise<void>;
    refreshAssets: () => Promise<void>;
    sendPayment: (to: string, amount: number, currency?: string) => Promise<string | null>;
}
interface HandCashConfig {
    appId: string;
    appSecret?: string;
    environment?: 'production' | 'sandbox';
}
interface HandCashClientConfig {
    appId: string;
    redirectUri?: string;
    permissions?: string[];
}
declare class HandCashError extends Error {
    code: string;
    constructor(message: string, code?: string);
}
declare class HandCashDemoModeError extends HandCashError {
    constructor();
}
declare class HandCashAuthError extends HandCashError {
    constructor(message?: string);
}

export { type HandCashAsset as H, type MultiPaymentParams as M, type PaymentDestination as P, type SinglePaymentParams as S, type TransferItemsParams as T, HandCashAuthError as a, type HandCashAuthResponse as b, type HandCashAuthState as c, type HandCashBalance as d, type HandCashClientConfig as e, type HandCashConfig as f, type HandCashContextType as g, HandCashDemoModeError as h, HandCashError as i, type HandCashItem as j, type HandCashPrivateProfile as k, type HandCashProfile as l, type HandCashPublicProfile as m, type PaymentResult as n, type SpendableBalance as o, type TransferResult as p };
