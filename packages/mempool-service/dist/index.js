// src/index.ts
var NETWORK_URLS = {
  mainnet: {
    api: "https://mempool.space/api",
    ws: "wss://mempool.space/api/v1/ws"
  },
  testnet: {
    api: "https://mempool.space/testnet/api",
    ws: "wss://mempool.space/testnet/api/v1/ws"
  },
  signet: {
    api: "https://mempool.space/signet/api",
    ws: "wss://mempool.space/signet/api/v1/ws"
  }
};
var MempoolClient = class {
  constructor(options = {}) {
    this.ws = null;
    this.listeners = /* @__PURE__ */ new Map();
    this.subscriptions = { blocks: false, mempool: false, addresses: /* @__PURE__ */ new Set() };
    this.network = options.network || "mainnet";
    this.baseUrl = options.baseUrl || NETWORK_URLS[this.network].api;
    this.wsUrl = options.wsUrl || NETWORK_URLS[this.network].ws;
    this.timeout = options.timeout || 3e4;
  }
  // ==========================================================================
  // HTTP Helpers
  // ==========================================================================
  async request(endpoint) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  // ==========================================================================
  // Fee Estimation
  // ==========================================================================
  async getFeeRates() {
    return this.request("/v1/fees/recommended");
  }
  async getMempoolBlocks() {
    return this.request("/v1/fees/mempool-blocks");
  }
  // ==========================================================================
  // Mempool
  // ==========================================================================
  async getMempoolInfo() {
    return this.request("/mempool");
  }
  async getMempoolTxids() {
    return this.request("/mempool/txids");
  }
  async getRecentMempoolTxs() {
    return this.request("/mempool/recent");
  }
  // ==========================================================================
  // Transactions
  // ==========================================================================
  async getTransaction(txid) {
    return this.request(`/tx/${txid}`);
  }
  async getTxStatus(txid) {
    return this.request(`/tx/${txid}/status`);
  }
  async getTxHex(txid) {
    return this.request(`/tx/${txid}/hex`);
  }
  async getTxRaw(txid) {
    const response = await fetch(`${this.baseUrl}/tx/${txid}/raw`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
  async broadcastTx(txHex) {
    const response = await fetch(`${this.baseUrl}/tx`, {
      method: "POST",
      body: txHex,
      headers: { "Content-Type": "text/plain" }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return response.text();
  }
  async getTxOutspends(txid) {
    return this.request(`/tx/${txid}/outspends`);
  }
  // ==========================================================================
  // Addresses
  // ==========================================================================
  async getAddressInfo(address) {
    return this.request(`/address/${address}`);
  }
  async getAddressTxs(address) {
    return this.request(`/address/${address}/txs`);
  }
  async getAddressTxsChain(address, lastTxid) {
    const endpoint = lastTxid ? `/address/${address}/txs/chain/${lastTxid}` : `/address/${address}/txs/chain`;
    return this.request(endpoint);
  }
  async getAddressTxsMempool(address) {
    return this.request(`/address/${address}/txs/mempool`);
  }
  async getAddressUtxos(address) {
    return this.request(`/address/${address}/utxo`);
  }
  // ==========================================================================
  // Blocks
  // ==========================================================================
  async getBlock(hash) {
    return this.request(`/block/${hash}`);
  }
  async getBlockHeader(hash) {
    return this.request(`/block/${hash}/header`);
  }
  async getBlockHeight(hash) {
    return this.request(`/block/${hash}/height`);
  }
  async getBlockTxids(hash) {
    return this.request(`/block/${hash}/txids`);
  }
  async getBlockTxs(hash, startIndex = 0) {
    return this.request(`/block/${hash}/txs/${startIndex}`);
  }
  async getBlockHashByHeight(height) {
    return this.request(`/block-height/${height}`);
  }
  async getTipHeight() {
    return this.request("/blocks/tip/height");
  }
  async getTipHash() {
    return this.request("/blocks/tip/hash");
  }
  async getRecentBlocks() {
    return this.request("/v1/blocks");
  }
  // ==========================================================================
  // Mining
  // ==========================================================================
  async getDifficultyAdjustment() {
    return this.request("/v1/difficulty-adjustment");
  }
  async getHashrate(timePeriod) {
    const endpoint = timePeriod ? `/v1/mining/hashrate/${timePeriod}` : "/v1/mining/hashrate/3m";
    return this.request(endpoint);
  }
  // ==========================================================================
  // WebSocket
  // ==========================================================================
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.emit("connected", null);
      this.resubscribe();
    };
    this.ws.onclose = () => {
      this.emit("disconnected", null);
    };
    this.ws.onerror = (error) => {
      this.emit("error", error);
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.block) {
          this.emit("block", data.block);
        }
        if (data["address-transactions"]) {
          this.emit("address-tx", data["address-transactions"]);
        }
        if (data.mempoolInfo) {
          this.emit("tx", data);
        }
      } catch {
      }
    };
  }
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  resubscribe() {
    if (this.subscriptions.blocks) {
      this.send({ action: "want", data: ["blocks"] });
    }
    if (this.subscriptions.mempool) {
      this.send({ action: "want", data: ["mempool-blocks"] });
    }
    for (const address of this.subscriptions.addresses) {
      this.send({ "track-address": address });
    }
  }
  subscribeBlocks() {
    this.subscriptions.blocks = true;
    this.send({ action: "want", data: ["blocks"] });
  }
  subscribeMempool() {
    this.subscriptions.mempool = true;
    this.send({ action: "want", data: ["mempool-blocks"] });
  }
  subscribeAddress(address) {
    this.subscriptions.addresses.add(address);
    this.send({ "track-address": address });
  }
  unsubscribeAddress(address) {
    this.subscriptions.addresses.delete(address);
    this.send({ "untrack-address": address });
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
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
  // Utilities
  // ==========================================================================
  async waitForConfirmation(txid, options = {}) {
    const { timeout = 36e5, pollInterval = 3e4 } = options;
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await this.getTxStatus(txid);
      if (status.confirmed) {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    throw new Error("Confirmation timeout");
  }
  async estimateFee(vsize, priority = "halfHour") {
    const rates = await this.getFeeRates();
    const feeMap = {
      fastest: rates.fastestFee,
      halfHour: rates.halfHourFee,
      hour: rates.hourFee,
      economy: rates.economyFee
    };
    return vsize * feeMap[priority];
  }
};
function createMempoolClient(options) {
  return new MempoolClient(options);
}
function calculateVSize(weight) {
  return Math.ceil(weight / 4);
}
function calculateFeeRate(fee, vsize) {
  return Math.round(fee / vsize);
}
function satsToBtc(sats) {
  return (sats / 1e8).toFixed(8);
}
function btcToSats(btc) {
  return Math.round(btc * 1e8);
}
export {
  MempoolClient,
  NETWORK_URLS,
  btcToSats,
  calculateFeeRate,
  calculateVSize,
  createMempoolClient,
  satsToBtc
};
//# sourceMappingURL=index.js.map