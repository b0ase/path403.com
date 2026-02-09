// src/index.ts
var PaymentSplitter = class {
  constructor(options) {
    this.defaultCurrency = "USD";
    this.defaultRoundTo = 2;
    this.defaultMinimum = 0.01;
    if (options?.defaultCurrency) this.defaultCurrency = options.defaultCurrency;
    if (options?.defaultRoundTo !== void 0) this.defaultRoundTo = options.defaultRoundTo;
    if (options?.defaultMinimum !== void 0) this.defaultMinimum = options.defaultMinimum;
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Round to decimal places
   */
  round(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
  /**
   * Calculate percentage split
   */
  calculatePercentageSplit(config) {
    const roundTo = config.roundTo ?? this.defaultRoundTo;
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments = [];
    const totalPercent = config.recipients.reduce(
      (sum, r) => sum + (r.percent || 0),
      0
    );
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100%, got ${totalPercent}%`);
    }
    for (const recipient of config.recipients) {
      const percent = recipient.percent || 0;
      let amount = this.round(config.totalAmount * percent / 100, roundTo);
      if (recipient.maximumAmount && amount > recipient.maximumAmount) {
        amount = recipient.maximumAmount;
      }
      const belowMinimum = amount < minimum;
      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: percent,
        belowMinimum
      });
    }
    return payments;
  }
  /**
   * Calculate fixed split
   */
  calculateFixedSplit(config) {
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments = [];
    const totalFixed = config.recipients.reduce(
      (sum, r) => sum + (r.fixedAmount || 0),
      0
    );
    if (totalFixed > config.totalAmount) {
      throw new Error(
        `Fixed amounts (${totalFixed}) exceed total (${config.totalAmount})`
      );
    }
    for (const recipient of config.recipients) {
      const amount = recipient.fixedAmount || 0;
      const belowMinimum = amount < minimum;
      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: amount / config.totalAmount * 100,
        belowMinimum
      });
    }
    return payments;
  }
  /**
   * Calculate waterfall split
   */
  calculateWaterfallSplit(config) {
    const roundTo = config.roundTo ?? this.defaultRoundTo;
    const minimum = config.minimumPayment ?? this.defaultMinimum;
    const payments = [];
    const sorted = [...config.recipients].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0)
    );
    let remaining = config.totalAmount;
    for (const recipient of sorted) {
      if (remaining <= 0) {
        payments.push({
          recipientId: recipient.id,
          address: recipient.address,
          amount: 0,
          currency: config.currency,
          percentOfTotal: 0,
          belowMinimum: true
        });
        continue;
      }
      let amount = recipient.fixedAmount || remaining;
      amount = Math.min(amount, remaining);
      if (recipient.maximumAmount) {
        amount = Math.min(amount, recipient.maximumAmount);
      }
      amount = this.round(amount, roundTo);
      remaining -= amount;
      const belowMinimum = amount < minimum;
      payments.push({
        recipientId: recipient.id,
        address: recipient.address,
        amount: belowMinimum ? 0 : amount,
        currency: config.currency,
        percentOfTotal: amount / config.totalAmount * 100,
        belowMinimum
      });
    }
    return payments;
  }
  /**
   * Create payment split
   */
  split(config) {
    const splitType = config.splitType || "percentage";
    let payments;
    switch (splitType) {
      case "percentage":
        payments = this.calculatePercentageSplit(config);
        break;
      case "fixed":
        payments = this.calculateFixedSplit(config);
        break;
      case "waterfall":
      case "priority":
        payments = this.calculateWaterfallSplit(config);
        break;
      default:
        throw new Error(`Unknown split type: ${splitType}`);
    }
    const distributedAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainder = this.round(
      config.totalAmount - distributedAmount,
      config.roundTo ?? this.defaultRoundTo
    );
    if (remainder > 0 && config.remainderTo) {
      const remainderPayment = payments.find(
        (p) => p.recipientId === config.remainderTo
      );
      if (remainderPayment) {
        remainderPayment.amount += remainder;
      }
    }
    return {
      id: this.generateId(),
      totalAmount: config.totalAmount,
      distributedAmount: distributedAmount + (config.remainderTo ? remainder : 0),
      remainder: config.remainderTo ? 0 : remainder,
      currency: config.currency,
      payments,
      belowMinimumCount: payments.filter((p) => p.belowMinimum).length,
      splitType,
      createdAt: /* @__PURE__ */ new Date(),
      source: config.source
    };
  }
  /**
   * Validate split configuration
   */
  validate(config) {
    const errors = [];
    if (config.totalAmount <= 0) {
      errors.push("Total amount must be positive");
    }
    if (config.recipients.length === 0) {
      errors.push("At least one recipient required");
    }
    const splitType = config.splitType || "percentage";
    if (splitType === "percentage") {
      const totalPercent = config.recipients.reduce(
        (sum, r) => sum + (r.percent || 0),
        0
      );
      if (Math.abs(totalPercent - 100) > 0.01) {
        errors.push(`Percentages must sum to 100%, got ${totalPercent}%`);
      }
    }
    if (splitType === "fixed") {
      const totalFixed = config.recipients.reduce(
        (sum, r) => sum + (r.fixedAmount || 0),
        0
      );
      if (totalFixed > config.totalAmount) {
        errors.push(
          `Fixed amounts (${totalFixed}) exceed total (${config.totalAmount})`
        );
      }
    }
    const ids = config.recipients.map((r) => r.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate recipient IDs: ${duplicates.join(", ")}`);
    }
    return { valid: errors.length === 0, errors };
  }
};
function createPaymentSplitter(options) {
  return new PaymentSplitter(options);
}
function createPaymentSplit(config) {
  const splitter = new PaymentSplitter();
  return splitter.split(config);
}
function creatorPlatformSplit(totalAmount, creatorAddress, platformAddress, currency = "USD") {
  return createPaymentSplit({
    totalAmount,
    currency,
    recipients: [
      { id: "creator", address: creatorAddress, percent: 70 },
      { id: "platform", address: platformAddress, percent: 30 }
    ]
  });
}
function threeWaySplit(totalAmount, addresses, percentages = { creator: 70, platform: 25, referrer: 5 }, currency = "USD") {
  return createPaymentSplit({
    totalAmount,
    currency,
    recipients: [
      { id: "creator", address: addresses.creator, percent: percentages.creator },
      { id: "platform", address: addresses.platform, percent: percentages.platform },
      { id: "referrer", address: addresses.referrer, percent: percentages.referrer }
    ]
  });
}
function formatAmount(amount, currency) {
  const symbols = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\xA3",
    BTC: "\u20BF",
    ETH: "\u039E",
    BSV: "BSV ",
    SOL: "SOL ",
    USDC: "USDC ",
    USDT: "USDT "
  };
  const decimals = ["BTC", "ETH", "BSV", "SOL"].includes(currency) ? 8 : 2;
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${amount.toFixed(decimals)}`;
}
function calculatePlatformFee(amount, feePercent, minFee = 0) {
  const fee = amount * (feePercent / 100);
  return Math.max(fee, minFee);
}
export {
  PaymentSplitter,
  calculatePlatformFee,
  createPaymentSplit,
  createPaymentSplitter,
  creatorPlatformSplit,
  formatAmount,
  threeWaySplit
};
//# sourceMappingURL=index.js.map