import {
  HandCashDemoModeError,
  HandCashError
} from "./chunk-YNLUK5BH.mjs";

// src/server.ts
import { HandCashConnect } from "@handcash/handcash-connect";
var HandCashServer = class {
  constructor(config) {
    this.appId = config?.appId || process.env.HANDCASH_APP_ID || "";
    this.appSecret = config?.appSecret || process.env.HANDCASH_APP_SECRET || "";
    this.isDemoMode = !this.appId || !this.appSecret;
    if (this.isDemoMode) {
      console.log("[HandCashServer] Running in DEMO MODE - no credentials provided");
      this.handCashConnect = null;
    } else {
      this.handCashConnect = new HandCashConnect({
        appId: this.appId,
        appSecret: this.appSecret
      });
    }
  }
  checkDemoMode() {
    if (this.isDemoMode || !this.handCashConnect) {
      throw new HandCashDemoModeError();
    }
  }
  /**
   * Get an authorized account instance from an auth token.
   */
  getAccount(authToken) {
    this.checkDemoMode();
    return this.handCashConnect.getAccountFromAuthToken(authToken);
  }
  // ============================================================================
  // Profile Operations
  // ============================================================================
  /**
   * Get user's public profile
   */
  async getUserProfile(authToken) {
    try {
      const account = this.getAccount(authToken);
      const { publicProfile } = await account.profile.getCurrentProfile();
      return publicProfile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get user profile";
      throw new HandCashError(message, "PROFILE_ERROR");
    }
  }
  /**
   * Get user's friends list
   */
  async getFriends(authToken) {
    try {
      const account = this.getAccount(authToken);
      return await account.profile.getFriends();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get friends";
      throw new HandCashError(message, "FRIENDS_ERROR");
    }
  }
  // ============================================================================
  // Wallet Operations
  // ============================================================================
  /**
   * Get spendable balance
   */
  async getSpendableBalance(authToken, currencyCode = "USD") {
    try {
      const account = this.getAccount(authToken);
      return await account.wallet.getSpendableBalance(currencyCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get balance";
      throw new HandCashError(message, "BALANCE_ERROR");
    }
  }
  /**
   * Send a single payment
   */
  async sendPayment(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description,
        appAction: "PAYMENT",
        payments: [
          {
            destination: params.destination,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currencyCode: params.currency || "USD",
            sendAmount: params.amount
          }
        ]
      };
      return await account.wallet.pay(paymentParameters);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      throw new HandCashError(message, "PAYMENT_ERROR");
    }
  }
  /**
   * Send payment with multiple outputs (for distributions, splits, etc.)
   */
  async sendMultiPayment(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description || "Payment Distribution",
        appAction: params.appAction || "PAYMENT",
        payments: params.payments.map((p) => ({
          destination: p.destination,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currencyCode: p.currencyCode || "USD",
          sendAmount: p.amount
        }))
      };
      return await account.wallet.pay(paymentParameters);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Multi-payment failed";
      throw new HandCashError(message, "MULTI_PAYMENT_ERROR");
    }
  }
  /**
   * Verify a payment by transaction ID
   */
  async getPayment(authToken, transactionId) {
    try {
      const account = this.getAccount(authToken);
      return await account.wallet.getPayment(transactionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify payment";
      throw new HandCashError(message, "PAYMENT_VERIFY_ERROR");
    }
  }
  // ============================================================================
  // Items/Ordinals Operations
  // ============================================================================
  /**
   * Get user's inventory (NFTs, ordinals, etc.)
   */
  async getInventory(authToken) {
    try {
      const account = this.getAccount(authToken);
      return await account.items.getInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get inventory";
      throw new HandCashError(message, "INVENTORY_ERROR");
    }
  }
  /**
   * Transfer items (ordinals) to another user
   */
  async transferItems(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      return await account.items.transfer({
        destinationsWithOrigins: [
          {
            origins: params.origins,
            destination: params.destination
          }
        ]
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to transfer items";
      throw new HandCashError(message, "TRANSFER_ERROR");
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
      throw new HandCashError("HOUSE_AUTH_TOKEN not configured", "CONFIG_ERROR");
    }
    return this.getAccount(houseAuthToken);
  }
  /**
   * Send payment from the house account
   */
  async sendHousePayment(params) {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new HandCashError("HOUSE_AUTH_TOKEN not configured", "CONFIG_ERROR");
    }
    return this.sendPayment(houseAuthToken, params);
  }
};
var handcashServer = new HandCashServer();

export {
  HandCashServer,
  handcashServer
};
