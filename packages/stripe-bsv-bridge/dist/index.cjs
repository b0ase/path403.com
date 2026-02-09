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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CoinGeckoRateProvider: () => CoinGeckoRateProvider,
  StripeBSVBridge: () => StripeBSVBridge,
  calculateExchangeRate: () => calculateExchangeRate,
  createDefaultConfig: () => createDefaultConfig,
  createStripeBSVBridge: () => createStripeBSVBridge,
  estimateBSVForFiat: () => estimateBSVForFiat,
  estimateFiatForBSV: () => estimateFiatForBSV,
  formatBSVAmount: () => formatBSVAmount,
  formatFiatAmount: () => formatFiatAmount,
  getQuoteTimeRemaining: () => getQuoteTimeRemaining,
  isQuoteValid: () => isQuoteValid
});
module.exports = __toCommonJS(index_exports);
var CoinGeckoRateProvider = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.cacheTTL = 6e4;
  }
  // 1 minute
  async getRate(currency) {
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
      const data = await response.json();
      const rate = data["bitcoin-cash-sv"]?.[currencyId];
      if (!rate) {
        throw new Error(`No rate found for ${currency}`);
      }
      this.cache.set(currency, { rate, timestamp: Date.now() });
      return rate;
    } catch (error) {
      if (cached) {
        return cached.rate;
      }
      throw error;
    }
  }
};
var StripeBSVBridge = class {
  constructor(config) {
    this.orders = /* @__PURE__ */ new Map();
    this.transactions = [];
    this.config = config;
    this.rateProvider = config.exchangeRateProvider || new CoinGeckoRateProvider();
  }
  /**
   * Get a price quote for purchasing BSV
   */
  async getQuote(fiatAmount, currency) {
    const min = this.config.minPurchase[currency] || 10;
    const max = this.config.maxPurchase[currency] || 1e4;
    if (fiatAmount < min) {
      throw new Error(`Minimum purchase is ${min} ${currency}`);
    }
    if (fiatAmount > max) {
      throw new Error(`Maximum purchase is ${max} ${currency}`);
    }
    const exchangeRate = await this.rateProvider.getRate(currency);
    const fee = fiatAmount * (this.config.feePercent / 100);
    const netFiat = fiatAmount - fee;
    const bsvAmount = netFiat / exchangeRate;
    const quote = {
      id: this.generateId("quote"),
      fiatAmount,
      fiatCurrency: currency,
      bsvAmount: Math.floor(bsvAmount * 1e8) / 1e8,
      // 8 decimals
      exchangeRate,
      fee,
      feePercent: this.config.feePercent,
      totalFiat: fiatAmount,
      expiresAt: new Date(Date.now() + 5 * 60 * 1e3),
      // 5 minutes
      createdAt: /* @__PURE__ */ new Date()
    };
    return quote;
  }
  /**
   * Create a purchase order
   */
  async createOrder(quote, destinationAddress, userId) {
    if (/* @__PURE__ */ new Date() > quote.expiresAt) {
      throw new Error("Quote has expired");
    }
    if (!this.isValidBSVAddress(destinationAddress)) {
      throw new Error("Invalid BSV address");
    }
    const order = {
      id: this.generateId("order"),
      userId,
      quote,
      destinationAddress,
      paymentStatus: "pending",
      deliveryStatus: "pending",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(order.id, order);
    return order;
  }
  /**
   * Create Stripe checkout session for an order
   */
  async createStripeSession(orderId, successUrl, cancelUrl, customerEmail) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.paymentStatus !== "pending") {
      throw new Error("Order already processed");
    }
    const sessionConfig = {
      orderId: order.id,
      fiatAmount: order.quote.fiatAmount,
      fiatCurrency: order.quote.fiatCurrency,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: {
        orderId: order.id,
        bsvAddress: order.destinationAddress,
        bsvAmount: order.quote.bsvAmount.toString()
      }
    };
    const sessionId = `cs_${this.generateId("session")}`;
    order.stripeSessionId = sessionId;
    order.paymentStatus = "processing";
    order.updatedAt = /* @__PURE__ */ new Date();
    return {
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`
    };
  }
  /**
   * Handle Stripe webhook event
   */
  async handleWebhook(event) {
    const order = this.orders.get(event.orderId);
    if (!order) {
      console.warn(`Order not found for webhook: ${event.orderId}`);
      return;
    }
    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded":
        order.paymentStatus = "paid";
        order.stripePaymentIntent = event.stripePaymentIntent;
        order.deliveryStatus = "queued";
        order.updatedAt = /* @__PURE__ */ new Date();
        break;
      case "payment_intent.failed":
        order.paymentStatus = "failed";
        order.updatedAt = /* @__PURE__ */ new Date();
        break;
      case "charge.refunded":
        order.paymentStatus = "refunded";
        order.updatedAt = /* @__PURE__ */ new Date();
        break;
    }
  }
  /**
   * Record BSV delivery
   */
  recordDelivery(orderId, txid, confirmations = 0) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    order.bsvTxid = txid;
    order.bsvConfirmations = confirmations;
    order.deliveryStatus = confirmations > 0 ? "confirmed" : "broadcasting";
    order.updatedAt = /* @__PURE__ */ new Date();
    if (confirmations > 0) {
      order.completedAt = /* @__PURE__ */ new Date();
      this.transactions.push({
        orderId: order.id,
        fiatAmount: order.quote.fiatAmount,
        fiatCurrency: order.quote.fiatCurrency,
        bsvAmount: order.quote.bsvAmount,
        exchangeRate: order.quote.exchangeRate,
        fee: order.quote.fee,
        txid,
        destinationAddress: order.destinationAddress,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
  }
  /**
   * Update BSV confirmation count
   */
  updateConfirmations(orderId, confirmations) {
    const order = this.orders.get(orderId);
    if (!order) return;
    order.bsvConfirmations = confirmations;
    if (confirmations > 0 && order.deliveryStatus === "broadcasting") {
      order.deliveryStatus = "confirmed";
      order.completedAt = /* @__PURE__ */ new Date();
    }
    order.updatedAt = /* @__PURE__ */ new Date();
  }
  /**
   * Get order by ID
   */
  getOrder(orderId) {
    return this.orders.get(orderId);
  }
  /**
   * Get orders for a user
   */
  getUserOrders(userId) {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * Get transaction history
   */
  getTransactions(limit) {
    const sorted = [...this.transactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }
  /**
   * Get bridge statistics
   */
  getStats() {
    const orders = Array.from(this.orders.values());
    const completedOrders = orders.filter((o) => o.completedAt);
    const totalVolume = {};
    const totalFees = {};
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
      totalVolume,
      totalBSVSold,
      totalFees
    };
  }
  /**
   * Helper to validate BSV address
   */
  isValidBSVAddress(address) {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^(bitcoincash:)?[qp][a-z0-9]{41}$/.test(address.toLowerCase());
  }
  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
function createStripeBSVBridge(config) {
  return new StripeBSVBridge(config);
}
function createDefaultConfig(stripeApiKey, stripeWebhookSecret, bsvWalletAddress) {
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
      CHF: 10
    },
    maxPurchase: {
      USD: 1e4,
      EUR: 1e4,
      GBP: 1e4,
      CAD: 15e3,
      AUD: 15e3,
      JPY: 15e5,
      CHF: 1e4
    }
  };
}
function formatFiatAmount(amount, currency) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
}
function formatBSVAmount(amount) {
  return amount.toFixed(8) + " BSV";
}
function calculateExchangeRate(fiatAmount, bsvAmount) {
  return fiatAmount / bsvAmount;
}
function estimateBSVForFiat(fiatAmount, exchangeRate, feePercent) {
  const fee = fiatAmount * (feePercent / 100);
  const netFiat = fiatAmount - fee;
  return netFiat / exchangeRate;
}
function estimateFiatForBSV(bsvAmount, exchangeRate, feePercent) {
  const grossFiat = bsvAmount * exchangeRate;
  return grossFiat / (1 - feePercent / 100);
}
function isQuoteValid(quote) {
  return /* @__PURE__ */ new Date() < quote.expiresAt;
}
function getQuoteTimeRemaining(quote) {
  const remaining = quote.expiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CoinGeckoRateProvider,
  StripeBSVBridge,
  calculateExchangeRate,
  createDefaultConfig,
  createStripeBSVBridge,
  estimateBSVForFiat,
  estimateFiatForBSV,
  formatBSVAmount,
  formatFiatAmount,
  getQuoteTimeRemaining,
  isQuoteValid
});
//# sourceMappingURL=index.cjs.map