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
  DividendEngine: () => DividendEngine,
  calculateProRata: () => calculateProRata,
  calculateSharePercent: () => calculateSharePercent,
  createDividendEngine: () => createDividendEngine,
  formatPaymentAmount: () => formatPaymentAmount,
  groupPaymentsByRange: () => groupPaymentsByRange
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_CONFIG = {
  minPayment: 0.01,
  currency: "USD",
  includeWithoutHandles: false
};
var DividendEngine = class {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Generate unique distribution ID
   */
  generateId() {
    return `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Calculate pro-rata distribution
   */
  calculateDistribution(input) {
    const {
      totalAmount,
      currency = this.config.currency,
      holders,
      minPayment = this.config.minPayment,
      source,
      tokenId
    } = input;
    const activeHolders = holders.filter((h) => h.balance > BigInt(0));
    const totalTokens = activeHolders.reduce(
      (sum, h) => sum + h.balance,
      BigInt(0)
    );
    if (totalTokens === BigInt(0)) {
      return {
        id: this.generateId(),
        totalAmount,
        totalDistributed: 0,
        belowThreshold: totalAmount,
        currency,
        source,
        tokenId,
        totalTokens: BigInt(0),
        perTokenAmount: 0,
        eligibleHolders: 0,
        belowMinimumHolders: 0,
        payments: [],
        calculatedAt: /* @__PURE__ */ new Date()
      };
    }
    const perTokenAmount = totalAmount / Number(totalTokens);
    const payments = [];
    let totalDistributed = 0;
    let belowThreshold = 0;
    let belowMinimumHolders = 0;
    for (const holder of activeHolders) {
      if (!this.config.includeWithoutHandles && !holder.paymentHandle) {
        continue;
      }
      const sharePercent = Number(holder.balance) / Number(totalTokens) * 100;
      const amount = Number(holder.balance) * perTokenAmount;
      const roundedAmount = Math.round(amount * 100) / 100;
      if (roundedAmount >= minPayment) {
        payments.push({
          userId: holder.userId,
          paymentHandle: holder.paymentHandle || holder.userId,
          balance: holder.balance,
          sharePercent,
          amount: roundedAmount,
          currency
        });
        totalDistributed += roundedAmount;
      } else {
        belowThreshold += roundedAmount;
        belowMinimumHolders++;
      }
    }
    return {
      id: this.generateId(),
      totalAmount,
      totalDistributed,
      belowThreshold,
      currency,
      source,
      tokenId,
      totalTokens,
      perTokenAmount,
      eligibleHolders: payments.length,
      belowMinimumHolders,
      payments,
      calculatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Calculate waterfall distribution (multi-tier)
   */
  calculateWaterfall(input) {
    const {
      totalAmount,
      currency = this.config.currency,
      tiers,
      minPayment = this.config.minPayment,
      source
    } = input;
    const tierSum = tiers.reduce((sum, t) => sum + t.percentage, 0);
    if (Math.abs(tierSum - 100) > 0.01) {
      throw new Error(`Waterfall tiers must sum to 100%, got ${tierSum}%`);
    }
    return tiers.map((tier) => {
      const tierAmount = totalAmount * tier.percentage / 100;
      return this.calculateDistribution({
        totalAmount: tierAmount,
        currency,
        holders: tier.holders,
        minPayment,
        source: source ? `${source} - ${tier.name}` : tier.name
      });
    });
  }
  /**
   * Calculate distribution with fixed splits (e.g., 70% to holders, 30% to treasury)
   */
  calculateSplit(input) {
    const distributions = [];
    const fixedPayments = [];
    for (const split of input.splits) {
      const amount = input.totalAmount * split.percentage / 100;
      if (split.destination === "holders" && split.holders) {
        distributions.push(
          this.calculateDistribution({
            totalAmount: amount,
            currency: input.currency,
            holders: split.holders,
            minPayment: input.minPayment,
            source: input.source ? `${input.source} - ${split.name}` : split.name
          })
        );
      } else if (split.destination === "fixed" && split.fixedAddress) {
        fixedPayments.push({
          name: split.name,
          address: split.fixedAddress,
          amount
        });
      }
    }
    return { distributions, fixedPayments };
  }
  /**
   * Simulate distribution without executing
   */
  simulate(input) {
    const distribution = this.calculateDistribution(input);
    const amounts = distribution.payments.map((p) => p.amount).sort((a, b) => a - b);
    return {
      distribution,
      summary: {
        totalHolders: input.holders.length,
        eligibleHolders: distribution.eligibleHolders,
        largestPayment: amounts[amounts.length - 1] || 0,
        smallestPayment: amounts[0] || 0,
        medianPayment: amounts[Math.floor(amounts.length / 2)] || 0,
        averagePayment: distribution.eligibleHolders > 0 ? distribution.totalDistributed / distribution.eligibleHolders : 0
      }
    };
  }
};
function createDividendEngine(config = {}) {
  return new DividendEngine(config);
}
function calculateProRata(totalAmount, holders, options = {}) {
  const engine = new DividendEngine(options);
  return engine.calculateDistribution({
    totalAmount,
    holders,
    ...options
  });
}
function calculateSharePercent(balance, totalSupply) {
  if (totalSupply === BigInt(0)) return 0;
  return Number(balance) / Number(totalSupply) * 100;
}
function formatPaymentAmount(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
function groupPaymentsByRange(payments) {
  const ranges = {
    "micro (<$1)": [],
    "small ($1-$10)": [],
    "medium ($10-$100)": [],
    "large ($100-$1000)": [],
    "whale (>$1000)": []
  };
  for (const payment of payments) {
    if (payment.amount < 1) {
      ranges["micro (<$1)"].push(payment);
    } else if (payment.amount < 10) {
      ranges["small ($1-$10)"].push(payment);
    } else if (payment.amount < 100) {
      ranges["medium ($10-$100)"].push(payment);
    } else if (payment.amount < 1e3) {
      ranges["large ($100-$1000)"].push(payment);
    } else {
      ranges["whale (>$1000)"].push(payment);
    }
  }
  return ranges;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DividendEngine,
  calculateProRata,
  calculateSharePercent,
  createDividendEngine,
  formatPaymentAmount,
  groupPaymentsByRange
});
//# sourceMappingURL=index.cjs.map