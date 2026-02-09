"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  HandCashAuthError: () => HandCashAuthError,
  HandCashDemoModeError: () => HandCashDemoModeError,
  HandCashError: () => HandCashError,
  HandCashServer: () => HandCashServer,
  handcashServer: () => handcashServer
});
module.exports = __toCommonJS(server_exports);
var import_handcash_connect = require("@handcash/handcash-connect");

// src/types.ts
var HandCashError = class extends Error {
  constructor(message, code = "HANDCASH_ERROR") {
    super(message);
    this.name = "HandCashError";
    this.code = code;
  }
};
var HandCashDemoModeError = class extends HandCashError {
  constructor() {
    super("HandCash is in DEMO MODE - real operations unavailable", "DEMO_MODE");
  }
};
var HandCashAuthError = class extends HandCashError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_REQUIRED");
  }
};

// src/server.ts
var HandCashServer = class {
  constructor(config) {
    this.appId = config?.appId || process.env.HANDCASH_APP_ID || "";
    this.appSecret = config?.appSecret || process.env.HANDCASH_APP_SECRET || "";
    this.isDemoMode = !this.appId || !this.appSecret;
    if (this.isDemoMode) {
      console.log("[HandCashServer] Running in DEMO MODE - no credentials provided");
      this.handCashConnect = null;
    } else {
      this.handCashConnect = new import_handcash_connect.HandCashConnect({
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
      const result = await account.wallet.pay(paymentParameters);
      return result;
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
      const result = await account.wallet.pay(paymentParameters);
      return result;
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
      const result = await account.wallet.getPayment(transactionId);
      return result;
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
   * Note: Items API may not be available in all SDK versions.
   */
  async getInventory(authToken) {
    try {
      const account = this.getAccount(authToken);
      const accountAny = account;
      if (!accountAny.items) {
        throw new HandCashError("Items API not available in this SDK version", "API_UNAVAILABLE");
      }
      return await accountAny.items.getInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get inventory";
      throw new HandCashError(message, "INVENTORY_ERROR");
    }
  }
  /**
   * Transfer items (ordinals) to another user
   * Note: Items API may not be available in all SDK versions.
   */
  async transferItems(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const accountAny = account;
      if (!accountAny.items) {
        throw new HandCashError("Items API not available in this SDK version", "API_UNAVAILABLE");
      }
      return await accountAny.items.transfer({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandCashAuthError,
  HandCashDemoModeError,
  HandCashError,
  HandCashServer,
  handcashServer
});
