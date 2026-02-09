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
  YOURS_CHROME_STORE_URL: () => YOURS_CHROME_STORE_URL,
  YOURS_EXTENSION_ID: () => YOURS_EXTENSION_ID,
  YOURS_WALLET_URL: () => YOURS_WALLET_URL,
  YoursWallet: () => YoursWallet,
  createYoursWallet: () => createYoursWallet,
  formatSatoshis: () => formatSatoshis,
  getYoursProvider: () => getYoursProvider,
  isValidPaymail: () => isValidPaymail,
  isYoursInstalled: () => isYoursInstalled,
  parsePaymail: () => parsePaymail,
  satsToUsd: () => satsToUsd,
  usdToSats: () => usdToSats,
  waitForYours: () => waitForYours
});
module.exports = __toCommonJS(index_exports);
var YOURS_EXTENSION_ID = "yours-wallet";
var YOURS_WALLET_URL = "https://yours.org";
var YOURS_CHROME_STORE_URL = "https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj";
var YoursWallet = class {
  constructor(options = {}) {
    this.provider = null;
    this.identity = null;
    this.state = "disconnected";
    this.listeners = /* @__PURE__ */ new Map();
    this.options = options;
    this.detectProvider();
  }
  // ==========================================================================
  // Provider Detection
  // ==========================================================================
  detectProvider() {
    if (typeof window !== "undefined") {
      const win = window;
      if (win.yours) {
        this.provider = win.yours;
        this.setupEventListeners();
        if (this.options.autoConnect) {
          this.connect().catch(() => {
          });
        }
      }
    }
  }
  setupEventListeners() {
    if (!this.provider) return;
    this.provider.on("connect", (data) => {
      this.state = "connected";
      this.emit("connect", data);
    });
    this.provider.on("disconnect", () => {
      this.state = "disconnected";
      this.identity = null;
      this.emit("disconnect", void 0);
      this.options.onDisconnect?.();
    });
    this.provider.on("accountChange", (data) => {
      this.emit("accountChange", data);
    });
  }
  // ==========================================================================
  // Connection
  // ==========================================================================
  isInstalled() {
    return this.provider !== null;
  }
  isConnected() {
    return this.state === "connected" && this.identity !== null;
  }
  getState() {
    return this.state;
  }
  getIdentity() {
    return this.identity;
  }
  async connect() {
    if (!this.provider) {
      throw new Error("Yours Wallet not installed");
    }
    this.state = "connecting";
    this.emit("stateChange", this.state);
    try {
      this.identity = await this.provider.connect();
      this.state = "connected";
      this.emit("stateChange", this.state);
      this.emit("connect", this.identity);
      this.options.onConnect?.(this.identity);
      return this.identity;
    } catch (error) {
      this.state = "error";
      this.emit("stateChange", this.state);
      const err = error instanceof Error ? error : new Error(String(error));
      this.options.onError?.(err);
      throw err;
    }
  }
  async disconnect() {
    if (!this.provider) return;
    await this.provider.disconnect();
    this.identity = null;
    this.state = "disconnected";
    this.emit("stateChange", this.state);
    this.emit("disconnect", void 0);
    this.options.onDisconnect?.();
  }
  // ==========================================================================
  // Account Information
  // ==========================================================================
  async getAddresses() {
    this.ensureConnected();
    return this.provider.getAddresses();
  }
  async getBalance() {
    this.ensureConnected();
    return this.provider.getBalance();
  }
  async getOrdinals() {
    this.ensureConnected();
    return this.provider.getOrdinals();
  }
  async getSocialProfile() {
    this.ensureConnected();
    return this.provider.getSocialProfile();
  }
  async getExchangeRate() {
    this.ensureConnected();
    return this.provider.getExchangeRate();
  }
  // ==========================================================================
  // Transactions
  // ==========================================================================
  async sendBsv(params) {
    this.ensureConnected();
    return this.provider.sendBsv(params);
  }
  async sendToAddress(address, satoshis) {
    return this.sendBsv({ address, satoshis });
  }
  async sendToPaymail(paymail, satoshis) {
    return this.sendBsv({ paymail, satoshis });
  }
  async sendWithData(satoshis, data, address) {
    return this.sendBsv({ satoshis, data, address });
  }
  async transferOrdinal(params) {
    this.ensureConnected();
    return this.provider.transferOrdinal(params);
  }
  async sendOrdinalToAddress(origin, address) {
    return this.transferOrdinal({ origin, address });
  }
  async sendOrdinalToPaymail(origin, paymail) {
    return this.transferOrdinal({ origin, paymail });
  }
  // ==========================================================================
  // Signing
  // ==========================================================================
  async signMessage(message, encoding) {
    this.ensureConnected();
    return this.provider.signMessage({ message, encoding });
  }
  async getSignatures(rawtx, sigRequests) {
    this.ensureConnected();
    return this.provider.getSignatures({ rawtx, sigRequests });
  }
  // ==========================================================================
  // Broadcasting
  // ==========================================================================
  async broadcast(rawtx) {
    this.ensureConnected();
    return this.provider.broadcast({ rawtx });
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data);
        } catch {
        }
      }
    }
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  ensureConnected() {
    if (!this.provider) {
      throw new Error("Yours Wallet not installed");
    }
    if (!this.isConnected()) {
      throw new Error("Yours Wallet not connected");
    }
  }
  getPaymail() {
    return this.identity?.paymail || null;
  }
  getBsvAddress() {
    return this.identity?.addresses.bsvAddress || null;
  }
  getOrdAddress() {
    return this.identity?.addresses.ordAddress || null;
  }
  getIdentityAddress() {
    return this.identity?.addresses.identityAddress || null;
  }
  getPubKey() {
    return this.identity?.pubKey || null;
  }
};
function createYoursWallet(options) {
  return new YoursWallet(options);
}
function isYoursInstalled() {
  if (typeof window === "undefined") return false;
  const win = window;
  return !!win.yours;
}
function getYoursProvider() {
  if (typeof window === "undefined") return null;
  const win = window;
  return win.yours || null;
}
async function waitForYours(timeout = 3e3) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const provider = getYoursProvider();
    if (provider?.isReady) {
      return provider;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Yours Wallet not found");
}
function parsePaymail(paymail) {
  const match = paymail.match(/^([^@]+)@([^@]+)$/);
  if (!match) return null;
  return { alias: match[1], domain: match[2] };
}
function isValidPaymail(paymail) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(paymail);
}
function formatSatoshis(sats) {
  if (sats >= 1e8) {
    return `${(sats / 1e8).toFixed(8)} BSV`;
  }
  if (sats >= 1e3) {
    return `${(sats / 1e3).toFixed(2)}k sats`;
  }
  return `${sats} sats`;
}
function satsToUsd(sats, exchangeRate) {
  return sats / 1e8 * exchangeRate;
}
function usdToSats(usd, exchangeRate) {
  return Math.round(usd / exchangeRate * 1e8);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  YOURS_CHROME_STORE_URL,
  YOURS_EXTENSION_ID,
  YOURS_WALLET_URL,
  YoursWallet,
  createYoursWallet,
  formatSatoshis,
  getYoursProvider,
  isValidPaymail,
  isYoursInstalled,
  parsePaymail,
  satsToUsd,
  usdToSats,
  waitForYours
});
//# sourceMappingURL=index.cjs.map