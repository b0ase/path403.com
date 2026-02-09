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
  CONTENT_TYPE_MAP: () => CONTENT_TYPE_MAP,
  DEFAULT_FEE_RATE: () => DEFAULT_FEE_RATE,
  InscriptionService: () => InscriptionService,
  MAX_CONTENT_SIZE: () => MAX_CONTENT_SIZE,
  calculateContentHash: () => calculateContentHash,
  createInscriptionService: () => createInscriptionService,
  formatFileSize: () => formatFileSize,
  formatInscriptionId: () => formatInscriptionId,
  formatSatpoint: () => formatSatpoint,
  getContentTypeFromExtension: () => getContentTypeFromExtension,
  getInscriptionType: () => getInscriptionType,
  isValidInscriptionContent: () => isValidInscriptionContent,
  parseInscriptionId: () => parseInscriptionId,
  parseSatpoint: () => parseSatpoint
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_FEE_RATE = 1;
var CONTENT_TYPE_MAP = {
  "txt": "text/plain",
  "html": "text/html",
  "css": "text/css",
  "js": "text/javascript",
  "json": "application/json",
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "webp": "image/webp",
  "svg": "image/svg+xml",
  "mp4": "video/mp4",
  "webm": "video/webm",
  "mp3": "audio/mpeg",
  "wav": "audio/wav",
  "glb": "model/gltf-binary",
  "pdf": "application/pdf"
};
var MAX_CONTENT_SIZE = 400 * 1024;
var InscriptionService = class {
  constructor(network = "bsv", apiUrl) {
    this.inscriptions = /* @__PURE__ */ new Map();
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.network = network;
    this.apiUrl = apiUrl || this.getDefaultApiUrl(network);
  }
  getDefaultApiUrl(network) {
    switch (network) {
      case "bsv":
        return "https://api.1satordinals.com";
      case "bitcoin":
        return "https://ordinals.com";
    }
  }
  // ==========================================================================
  // Inscription Creation
  // ==========================================================================
  createEnvelope(content, contentType, metadata) {
    const contentBytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
    return {
      contentType,
      content: contentBytes,
      metadata
    };
  }
  async prepareInscription(request) {
    const { envelope, feeRate, destinationAddress, changeAddress } = request;
    if (envelope.content.length > MAX_CONTENT_SIZE) {
      throw new Error(`Content exceeds maximum size of ${MAX_CONTENT_SIZE} bytes`);
    }
    const feeEstimate = this.estimateFees(envelope, feeRate);
    const envelopeScript = this.buildEnvelopeScript(envelope);
    const prepared = {
      id: generateInscriptionId(),
      envelope,
      envelopeScript,
      destinationAddress,
      changeAddress: changeAddress || destinationAddress,
      feeEstimate,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.pendingRequests.set(prepared.id, request);
    return prepared;
  }
  estimateFees(envelope, feeRate) {
    const envelopeSize = 30 + envelope.content.length + 50;
    const commitSize = 150;
    const revealSize = envelopeSize + 150;
    const commitFee = BigInt(Math.ceil(commitSize * feeRate));
    const revealFee = BigInt(Math.ceil(revealSize * feeRate));
    return {
      commit: commitFee,
      reveal: revealFee,
      total: commitFee + revealFee,
      feeRate,
      size: { commit: commitSize, reveal: revealSize }
    };
  }
  buildEnvelopeScript(envelope) {
    const parts = [];
    parts.push("0063036f7264");
    parts.push("01");
    parts.push(this.pushData(new TextEncoder().encode(envelope.contentType)));
    parts.push("00");
    parts.push(this.pushData(envelope.content));
    if (envelope.pointer !== void 0) {
      parts.push("02");
      parts.push(this.pushInt(envelope.pointer));
    }
    if (envelope.parent) {
      parts.push("03");
      parts.push(this.pushData(hexToBytes(envelope.parent)));
    }
    if (envelope.metadata) {
      parts.push("05");
      const metadataJson = JSON.stringify(envelope.metadata);
      parts.push(this.pushData(new TextEncoder().encode(metadataJson)));
    }
    if (envelope.metaprotocol) {
      parts.push("07");
      parts.push(this.pushData(new TextEncoder().encode(envelope.metaprotocol)));
    }
    if (envelope.delegate) {
      parts.push("0b");
      parts.push(this.pushData(hexToBytes(envelope.delegate)));
    }
    parts.push("68");
    return parts.join("");
  }
  pushData(data) {
    const len = data.length;
    let prefix;
    if (len <= 75) {
      prefix = len.toString(16).padStart(2, "0");
    } else if (len <= 255) {
      prefix = "4c" + len.toString(16).padStart(2, "0");
    } else if (len <= 65535) {
      const lenHex = len.toString(16).padStart(4, "0");
      prefix = "4d" + lenHex.slice(2, 4) + lenHex.slice(0, 2);
    } else {
      const lenHex = len.toString(16).padStart(8, "0");
      prefix = "4e" + lenHex.slice(6, 8) + lenHex.slice(4, 6) + lenHex.slice(2, 4) + lenHex.slice(0, 2);
    }
    return prefix + bytesToHex(data);
  }
  pushInt(n) {
    if (n === 0) return "00";
    if (n >= 1 && n <= 16) return (80 + n).toString(16);
    if (n < 256) return "01" + n.toString(16).padStart(2, "0");
    if (n < 65536) {
      const hex2 = n.toString(16).padStart(4, "0");
      return "02" + hex2.slice(2, 4) + hex2.slice(0, 2);
    }
    const hex = n.toString(16).padStart(8, "0");
    return "04" + hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);
  }
  // ==========================================================================
  // Inscription Lookup
  // ==========================================================================
  async getInscription(inscriptionId) {
    const cached = this.inscriptions.get(inscriptionId);
    if (cached) return cached;
    return null;
  }
  async getInscriptionContent(inscriptionId) {
    const info = await this.getInscription(inscriptionId);
    return info?.content || null;
  }
  async getInscriptionsByAddress(address) {
    return [];
  }
  async getCollection(collectionId) {
    return null;
  }
  // ==========================================================================
  // Batch Operations
  // ==========================================================================
  async prepareBatchInscription(envelopes, destinationAddress, feeRate = DEFAULT_FEE_RATE) {
    const batch = {
      id: generateBatchId(),
      envelopes,
      status: "pending",
      results: [],
      totalFee: 0n,
      createdAt: /* @__PURE__ */ new Date()
    };
    for (const envelope of envelopes) {
      const estimate = this.estimateFees(envelope, feeRate);
      batch.totalFee += estimate.total;
    }
    return batch;
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  getExplorerUrl(inscriptionId) {
    switch (this.network) {
      case "bsv":
        return `https://1satordinals.com/inscription/${inscriptionId}`;
      case "bitcoin":
        return `https://ordinals.com/inscription/${inscriptionId}`;
    }
  }
  getContentUrl(inscriptionId) {
    switch (this.network) {
      case "bsv":
        return `https://1satordinals.com/content/${inscriptionId}`;
      case "bitcoin":
        return `https://ordinals.com/content/${inscriptionId}`;
    }
  }
  setNetwork(network) {
    this.network = network;
    this.apiUrl = this.getDefaultApiUrl(network);
  }
  getNetwork() {
    return this.network;
  }
};
function createInscriptionService(network = "bsv", apiUrl) {
  return new InscriptionService(network, apiUrl);
}
function generateInscriptionId() {
  return `pending_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function generateBatchId() {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function getContentTypeFromExtension(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPE_MAP[ext] || "application/octet-stream";
}
function getInscriptionType(contentType) {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType === "text/html") return "html";
  if (contentType === "text/plain") return "text";
  if (contentType === "application/json") return "json";
  if (contentType === "application/pdf") return "document";
  if (contentType === "model/gltf-binary") return "3d";
  if (contentType.includes("javascript") || contentType === "text/css") return "code";
  return "text";
}
function parseInscriptionId(inscriptionId) {
  const parts = inscriptionId.split("i");
  if (parts.length !== 2) return null;
  const txid = parts[0];
  const index = parseInt(parts[1], 10);
  if (txid.length !== 64 || isNaN(index)) return null;
  return { txid, index };
}
function formatInscriptionId(txid, index) {
  return `${txid}i${index}`;
}
function formatSatpoint(txid, vout, offset = 0) {
  return `${txid}:${vout}:${offset}`;
}
function parseSatpoint(satpoint) {
  const parts = satpoint.split(":");
  if (parts.length < 2) return null;
  const txid = parts[0];
  const vout = parseInt(parts[1], 10);
  const offset = parts[2] ? parseInt(parts[2], 10) : 0;
  if (txid.length !== 64 || isNaN(vout)) return null;
  return { txid, vout, offset };
}
function calculateContentHash(content) {
  let hash = 0n;
  for (const byte of content) {
    hash = (hash * 31n + BigInt(byte)) % 2n ** 256n;
  }
  return hash.toString(16).padStart(64, "0");
}
function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}
function isValidInscriptionContent(content) {
  if (content.length === 0) {
    return { valid: false, error: "Content cannot be empty" };
  }
  if (content.length > MAX_CONTENT_SIZE) {
    return {
      valid: false,
      error: `Content exceeds maximum size of ${formatFileSize(MAX_CONTENT_SIZE)}`
    };
  }
  return { valid: true };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CONTENT_TYPE_MAP,
  DEFAULT_FEE_RATE,
  InscriptionService,
  MAX_CONTENT_SIZE,
  calculateContentHash,
  createInscriptionService,
  formatFileSize,
  formatInscriptionId,
  formatSatpoint,
  getContentTypeFromExtension,
  getInscriptionType,
  isValidInscriptionContent,
  parseInscriptionId,
  parseSatpoint
});
//# sourceMappingURL=index.cjs.map