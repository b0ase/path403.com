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
  BondingCurve: () => BondingCurve,
  CURVE_PRESETS: () => CURVE_PRESETS,
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  createBondingCurve: () => createBondingCurve,
  formatCurrency: () => formatCurrency,
  formatNumber: () => formatNumber,
  formatPrice: () => formatPrice
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_CONFIG = {
  name: "Token",
  symbol: "TOKEN",
  totalSupply: BigInt(1e9),
  // 1 billion tokens
  minPrice: 1e-7,
  // $0.0000001 (one ten-millionth)
  maxPrice: 1e6,
  // $1,000,000
  curveType: "exponential"
};
var CURVE_PRESETS = {
  /** Pump.fun style - 13 orders of magnitude */
  pumpFun: {
    ...DEFAULT_CONFIG,
    name: "Fair Launch Token",
    symbol: "PUMP"
  },
  /** More conservative - 6 orders of magnitude */
  conservative: {
    ...DEFAULT_CONFIG,
    name: "Conservative Token",
    symbol: "SAFE",
    minPrice: 1e-3,
    maxPrice: 1e3
  },
  /** Linear curve - predictable pricing */
  linear: {
    ...DEFAULT_CONFIG,
    name: "Linear Token",
    symbol: "LINE",
    minPrice: 0.01,
    maxPrice: 100,
    curveType: "linear"
  },
  /** Sigmoid curve - S-shaped, slower start and end */
  sigmoid: {
    ...DEFAULT_CONFIG,
    name: "Sigmoid Token",
    symbol: "SIG",
    minPrice: 1e-3,
    maxPrice: 1e3,
    curveType: "sigmoid",
    sigmoidK: 1e-8
  },
  /** Small community token - 1M supply */
  community: {
    ...DEFAULT_CONFIG,
    name: "Community Token",
    symbol: "COMM",
    totalSupply: BigInt(1e6),
    minPrice: 0.01,
    maxPrice: 100
  },
  /** Micro cap - 10K supply, high value */
  microCap: {
    ...DEFAULT_CONFIG,
    name: "Micro Token",
    symbol: "MICRO",
    totalSupply: BigInt(1e4),
    minPrice: 1,
    maxPrice: 1e4
  }
};
var BondingCurve = class {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logMin = Math.log10(this.config.minPrice);
    this.logMax = Math.log10(this.config.maxPrice);
    this.logRange = this.logMax - this.logMin;
  }
  /**
   * Get the price at a specific token index (0-indexed)
   */
  getPriceAtToken(tokenIndex) {
    const total = Number(this.config.totalSupply) - 1;
    if (tokenIndex <= 0) return this.config.minPrice;
    if (tokenIndex >= total) return this.config.maxPrice;
    const n = tokenIndex;
    const { minPrice, maxPrice, curveType, sigmoidK } = this.config;
    switch (curveType) {
      case "exponential": {
        const logPrice = this.logMin + this.logRange * n / total;
        return Math.pow(10, logPrice);
      }
      case "linear": {
        return minPrice + (maxPrice - minPrice) * n / total;
      }
      case "sigmoid": {
        const k = sigmoidK || 1e-8;
        const midpoint = total / 2;
        const sigmoid = 1 / (1 + Math.exp(-k * (n - midpoint)));
        return minPrice + (maxPrice - minPrice) * sigmoid;
      }
      default:
        return minPrice;
    }
  }
  /**
   * Get the current price based on tokens already sold
   */
  getCurrentPrice(tokensSold) {
    return this.getPriceAtToken(Number(tokensSold));
  }
  /**
   * Get the token index at a specific price (inverse of getPriceAtToken)
   */
  getTokenAtPrice(price) {
    const total = Number(this.config.totalSupply) - 1;
    const { minPrice, maxPrice, curveType, sigmoidK } = this.config;
    if (price <= minPrice) return 0;
    if (price >= maxPrice) return total;
    switch (curveType) {
      case "exponential": {
        const logPrice = Math.log10(price);
        return Math.floor((logPrice - this.logMin) / this.logRange * total);
      }
      case "linear": {
        return Math.floor((price - minPrice) / (maxPrice - minPrice) * total);
      }
      case "sigmoid": {
        const k = sigmoidK || 1e-8;
        const midpoint = total / 2;
        const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
        if (normalizedPrice <= 0 || normalizedPrice >= 1) return midpoint;
        return Math.floor(
          -Math.log((1 - normalizedPrice) / normalizedPrice) / k + midpoint
        );
      }
      default:
        return 0;
    }
  }
  /**
   * Calculate how many tokens a user gets for a given payment
   */
  getTokensForPayment(tokensSold, paymentUSD) {
    if (paymentUSD <= 0) return BigInt(0);
    const startIndex = Number(tokensSold);
    const total = Number(this.config.totalSupply);
    let remaining = paymentUSD;
    let tokensReceived = 0;
    const step = Math.max(1, Math.floor(total / 1e4));
    for (let i = startIndex; i < total && remaining > 0; i += step) {
      const price = this.getPriceAtToken(i);
      const maxTokensAtPrice = Math.min(step, total - i);
      const costForStep = price * maxTokensAtPrice;
      if (costForStep <= remaining) {
        remaining -= costForStep;
        tokensReceived += maxTokensAtPrice;
      } else {
        const tokensBuyable = Math.floor(remaining / price);
        tokensReceived += tokensBuyable;
        break;
      }
    }
    const maxTokens = total - startIndex;
    return BigInt(Math.min(tokensReceived, maxTokens));
  }
  /**
   * Calculate the cost to buy a specific number of tokens
   */
  getCostForTokens(tokensSold, tokensToBuy) {
    if (tokensToBuy <= BigInt(0)) return 0;
    const startIndex = Number(tokensSold);
    const endIndex = Math.min(
      startIndex + Number(tokensToBuy),
      Number(this.config.totalSupply) - 1
    );
    if (Number(tokensToBuy) < 1e3) {
      const startPrice = this.getPriceAtToken(startIndex);
      const endPrice = this.getPriceAtToken(endIndex);
      return (startPrice + endPrice) / 2 * Number(tokensToBuy);
    }
    let totalCost = 0;
    const numSteps = 100;
    const stepSize = (endIndex - startIndex) / numSteps;
    for (let i = 0; i < numSteps; i++) {
      const idx1 = startIndex + i * stepSize;
      const idx2 = startIndex + (i + 1) * stepSize;
      const p1 = this.getPriceAtToken(Math.floor(idx1));
      const p2 = this.getPriceAtToken(Math.floor(idx2));
      totalCost += (p1 + p2) / 2 * stepSize;
    }
    return totalCost;
  }
  /**
   * Get a full purchase quote with price impact
   */
  getPurchaseQuote(tokensSold, paymentUSD) {
    const currentPrice = this.getCurrentPrice(tokensSold);
    const tokensReceived = this.getTokensForPayment(tokensSold, paymentUSD);
    const totalCost = this.getCostForTokens(tokensSold, tokensReceived);
    const newTokensSold = tokensSold + tokensReceived;
    const newPrice = this.getCurrentPrice(newTokensSold);
    return {
      tokensReceived,
      totalCost,
      averagePrice: Number(tokensReceived) > 0 ? totalCost / Number(tokensReceived) : 0,
      newPrice,
      priceImpact: currentPrice > 0 ? (newPrice - currentPrice) / currentPrice * 100 : 0
    };
  }
  /**
   * Get market cap at current supply level
   */
  getMarketCap(tokensSold) {
    const currentPrice = this.getCurrentPrice(tokensSold);
    return currentPrice * Number(tokensSold);
  }
  /**
   * Get fully diluted valuation
   */
  getFDV(tokensSold) {
    const currentPrice = this.getCurrentPrice(tokensSold);
    return currentPrice * Number(this.config.totalSupply);
  }
  /**
   * Get progress percentage (0-100)
   */
  getProgress(tokensSold) {
    return Number(tokensSold) / Number(this.config.totalSupply) * 100;
  }
  /**
   * Get remaining supply
   */
  getRemainingSupply(tokensSold) {
    return this.config.totalSupply - tokensSold;
  }
  /**
   * Generate curve data points for visualization
   */
  getCurvePoints(numPoints = 100) {
    const total = Number(this.config.totalSupply);
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const tokenIndex = Math.floor(i / numPoints * (total - 1));
      const price = this.getPriceAtToken(tokenIndex);
      points.push({
        tokenIndex,
        tokensSold: tokenIndex + 1,
        price,
        percentSold: (tokenIndex + 1) / total * 100
      });
    }
    return points;
  }
  /**
   * Get key milestones with prices
   */
  getMilestones() {
    const total = Number(this.config.totalSupply);
    const milestonePercents = [0, 0.1, 1, 10, 25, 50, 75, 90, 99, 99.9, 100];
    return milestonePercents.map((percent) => {
      const tokenIndex = Math.floor(percent / 100 * (total - 1));
      return {
        label: percent === 0 ? "First token" : percent === 100 ? "Last token" : `${percent}% sold`,
        tokenIndex,
        price: this.getPriceAtToken(tokenIndex),
        percentSold: percent
      };
    });
  }
};
function formatPrice(price) {
  if (price >= 1e6) return `$${(price / 1e6).toFixed(1)}M`;
  if (price >= 1e3) return `$${(price / 1e3).toFixed(1)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(2)}`;
  if (price >= 1e-3) return `$${price.toFixed(3)}`;
  if (price >= 1e-4) return `$${price.toFixed(4)}`;
  if (price >= 1e-5) return `$${price.toFixed(5)}`;
  if (price >= 1e-6) return `$${price.toFixed(6)}`;
  if (price >= 1e-7) return `$${price.toFixed(7)}`;
  if (price >= 1e-8) return `$${price.toFixed(8)}`;
  if (price >= 1e-9) return `$${price.toFixed(9)}`;
  return `$${price.toFixed(10)}`;
}
function formatNumber(n) {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}
function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
function createBondingCurve(config = {}) {
  return new BondingCurve(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BondingCurve,
  CURVE_PRESETS,
  DEFAULT_CONFIG,
  createBondingCurve,
  formatCurrency,
  formatNumber,
  formatPrice
});
//# sourceMappingURL=index.cjs.map