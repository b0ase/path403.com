// src/publisher.ts
var DEFAULT_CONFIG = {
  network: "mainnet",
  apiBaseUrl: "https://api.whatsonchain.com/v1/bsv/main",
  feeRate: 0.5,
  minFee: 500,
  timeout: 3e4,
  explorerUrlTemplate: "https://whatsonchain.com/tx/{txid}",
  ordinalsUrlTemplate: "https://1satordinals.com/inscription/{inscriptionId}"
};
var TESTNET_CONFIG = {
  apiBaseUrl: "https://api.whatsonchain.com/v1/bsv/test",
  explorerUrlTemplate: "https://test.whatsonchain.com/tx/{txid}"
};
async function fetchWithTimeout(url, options = {}, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
async function sha256(data) {
  const encoder = new TextEncoder();
  const dataBytes = typeof data === "string" ? encoder.encode(data) : data;
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle?.digest) {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  throw new Error("crypto.subtle not available - use Node.js crypto module");
}
function toBytes(content) {
  if (content instanceof Uint8Array) return content;
  return new TextEncoder().encode(content);
}
function estimateTxSize(dataSize, numInputs = 1) {
  const BASE_OVERHEAD = 10;
  const INPUT_SIZE = 148;
  const OUTPUT_SIZE = 34;
  const OP_RETURN_OVERHEAD = 9;
  return BASE_OVERHEAD + INPUT_SIZE * numInputs + OP_RETURN_OVERHEAD + dataSize + OUTPUT_SIZE;
}
var ChainPublisher = class {
  constructor(config = {}) {
    const network = config.network || "mainnet";
    const networkConfig = network === "testnet" ? TESTNET_CONFIG : {};
    this.config = {
      ...DEFAULT_CONFIG,
      ...networkConfig,
      ...config
    };
  }
  /**
   * Get API base URL
   */
  getApiBaseUrl() {
    return this.config.apiBaseUrl;
  }
  /**
   * Get explorer URL for a transaction
   */
  getExplorerUrl(txid) {
    return this.config.explorerUrlTemplate.replace("{txid}", txid);
  }
  /**
   * Get ordinals URL for an inscription
   */
  getOrdinalsUrl(inscriptionId) {
    return this.config.ordinalsUrlTemplate.replace("{inscriptionId}", inscriptionId);
  }
  /**
   * Fetch UTXOs for an address
   */
  async fetchUtxos(address) {
    const url = `${this.config.apiBaseUrl}/address/${address}/unspent`;
    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((utxo) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      satoshis: utxo.value,
      height: utxo.height
    }));
  }
  /**
   * Broadcast raw transaction
   */
  async broadcast(rawTx) {
    const url = `${this.config.apiBaseUrl}/tx/raw`;
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txhex: rawTx })
      },
      this.config.timeout
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to broadcast: ${response.statusText} - ${errorText}`);
    }
    const txid = await response.text();
    return txid.replace(/"/g, "");
  }
  /**
   * Get transaction details
   */
  async getTransaction(txid) {
    const url = `${this.config.apiBaseUrl}/tx/${txid}`;
    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to get transaction: ${response.statusText}`);
    }
    return await response.json();
  }
  /**
   * Calculate fee for data size
   */
  calculateFee(dataSize, numInputs = 1) {
    const txSize = estimateTxSize(dataSize, numInputs);
    const fee = Math.ceil(txSize * this.config.feeRate);
    return Math.max(fee, this.config.minFee);
  }
  /**
   * Build OP_RETURN script data
   *
   * Creates the data portion for an OP_RETURN output.
   * Format: [protocolId, contentType, content, ...metadata]
   */
  buildOpReturnData(input) {
    const parts = [];
    parts.push(new TextEncoder().encode(input.protocolId));
    parts.push(new TextEncoder().encode(input.contentType));
    parts.push(toBytes(input.content));
    if (input.metadata) {
      parts.push(new TextEncoder().encode(JSON.stringify(input.metadata)));
    }
    return parts;
  }
  /**
   * Build ordinal inscription data
   *
   * Creates data for 1Sat Ordinal inscription.
   */
  buildOrdinalData(input) {
    return {
      contentType: input.contentType,
      content: toBytes(input.content),
      metadata: input.metadata ? JSON.stringify(input.metadata) : void 0
    };
  }
  /**
   * Build B:// protocol data
   *
   * Format: OP_FALSE OP_RETURN "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut" <data> <media_type> <encoding> [filename]
   */
  buildBProtocolData(input) {
    const B_PREFIX = "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut";
    const parts = [];
    parts.push(new TextEncoder().encode(B_PREFIX));
    parts.push(input.content);
    parts.push(new TextEncoder().encode(input.contentType));
    parts.push(new TextEncoder().encode(input.encoding || "binary"));
    if (input.filename) {
      parts.push(new TextEncoder().encode(input.filename));
    }
    return parts;
  }
  /**
   * Verify an inscription/transaction
   */
  async verify(input) {
    try {
      const tx = await this.getTransaction(input.txid);
      if (!tx) {
        return {
          valid: false,
          found: false,
          confirmations: 0,
          error: "Transaction not found"
        };
      }
      const confirmations = tx.confirmations || 0;
      const blockHeight = tx.blockheight;
      let content;
      let contentHash;
      const outputs = tx.vout;
      for (const output of outputs) {
        const asm = output.scriptPubKey?.asm || "";
        if (asm.startsWith("OP_RETURN") || asm.startsWith("0 OP_RETURN")) {
          const hex = output.scriptPubKey?.hex || "";
          if (hex.length > 4) {
            const dataHex = hex.slice(4);
            content = Buffer.from(dataHex, "hex").toString("utf-8");
            contentHash = await sha256(content);
          }
        }
      }
      const hashMatches = input.expectedHash ? contentHash === input.expectedHash : void 0;
      return {
        valid: true,
        found: true,
        confirmations,
        blockHeight,
        content,
        contentHash,
        hashMatches
      };
    } catch (error) {
      return {
        valid: false,
        found: false,
        confirmations: 0,
        error: error instanceof Error ? error.message : "Verification failed"
      };
    }
  }
};
function createMainnetPublisher(config) {
  return new ChainPublisher({ ...config, network: "mainnet" });
}
function createTestnetPublisher(config) {
  return new ChainPublisher({ ...config, network: "testnet" });
}
function generateInscriptionId(txid, vout = 0) {
  return `${txid}i${vout}`;
}
function parseInscriptionId(inscriptionId) {
  const match = inscriptionId.match(/^([a-f0-9]{64})i(\d+)$/);
  if (!match) {
    throw new Error(`Invalid inscription ID: ${inscriptionId}`);
  }
  return {
    txid: match[1],
    vout: parseInt(match[2], 10)
  };
}
function satsToBsv(sats) {
  return (sats / 1e8).toFixed(8);
}
function bsvToSats(bsv) {
  return Math.round(bsv * 1e8);
}
export {
  ChainPublisher,
  bsvToSats,
  createMainnetPublisher,
  createTestnetPublisher,
  generateInscriptionId,
  parseInscriptionId,
  satsToBsv,
  sha256
};
//# sourceMappingURL=index.js.map