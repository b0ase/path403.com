// src/index.ts
var HTTP_402_STATUS = 402;
var DEFAULT_EXPIRY = 36e5;
var DEFAULT_CURRENCY = "USD";
var X402RevenueManager = class {
  constructor(options = {}) {
    this.requests = /* @__PURE__ */ new Map();
    this.receipts = /* @__PURE__ */ new Map();
    this.tokens = /* @__PURE__ */ new Map();
    this.pricing = /* @__PURE__ */ new Map();
    this.options = {
      defaultMethods: options.defaultMethods || ["bsv", "handcash"],
      defaultCurrency: options.defaultCurrency || DEFAULT_CURRENCY,
      requestExpiry: options.requestExpiry || DEFAULT_EXPIRY,
      tokenExpiry: options.tokenExpiry || DEFAULT_EXPIRY * 24,
      onPaymentReceived: options.onPaymentReceived || (() => {
      })
    };
  }
  // ==========================================================================
  // Resource Pricing
  // ==========================================================================
  setResourcePrice(resource, config) {
    this.pricing.set(resource, config);
  }
  getResourcePrice(resource) {
    if (this.pricing.has(resource)) {
      return this.pricing.get(resource);
    }
    for (const [pattern, config] of this.pricing) {
      if (this.matchPattern(resource, pattern)) {
        return config;
      }
    }
    return void 0;
  }
  removeResourcePrice(resource) {
    return this.pricing.delete(resource);
  }
  matchPattern(resource, pattern) {
    if (!pattern.includes("*")) return resource === pattern;
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(resource);
  }
  // ==========================================================================
  // Payment Requests
  // ==========================================================================
  createPaymentRequest(resource, paymentDetails) {
    const config = this.getResourcePrice(resource);
    if (!config) {
      throw new Error(`No pricing configured for resource: ${resource}`);
    }
    const id = this.generateId("req");
    const request = {
      id,
      resource,
      amount: config.amount,
      currency: config.currency,
      methods: config.methods,
      priceModel: config.model,
      expiresAt: Date.now() + this.options.requestExpiry,
      description: config.description,
      paymentDetails
    };
    this.requests.set(id, request);
    return request;
  }
  getPaymentRequest(id) {
    return this.requests.get(id);
  }
  isRequestValid(id) {
    const request = this.requests.get(id);
    if (!request) return false;
    return Date.now() < request.expiresAt;
  }
  // ==========================================================================
  // Payment Verification
  // ==========================================================================
  async verifyPayment(requestId, method, proof) {
    const request = this.requests.get(requestId);
    if (!request) return null;
    if (!this.isRequestValid(requestId)) return null;
    if (!proof.txid && !proof.signature) return null;
    const receipt = {
      id: this.generateId("rcpt"),
      requestId,
      method,
      amount: request.amount,
      currency: request.currency,
      txid: proof.txid,
      paidAt: Date.now(),
      validUntil: request.priceModel === "time-based" ? Date.now() + (this.getResourcePrice(request.resource)?.duration || DEFAULT_EXPIRY) : void 0
    };
    this.receipts.set(receipt.id, receipt);
    this.options.onPaymentReceived(receipt);
    return receipt;
  }
  getReceipt(id) {
    return this.receipts.get(id);
  }
  // ==========================================================================
  // Access Tokens
  // ==========================================================================
  createAccessToken(receipt) {
    const request = this.requests.get(receipt.requestId);
    if (!request) {
      throw new Error("Invalid receipt");
    }
    const config = this.getResourcePrice(request.resource);
    const token = {
      token: this.generateToken(),
      resource: request.resource,
      issuedAt: Date.now(),
      expiresAt: receipt.validUntil || Date.now() + this.options.tokenExpiry,
      usageLimit: config?.requestLimit,
      usageCount: 0
    };
    this.tokens.set(token.token, token);
    return token;
  }
  validateToken(token, resource) {
    const accessToken = this.tokens.get(token);
    if (!accessToken) return false;
    if (Date.now() > accessToken.expiresAt) {
      this.tokens.delete(token);
      return false;
    }
    if (!this.matchPattern(resource, accessToken.resource)) {
      return false;
    }
    if (accessToken.usageLimit && accessToken.usageCount >= accessToken.usageLimit) {
      return false;
    }
    accessToken.usageCount++;
    return true;
  }
  revokeToken(token) {
    return this.tokens.delete(token);
  }
  // ==========================================================================
  // HTTP Response Helpers
  // ==========================================================================
  create402Response(resource, paymentDetails) {
    const request = this.createPaymentRequest(resource, paymentDetails);
    const headers = {
      "X-Payment-Required": "true",
      "X-Payment-Methods": request.methods.join(","),
      "X-Payment-Amount": request.amount.toString(),
      "X-Payment-Currency": request.currency,
      "X-Payment-Request-Id": request.id
    };
    if (paymentDetails.bsv?.address) {
      headers["X-Payment-Address"] = paymentDetails.bsv.address;
    }
    if (paymentDetails.lightning?.invoice) {
      headers["X-Payment-Invoice"] = paymentDetails.lightning.invoice;
    }
    if (request.description) {
      headers["X-Payment-Description"] = request.description;
    }
    headers["X-Payment-Expires"] = new Date(request.expiresAt).toISOString();
    return {
      status: HTTP_402_STATUS,
      headers,
      body: request
    };
  }
  parsePaymentHeader(authorization) {
    if (!authorization) return null;
    if (authorization.startsWith("X402-Token ")) {
      return { token: authorization.slice(11) };
    }
    if (authorization.startsWith("X402-Receipt ")) {
      return { receipt: authorization.slice(13) };
    }
    return null;
  }
  // ==========================================================================
  // Analytics
  // ==========================================================================
  getRevenueStats(startTime, endTime) {
    const start = startTime || 0;
    const end = endTime || Date.now();
    const receipts = Array.from(this.receipts.values()).filter(
      (r) => r.paidAt >= start && r.paidAt <= end
    );
    const byMethod = {
      bsv: 0,
      lightning: 0,
      handcash: 0,
      paymail: 0,
      stripe: 0
    };
    const byResource = {};
    const payers = /* @__PURE__ */ new Set();
    for (const receipt of receipts) {
      byMethod[receipt.method] += receipt.amount;
      const request = this.requests.get(receipt.requestId);
      if (request) {
        byResource[request.resource] = (byResource[request.resource] || 0) + receipt.amount;
      }
      if (receipt.txid) {
        payers.add(receipt.txid.slice(0, 20));
      }
    }
    return {
      totalRevenue: receipts.reduce((sum, r) => sum + r.amount, 0),
      transactionCount: receipts.length,
      uniquePayers: payers.size,
      byMethod,
      byResource,
      period: { start, end }
    };
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  generateToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
  cleanup() {
    const now = Date.now();
    for (const [id, request] of this.requests) {
      if (now > request.expiresAt) {
        this.requests.delete(id);
      }
    }
    for (const [token, accessToken] of this.tokens) {
      if (now > accessToken.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }
};
function createX402Manager(options) {
  return new X402RevenueManager(options);
}
function createPaywall(manager, getPaymentDetails) {
  return (resource, token) => {
    if (token && manager.validateToken(token, resource)) {
      return { allowed: true };
    }
    const pricing = manager.getResourcePrice(resource);
    if (!pricing) {
      return { allowed: true };
    }
    const paymentDetails = getPaymentDetails(resource);
    return {
      allowed: false,
      response: manager.create402Response(resource, paymentDetails)
    };
  };
}
function formatPrice(amount, currency) {
  if (currency === "sats" || currency === "SAT") {
    return `${amount} sats`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}
function convertCurrency(amount, from, to, rates) {
  const fromRate = rates[from.toUpperCase()] || 1;
  const toRate = rates[to.toUpperCase()] || 1;
  return amount / fromRate * toRate;
}
export {
  DEFAULT_CURRENCY,
  DEFAULT_EXPIRY,
  HTTP_402_STATUS,
  X402RevenueManager,
  convertCurrency,
  createPaywall,
  createX402Manager,
  formatPrice
};
//# sourceMappingURL=index.js.map