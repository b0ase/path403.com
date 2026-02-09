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
  WhatsOnChain: () => WhatsOnChain,
  bsvToSats: () => bsvToSats,
  createClient: () => createClient,
  createMainnetClient: () => createMainnetClient,
  createTestnetClient: () => createTestnetClient,
  formatBsv: () => formatBsv,
  isValidAddress: () => isValidAddress,
  isValidTxid: () => isValidTxid,
  satsToBsv: () => satsToBsv
});
module.exports = __toCommonJS(index_exports);
var API_URLS = {
  main: "https://api.whatsonchain.com/v1/bsv/main",
  test: "https://api.whatsonchain.com/v1/bsv/test",
  stn: "https://api.whatsonchain.com/v1/bsv/stn"
};
var DEFAULT_TIMEOUT = 3e4;
var WhatsOnChain = class {
  constructor(config) {
    this.baseUrl = API_URLS[config.network];
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }
  /**
   * Fetch with timeout and error handling
   */
  async fetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) {
      headers["woc-api-key"] = this.apiKey;
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`WoC API error: ${response.status} - ${error}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }
  // ==========================================================================
  // Chain Info
  // ==========================================================================
  /**
   * Get chain info
   */
  async getChainInfo() {
    return this.fetch("/chain/info");
  }
  /**
   * Get current block height
   */
  async getBlockHeight() {
    const info = await this.getChainInfo();
    return info.blocks;
  }
  // ==========================================================================
  // Address APIs
  // ==========================================================================
  /**
   * Get address balance
   */
  async getAddressBalance(address) {
    return this.fetch(`/address/${address}/balance`);
  }
  /**
   * Get address UTXOs
   */
  async getAddressUtxos(address) {
    return this.fetch(`/address/${address}/unspent`);
  }
  /**
   * Get address history (transaction hashes)
   */
  async getAddressHistory(address) {
    return this.fetch(`/address/${address}/history`);
  }
  /**
   * Check if address has been used
   */
  async isAddressUsed(address) {
    const history = await this.getAddressHistory(address);
    return history.length > 0;
  }
  // ==========================================================================
  // Transaction APIs
  // ==========================================================================
  /**
   * Get transaction by ID
   */
  async getTransaction(txid) {
    return this.fetch(`/tx/${txid}`);
  }
  /**
   * Get raw transaction hex
   */
  async getRawTransaction(txid) {
    return this.fetch(`/tx/${txid}/hex`);
  }
  /**
   * Broadcast raw transaction
   */
  async broadcastTx(txhex) {
    const result = await this.fetch("/tx/raw", {
      method: "POST",
      body: JSON.stringify({ txhex })
    });
    return result.replace(/"/g, "");
  }
  /**
   * Get transaction confirmations
   */
  async getConfirmations(txid) {
    const tx = await this.getTransaction(txid);
    return tx.confirmations || 0;
  }
  /**
   * Check if transaction is confirmed
   */
  async isConfirmed(txid, minConfirmations = 1) {
    const confirmations = await this.getConfirmations(txid);
    return confirmations >= minConfirmations;
  }
  // ==========================================================================
  // Block APIs
  // ==========================================================================
  /**
   * Get block header by hash
   */
  async getBlockHeader(hash) {
    return this.fetch(`/block/${hash}/header`);
  }
  /**
   * Get block header by height
   */
  async getBlockHeaderByHeight(height) {
    return this.fetch(`/block/height/${height}`);
  }
  // ==========================================================================
  // Exchange Rate APIs
  // ==========================================================================
  /**
   * Get BSV exchange rate
   */
  async getExchangeRate() {
    return this.fetch("/exchangerate");
  }
  /**
   * Get BSV price in USD
   */
  async getBsvPriceUsd() {
    const rate = await this.getExchangeRate();
    return rate.rate;
  }
  // ==========================================================================
  // Utility Methods
  // ==========================================================================
  /**
   * Get explorer URL for transaction
   */
  getTxUrl(txid) {
    const network = this.baseUrl.includes("/test") ? "test" : "main";
    const domain = network === "test" ? "test.whatsonchain.com" : "whatsonchain.com";
    return `https://${domain}/tx/${txid}`;
  }
  /**
   * Get explorer URL for address
   */
  getAddressUrl(address) {
    const network = this.baseUrl.includes("/test") ? "test" : "main";
    const domain = network === "test" ? "test.whatsonchain.com" : "whatsonchain.com";
    return `https://${domain}/address/${address}`;
  }
  /**
   * Get explorer URL for block
   */
  getBlockUrl(hashOrHeight) {
    const network = this.baseUrl.includes("/test") ? "test" : "main";
    const domain = network === "test" ? "test.whatsonchain.com" : "whatsonchain.com";
    return `https://${domain}/block/${hashOrHeight}`;
  }
};
function createMainnetClient(apiKey) {
  return new WhatsOnChain({ network: "main", apiKey });
}
function createTestnetClient(apiKey) {
  return new WhatsOnChain({ network: "test", apiKey });
}
function createClient(network, apiKey) {
  return new WhatsOnChain({ network, apiKey });
}
function satsToBsv(sats) {
  return sats / 1e8;
}
function bsvToSats(bsv) {
  return Math.round(bsv * 1e8);
}
function formatBsv(sats, decimals = 8) {
  return satsToBsv(sats).toFixed(decimals);
}
function isValidAddress(address) {
  if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return false;
  }
  return true;
}
function isValidTxid(txid) {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WhatsOnChain,
  bsvToSats,
  createClient,
  createMainnetClient,
  createTestnetClient,
  formatBsv,
  isValidAddress,
  isValidTxid,
  satsToBsv
});
//# sourceMappingURL=index.cjs.map