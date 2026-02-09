import { e as HandCashClientConfig, b as HandCashAuthResponse, l as HandCashProfile, d as HandCashBalance } from './types-oh6C3t2b.js';
export { H as HandCashAsset, a as HandCashAuthError, c as HandCashAuthState, f as HandCashConfig, g as HandCashContextType, h as HandCashDemoModeError, i as HandCashError, j as HandCashItem, k as HandCashPrivateProfile, m as HandCashPublicProfile, M as MultiPaymentParams, P as PaymentDestination, n as PaymentResult, S as SinglePaymentParams, o as SpendableBalance, T as TransferItemsParams, p as TransferResult } from './types-oh6C3t2b.js';

/**
 * @b0ase/handcash - Client-Side Auth Service
 *
 * This module provides client-side HandCash authentication using OAuth flow.
 * Use this in browser environments for user login/logout.
 *
 * @example
 * ```typescript
 * import { HandCashClient } from '@b0ase/handcash/client';
 *
 * const client = new HandCashClient({
 *   appId: 'your-app-id',
 *   redirectUri: 'https://yourapp.com/callback',
 * });
 *
 * // Redirect to HandCash for auth
 * window.location.href = client.getOAuthUrl();
 *
 * // Handle callback
 * const authResult = await client.handleOAuthCallback(code);
 * ```
 */

declare class HandCashClient {
    private appId;
    private redirectUri;
    private permissions;
    private authToken;
    private profile;
    constructor(config: HandCashClientConfig);
    private loadAuthData;
    private saveAuthData;
    /**
     * Clear all stored authentication data
     */
    clearAuth(): void;
    /**
     * Get the OAuth authorization URL.
     * Redirect the user to this URL to begin authentication.
     */
    getOAuthUrl(): string;
    /**
     * Handle the OAuth callback after user authorization.
     * Call this with the 'code' parameter from the callback URL.
     */
    handleOAuthCallback(code: string): Promise<HandCashAuthResponse | null>;
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get the stored user profile
     */
    getProfile(): HandCashProfile | null;
    /**
     * Get the stored auth token
     */
    getAuthToken(): string | null;
    /**
     * Fetch current wallet balance
     */
    getBalance(): Promise<HandCashBalance | null>;
    /**
     * Send a payment (client-side, uses stored auth token)
     */
    sendPayment(to: string, amount: number, currency?: string, description?: string): Promise<{
        transactionId: string;
    } | null>;
    /**
     * Create a mock authentication for development/testing.
     * This simulates a HandCash login without actual OAuth.
     */
    mockAuthenticate(mockData?: Partial<HandCashProfile>): Promise<HandCashAuthResponse>;
}
declare function createHandCashClient(config: HandCashClientConfig): HandCashClient;

export { HandCashAuthResponse, HandCashBalance, HandCashClient, HandCashClientConfig, HandCashProfile, createHandCashClient };
