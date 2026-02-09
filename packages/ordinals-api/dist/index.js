// src/index.ts
var DEFAULT_CONFIG = {
  baseUrl: "https://api.hiro.so/ordinals/v1",
  apiKey: "",
  timeout: 3e4,
  retries: 3
};
var API_ENDPOINTS = {
  hiro: "https://api.hiro.so/ordinals/v1",
  ordapi: "https://ordapi.xyz",
  ordiscan: "https://api.ordiscan.com/v1",
  bestinslot: "https://api.bestinslot.xyz/v3"
};
var OrdinalsClient = class {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
  }
  // ==========================================================================
  // HTTP Helpers
  // ==========================================================================
  async request(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };
    if (this.config.apiKey) {
      headers["x-api-key"] = this.config.apiKey;
    }
    let lastError;
    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: error || `HTTP ${response.status}` };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.config.retries - 1) {
          await this.sleep(1e3 * (attempt + 1));
        }
      }
    }
    return { success: false, error: lastError?.message || "Request failed" };
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  buildQuery(params) {
    const query = Object.entries(params).filter(([, v]) => v !== void 0).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
    return query ? `?${query}` : "";
  }
  // ==========================================================================
  // Inscriptions
  // ==========================================================================
  async getInscription(id) {
    return this.request(`/inscriptions/${id}`);
  }
  async getInscriptions(options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/inscriptions${query}`);
  }
  async getInscriptionsByAddress(address, options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/inscriptions?address=${address}${query ? "&" + query.slice(1) : ""}`);
  }
  async getInscriptionContent(id) {
    const response = await this.request(`/inscriptions/${id}`);
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }
    try {
      const contentUrl = `${this.config.baseUrl}/inscriptions/${id}/content`;
      const contentResponse = await fetch(contentUrl);
      const buffer = await contentResponse.arrayBuffer();
      const content = new Uint8Array(buffer);
      return {
        success: true,
        data: {
          id,
          contentType: response.data.content_type,
          content,
          text: response.data.content_type.startsWith("text/") ? new TextDecoder().decode(content) : void 0
        }
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to fetch content" };
    }
  }
  async getInscriptionsByBlock(blockHeight, options = {}) {
    const query = this.buildQuery({ ...options, genesis_block: blockHeight });
    return this.request(`/inscriptions${query}`);
  }
  async searchInscriptions(params) {
    const query = this.buildQuery({
      mime_type: params.contentType,
      from_number: params.fromNumber,
      to_number: params.toNumber,
      from_genesis_block_height: params.fromBlock,
      to_genesis_block_height: params.toBlock,
      offset: params.offset,
      limit: params.limit
    });
    return this.request(`/inscriptions${query}`);
  }
  // ==========================================================================
  // BRC-20 Tokens
  // ==========================================================================
  async getBRC20Tokens(options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/brc-20/tokens${query}`);
  }
  async getBRC20Token(ticker) {
    return this.request(`/brc-20/tokens/${ticker}`);
  }
  async getBRC20Balances(address, options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/brc-20/balances/${address}${query}`);
  }
  async getBRC20Balance(address, ticker) {
    return this.request(`/brc-20/balances/${address}/${ticker}`);
  }
  async getBRC20Transfers(ticker, options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/brc-20/tokens/${ticker}/transfers${query}`);
  }
  async getBRC20Holders(ticker, options = {}) {
    const query = this.buildQuery(options);
    return this.request(
      `/brc-20/tokens/${ticker}/holders${query}`
    );
  }
  // ==========================================================================
  // Sats
  // ==========================================================================
  async getSat(satNumber) {
    return this.request(`/sats/${satNumber}`);
  }
  async getSatByName(name) {
    return this.request(`/sats/${name}`);
  }
  async getSatInscriptions(satNumber, options = {}) {
    const query = this.buildQuery(options);
    return this.request(`/sats/${satNumber}/inscriptions${query}`);
  }
  // ==========================================================================
  // Stats
  // ==========================================================================
  async getStats() {
    return this.request(`/stats`);
  }
};
function createOrdinalsClient(options) {
  return new OrdinalsClient(options);
}
function parseInscriptionId(id) {
  const match = id.match(/^([a-f0-9]{64})i(\d+)$/i);
  if (!match) return null;
  return { txid: match[1], index: parseInt(match[2], 10) };
}
function createInscriptionId(txid, index) {
  return `${txid}i${index}`;
}
function getSatRarity(satNumber) {
  if (satNumber === 0) return "mythic";
  const SATS_PER_CYCLE = 2100000000000000n / 6n;
  if (BigInt(satNumber) % SATS_PER_CYCLE === 0n) return "legendary";
  const HALVING_SATS = [
    0n,
    1050000000000000n,
    1575000000000000n,
    1837500000000000n
  ];
  if (HALVING_SATS.includes(BigInt(satNumber))) return "epic";
  const SATS_PER_ADJUSTMENT = 50000000n * 2016n;
  if (BigInt(satNumber) % SATS_PER_ADJUSTMENT === 0n) return "rare";
  const SATS_PER_BLOCK = 50000000n;
  if (BigInt(satNumber) % SATS_PER_BLOCK === 0n) return "uncommon";
  return "common";
}
function parseBRC20Content(content) {
  try {
    const json = JSON.parse(content);
    if (json.p !== "brc-20") return null;
    return json;
  } catch {
    return null;
  }
}
function createBRC20Deploy(ticker, maxSupply, mintLimit, decimals) {
  return JSON.stringify({
    p: "brc-20",
    op: "deploy",
    tick: ticker,
    max: maxSupply,
    lim: mintLimit || maxSupply,
    dec: decimals?.toString() || "18"
  });
}
function createBRC20Mint(ticker, amount) {
  return JSON.stringify({
    p: "brc-20",
    op: "mint",
    tick: ticker,
    amt: amount
  });
}
function createBRC20Transfer(ticker, amount) {
  return JSON.stringify({
    p: "brc-20",
    op: "transfer",
    tick: ticker,
    amt: amount
  });
}
export {
  API_ENDPOINTS,
  DEFAULT_CONFIG,
  OrdinalsClient,
  createBRC20Deploy,
  createBRC20Mint,
  createBRC20Transfer,
  createInscriptionId,
  createOrdinalsClient,
  getSatRarity,
  parseBRC20Content,
  parseInscriptionId
};
//# sourceMappingURL=index.js.map