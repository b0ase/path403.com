import Wallet from './wallet';
import Profile from './profile';
import { f as HandCashConfig, l as HandCashProfile, o as SpendableBalance, S as SinglePaymentParams, n as PaymentResult, M as MultiPaymentParams, T as TransferItemsParams, p as TransferResult } from './types-oh6C3t2b.js';
export { H as HandCashAsset, a as HandCashAuthError, b as HandCashAuthResponse, c as HandCashAuthState, d as HandCashBalance, e as HandCashClientConfig, g as HandCashContextType, h as HandCashDemoModeError, i as HandCashError, j as HandCashItem, k as HandCashPrivateProfile, m as HandCashPublicProfile, P as PaymentDestination } from './types-oh6C3t2b.js';

declare type Params = {
    authToken: string;
    appSecret: string;
    appId: string;
    baseApiEndpoint: string;
    baseTrustholderEndpoint: string;
};
declare class HandCashCloudAccount {
    wallet: Wallet;
    profile: Profile;
    constructor(wallet: Wallet, profile: Profile);
    static fromAuthToken({ authToken, appSecret, appId, baseApiEndpoint, baseTrustholderEndpoint }: Params): HandCashCloudAccount;
}

declare type UserPublicProfile = {
    id: string;
    handle: string;
    paymail: string;
    displayName: string;
    avatarUrl: string;
    localCurrencyCode: string;
    bitcoinUnit: string;
    createdAt: Date;
};

declare class HandCashServer {
    private appId;
    private appSecret;
    private handCashConnect;
    readonly isDemoMode: boolean;
    constructor(config?: HandCashConfig);
    private checkDemoMode;
    /**
     * Get an authorized account instance from an auth token.
     */
    private getAccount;
    /**
     * Get user's public profile
     */
    getUserProfile(authToken: string): Promise<HandCashProfile['publicProfile']>;
    /**
     * Get user's friends list
     */
    getFriends(authToken: string): Promise<UserPublicProfile[]>;
    /**
     * Get spendable balance
     */
    getSpendableBalance(authToken: string, currencyCode?: string): Promise<SpendableBalance>;
    /**
     * Send a single payment
     */
    sendPayment(authToken: string, params: SinglePaymentParams): Promise<PaymentResult>;
    /**
     * Send payment with multiple outputs (for distributions, splits, etc.)
     */
    sendMultiPayment(authToken: string, params: MultiPaymentParams): Promise<PaymentResult>;
    /**
     * Verify a payment by transaction ID
     */
    getPayment(authToken: string, transactionId: string): Promise<PaymentResult>;
    /**
     * Get user's inventory (NFTs, ordinals, etc.)
     * Note: Items API may not be available in all SDK versions.
     */
    getInventory(authToken: string): Promise<any>;
    /**
     * Transfer items (ordinals) to another user
     * Note: Items API may not be available in all SDK versions.
     */
    transferItems(authToken: string, params: TransferItemsParams): Promise<TransferResult>;
    /**
     * Get the house account for platform operations.
     * Requires HOUSE_AUTH_TOKEN environment variable.
     */
    getHouseAccount(): HandCashCloudAccount;
    /**
     * Send payment from the house account
     */
    sendHousePayment(params: SinglePaymentParams): Promise<PaymentResult>;
}
declare const handcashServer: HandCashServer;

export { HandCashConfig, HandCashProfile, HandCashServer, MultiPaymentParams, PaymentResult, SinglePaymentParams, SpendableBalance, TransferItemsParams, TransferResult, handcashServer };
