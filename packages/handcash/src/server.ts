/**
 * @b0ase/handcash - Server-Side Service
 *
 * This module provides server-side HandCash operations using the official SDK.
 * Use this in API routes, server actions, and backend services.
 *
 * @example
 * ```typescript
 * import { HandCashServer } from '@b0ase/handcash/server';
 *
 * const handcash = new HandCashServer({
 *   appId: process.env.HANDCASH_APP_ID!,
 *   appSecret: process.env.HANDCASH_APP_SECRET!,
 * });
 *
 * // Get user profile
 * const profile = await handcash.getUserProfile(authToken);
 *
 * // Send payment
 * const result = await handcash.sendPayment(authToken, {
 *   destination: 'bob',
 *   amount: 1.00,
 *   currency: 'USD',
 * });
 * ```
 */

import { HandCashConnect } from '@handcash/handcash-connect';
import type {
  HandCashConfig,
  HandCashProfile,
  SinglePaymentParams,
  MultiPaymentParams,
  PaymentResult,
  TransferItemsParams,
  TransferResult,
  SpendableBalance,
} from './types';
import { HandCashDemoModeError, HandCashError } from './types';

export class HandCashServer {
  private appId: string;
  private appSecret: string;
  private handCashConnect: HandCashConnect | null;
  public readonly isDemoMode: boolean;

  constructor(config?: HandCashConfig) {
    this.appId = config?.appId || process.env.HANDCASH_APP_ID || '';
    this.appSecret = config?.appSecret || process.env.HANDCASH_APP_SECRET || '';
    this.isDemoMode = !this.appId || !this.appSecret;

    if (this.isDemoMode) {
      console.log('[HandCashServer] Running in DEMO MODE - no credentials provided');
      this.handCashConnect = null;
    } else {
      this.handCashConnect = new HandCashConnect({
        appId: this.appId,
        appSecret: this.appSecret,
      });
    }
  }

  private checkDemoMode(): void {
    if (this.isDemoMode || !this.handCashConnect) {
      throw new HandCashDemoModeError();
    }
  }

  /**
   * Get an authorized account instance from an auth token.
   */
  private getAccount(authToken: string) {
    this.checkDemoMode();
    return this.handCashConnect!.getAccountFromAuthToken(authToken);
  }

  // ============================================================================
  // Profile Operations
  // ============================================================================

  /**
   * Get user's public profile
   */
  async getUserProfile(authToken: string): Promise<HandCashProfile['publicProfile']> {
    try {
      const account = this.getAccount(authToken);
      const { publicProfile } = await account.profile.getCurrentProfile();
      return publicProfile;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get user profile';
      throw new HandCashError(message, 'PROFILE_ERROR');
    }
  }

  /**
   * Get user's friends list
   */
  async getFriends(authToken: string) {
    try {
      const account = this.getAccount(authToken);
      return await account.profile.getFriends();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get friends';
      throw new HandCashError(message, 'FRIENDS_ERROR');
    }
  }

  // ============================================================================
  // Wallet Operations
  // ============================================================================

  /**
   * Get spendable balance
   */
  async getSpendableBalance(
    authToken: string,
    currencyCode: string = 'USD'
  ): Promise<SpendableBalance> {
    try {
      const account = this.getAccount(authToken);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await account.wallet.getSpendableBalance(currencyCode as any);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get balance';
      throw new HandCashError(message, 'BALANCE_ERROR');
    }
  }

  /**
   * Send a single payment
   */
  async sendPayment(authToken: string, params: SinglePaymentParams): Promise<PaymentResult> {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description,
        appAction: 'PAYMENT' as const,
        payments: [
          {
            destination: params.destination,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currencyCode: (params.currency || 'USD') as any,
            sendAmount: params.amount,
          },
        ],
      };

      const result = await account.wallet.pay(paymentParameters);
      return result as unknown as PaymentResult;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      throw new HandCashError(message, 'PAYMENT_ERROR');
    }
  }

  /**
   * Send payment with multiple outputs (for distributions, splits, etc.)
   */
  async sendMultiPayment(authToken: string, params: MultiPaymentParams): Promise<PaymentResult> {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description || 'Payment Distribution',
        appAction: params.appAction || ('PAYMENT' as const),
        payments: params.payments.map((p) => ({
          destination: p.destination,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currencyCode: (p.currencyCode || 'USD') as any,
          sendAmount: p.amount,
        })),
      };

      const result = await account.wallet.pay(paymentParameters);
      return result as unknown as PaymentResult;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Multi-payment failed';
      throw new HandCashError(message, 'MULTI_PAYMENT_ERROR');
    }
  }

  /**
   * Verify a payment by transaction ID
   */
  async getPayment(authToken: string, transactionId: string): Promise<PaymentResult> {
    try {
      const account = this.getAccount(authToken);
      const result = await account.wallet.getPayment(transactionId);
      return result as unknown as PaymentResult;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      throw new HandCashError(message, 'PAYMENT_VERIFY_ERROR');
    }
  }

  // ============================================================================
  // Items/Ordinals Operations
  // ============================================================================

  /**
   * Get user's inventory (NFTs, ordinals, etc.)
   * Note: Items API may not be available in all SDK versions.
   */
  async getInventory(authToken: string) {
    try {
      const account = this.getAccount(authToken);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accountAny = account as any;
      if (!accountAny.items) {
        throw new HandCashError('Items API not available in this SDK version', 'API_UNAVAILABLE');
      }
      return await accountAny.items.getInventory();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get inventory';
      throw new HandCashError(message, 'INVENTORY_ERROR');
    }
  }

  /**
   * Transfer items (ordinals) to another user
   * Note: Items API may not be available in all SDK versions.
   */
  async transferItems(authToken: string, params: TransferItemsParams): Promise<TransferResult> {
    try {
      const account = this.getAccount(authToken);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accountAny = account as any;
      if (!accountAny.items) {
        throw new HandCashError('Items API not available in this SDK version', 'API_UNAVAILABLE');
      }
      return await accountAny.items.transfer({
        destinationsWithOrigins: [
          {
            origins: params.origins,
            destination: params.destination,
          },
        ],
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to transfer items';
      throw new HandCashError(message, 'TRANSFER_ERROR');
    }
  }

  // ============================================================================
  // House Account (Global/Admin Wallet)
  // ============================================================================

  /**
   * Get the house account for platform operations.
   * Requires HOUSE_AUTH_TOKEN environment variable.
   */
  getHouseAccount() {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new HandCashError('HOUSE_AUTH_TOKEN not configured', 'CONFIG_ERROR');
    }
    return this.getAccount(houseAuthToken);
  }

  /**
   * Send payment from the house account
   */
  async sendHousePayment(params: SinglePaymentParams): Promise<PaymentResult> {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new HandCashError('HOUSE_AUTH_TOKEN not configured', 'CONFIG_ERROR');
    }
    return this.sendPayment(houseAuthToken, params);
  }
}

// Default singleton instance using environment variables
export const handcashServer = new HandCashServer();

// Re-export types for convenience
export * from './types';
