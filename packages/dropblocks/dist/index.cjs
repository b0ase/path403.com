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
  ArweaveAdapter: () => ArweaveAdapter,
  BSVAdapter: () => BSVAdapter,
  DropBlocksManager: () => DropBlocksManager,
  IPFSAdapter: () => IPFSAdapter,
  createArweaveAdapter: () => createArweaveAdapter,
  createBSVAdapter: () => createBSVAdapter,
  createDropBlocks: () => createDropBlocks,
  createIPFSAdapter: () => createIPFSAdapter,
  detectProvider: () => detectProvider,
  formatFileSize: () => formatFileSize,
  getMimeType: () => getMimeType,
  isArweaveTxid: () => isArweaveTxid,
  isBSVTxid: () => isBSVTxid,
  isIPFSCid: () => isIPFSCid
});
module.exports = __toCommonJS(index_exports);
var IPFSAdapter = class {
  constructor(config) {
    this.provider = "ipfs";
    this.gateway = config.gateway || "https://ipfs.io/ipfs/";
    this.apiEndpoint = config.endpoint;
    this.apiKey = config.apiKey;
  }
  async upload(data, options) {
    const content = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);
    const cid = `Qm${this.generateRandomString(44)}`;
    return {
      id: this.generateId(),
      name: options?.name || "untitled",
      mimeType: options?.mimeType || "application/octet-stream",
      size: content.length,
      contentId: cid,
      contentIdType: "cid",
      provider: "ipfs",
      status: "pinned",
      url: `${this.gateway}${cid}`,
      gateway: this.gateway,
      checksum,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      expiresAt: options?.expiresAt,
      metadata: options?.metadata
    };
  }
  async download(contentId) {
    const response = await fetch(`${this.gateway}${contentId}`);
    if (!response.ok) {
      throw new Error(`Failed to download from IPFS: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  async delete(_contentId) {
    return false;
  }
  getUrl(contentId) {
    return `${this.gateway}${contentId}`;
  }
  async pin(contentId) {
    return {
      isPinned: true,
      provider: "ipfs",
      contentId,
      pinnedAt: /* @__PURE__ */ new Date()
    };
  }
  async unpin(_contentId) {
    return true;
  }
  async getStatus(_contentId) {
    return "pinned";
  }
  generateId() {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  async computeChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
};
var ArweaveAdapter = class {
  constructor(config) {
    this.provider = "arweave";
    this.gateway = config.gateway || "https://arweave.net/";
    this.apiEndpoint = config.endpoint || "https://arweave.net";
  }
  async upload(data, options) {
    const content = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);
    const txid = this.generateRandomString(43);
    return {
      id: this.generateId(),
      name: options?.name || "untitled",
      mimeType: options?.mimeType || "application/octet-stream",
      size: content.length,
      contentId: txid,
      contentIdType: "txid",
      provider: "arweave",
      status: "pinned",
      url: `${this.gateway}${txid}`,
      gateway: this.gateway,
      checksum,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      metadata: options?.metadata
    };
  }
  async download(contentId) {
    const response = await fetch(`${this.gateway}${contentId}`);
    if (!response.ok) {
      throw new Error(`Failed to download from Arweave: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  async delete(_contentId) {
    return false;
  }
  getUrl(contentId) {
    return `${this.gateway}${contentId}`;
  }
  async pin(contentId) {
    return {
      isPinned: true,
      provider: "arweave",
      contentId,
      pinnedAt: /* @__PURE__ */ new Date()
    };
  }
  async unpin(_contentId) {
    return false;
  }
  async getStatus(_contentId) {
    return "pinned";
  }
  generateId() {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  async computeChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
};
var BSVAdapter = class {
  constructor(config) {
    this.provider = "bsv";
    this.network = config.options?.network || "mainnet";
  }
  async upload(data, options) {
    const content = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);
    const txid = this.generateTxid();
    return {
      id: this.generateId(),
      name: options?.name || "untitled",
      mimeType: options?.mimeType || "application/octet-stream",
      size: content.length,
      contentId: txid,
      contentIdType: "txid",
      provider: "bsv",
      status: "pinned",
      url: this.getUrl(txid),
      checksum,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      metadata: options?.metadata
    };
  }
  async download(contentId) {
    const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/tx/${contentId}/hex`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download from BSV: ${response.statusText}`);
    }
    const hex = await response.text();
    return this.hexToBytes(hex);
  }
  async delete(_contentId) {
    return false;
  }
  getUrl(contentId) {
    return `https://whatsonchain.com/tx/${contentId}`;
  }
  async pin(contentId) {
    return {
      isPinned: true,
      provider: "bsv",
      contentId,
      pinnedAt: /* @__PURE__ */ new Date()
    };
  }
  async unpin(_contentId) {
    return false;
  }
  async getStatus(_contentId) {
    return "pinned";
  }
  generateId() {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateTxid() {
    const chars = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  async computeChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
};
var DropBlocksManager = class {
  constructor(defaultProvider = "ipfs") {
    this.adapters = /* @__PURE__ */ new Map();
    this.files = /* @__PURE__ */ new Map();
    this.defaultProvider = defaultProvider;
  }
  registerAdapter(adapter) {
    this.adapters.set(adapter.provider, adapter);
  }
  setDefaultProvider(provider) {
    if (!this.adapters.has(provider)) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }
    this.defaultProvider = provider;
  }
  getAdapter(provider) {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }
    return adapter;
  }
  async upload(data, options) {
    const provider = options?.provider || this.defaultProvider;
    const adapter = this.getAdapter(provider);
    const file = await adapter.upload(data, options);
    this.files.set(file.id, file);
    if (options?.replicate && options.replicate.length > 0) {
      const replicas = [];
      for (const replicaProvider of options.replicate) {
        if (replicaProvider === provider) continue;
        try {
          const replicaAdapter = this.getAdapter(replicaProvider);
          const replicaFile = await replicaAdapter.upload(data, options);
          replicas.push({
            provider: replicaProvider,
            contentId: replicaFile.contentId,
            contentIdType: replicaFile.contentIdType,
            url: replicaFile.url,
            status: "replicated",
            syncedAt: /* @__PURE__ */ new Date()
          });
        } catch (error) {
          replicas.push({
            provider: replicaProvider,
            contentId: "",
            contentIdType: "hash",
            status: "failed",
            syncedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      file.replicas = replicas;
      file.status = "replicated";
      this.files.set(file.id, file);
    }
    return file;
  }
  async download(fileIdOrContentId, provider) {
    const file = this.files.get(fileIdOrContentId);
    if (file) {
      const adapter2 = this.getAdapter(provider || file.provider);
      return adapter2.download(file.contentId);
    }
    if (!provider) {
      throw new Error("Provider required when downloading by content ID");
    }
    const adapter = this.getAdapter(provider);
    return adapter.download(fileIdOrContentId);
  }
  async delete(fileId) {
    const file = this.files.get(fileId);
    if (!file) return false;
    const adapter = this.getAdapter(file.provider);
    await adapter.delete(file.contentId);
    file.status = "deleted";
    file.updatedAt = /* @__PURE__ */ new Date();
    this.files.set(fileId, file);
    return true;
  }
  getFile(fileId) {
    return this.files.get(fileId);
  }
  getFileByContentId(contentId) {
    for (const file of this.files.values()) {
      if (file.contentId === contentId) return file;
    }
    return void 0;
  }
  getUrl(fileId) {
    const file = this.files.get(fileId);
    if (!file) return void 0;
    const adapter = this.getAdapter(file.provider);
    return adapter.getUrl(file.contentId);
  }
  async pin(fileId) {
    const file = this.files.get(fileId);
    if (!file) return void 0;
    const adapter = this.getAdapter(file.provider);
    return adapter.pin(file.contentId);
  }
  async unpin(fileId) {
    const file = this.files.get(fileId);
    if (!file) return false;
    const adapter = this.getAdapter(file.provider);
    return adapter.unpin(file.contentId);
  }
  listFiles(filter) {
    let files = Array.from(this.files.values());
    if (filter?.provider) {
      files = files.filter((f) => f.provider === filter.provider);
    }
    if (filter?.status) {
      files = files.filter((f) => f.status === filter.status);
    }
    if (filter?.mimeType) {
      files = files.filter((f) => f.mimeType === filter.mimeType);
    }
    return files;
  }
  getStats() {
    const files = Array.from(this.files.values());
    const byProvider = {};
    const byStatus = {};
    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
      if (!byProvider[file.provider]) {
        byProvider[file.provider] = { files: 0, size: 0 };
      }
      byProvider[file.provider].files++;
      byProvider[file.provider].size += file.size;
      byStatus[file.status] = (byStatus[file.status] || 0) + 1;
    }
    return {
      totalFiles: files.length,
      totalSize,
      byProvider,
      byStatus
    };
  }
  async replicate(fileId, targetProviders) {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }
    const data = await this.download(fileId);
    const replicas = file.replicas || [];
    for (const provider of targetProviders) {
      if (provider === file.provider) continue;
      const existingReplica = replicas.find((r) => r.provider === provider);
      if (existingReplica && existingReplica.status === "replicated") continue;
      try {
        const adapter = this.getAdapter(provider);
        const replicaFile = await adapter.upload(data, {
          name: file.name,
          mimeType: file.mimeType,
          metadata: file.metadata
        });
        const replicaIndex = replicas.findIndex((r) => r.provider === provider);
        const replica = {
          provider,
          contentId: replicaFile.contentId,
          contentIdType: replicaFile.contentIdType,
          url: replicaFile.url,
          status: "replicated",
          syncedAt: /* @__PURE__ */ new Date()
        };
        if (replicaIndex >= 0) {
          replicas[replicaIndex] = replica;
        } else {
          replicas.push(replica);
        }
      } catch (error) {
        const replica = {
          provider,
          contentId: "",
          contentIdType: "hash",
          status: "failed",
          syncedAt: /* @__PURE__ */ new Date()
        };
        replicas.push(replica);
      }
    }
    file.replicas = replicas;
    file.status = "replicated";
    file.updatedAt = /* @__PURE__ */ new Date();
    this.files.set(fileId, file);
    return replicas;
  }
};
function createDropBlocks(defaultProvider = "ipfs") {
  return new DropBlocksManager(defaultProvider);
}
function createIPFSAdapter(config = {}) {
  return new IPFSAdapter({ provider: "ipfs", ...config });
}
function createArweaveAdapter(config = {}) {
  return new ArweaveAdapter({ provider: "arweave", ...config });
}
function createBSVAdapter(config = {}) {
  return new BSVAdapter({ provider: "bsv", ...config });
}
function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
function getMimeType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Data
    json: "application/json",
    xml: "application/xml",
    csv: "text/csv",
    // Code
    js: "application/javascript",
    ts: "application/typescript",
    html: "text/html",
    css: "text/css",
    // Media
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    webm: "video/webm",
    // Archives
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip"
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}
function isIPFSCid(str) {
  return str.startsWith("Qm") || str.startsWith("bafy");
}
function isArweaveTxid(str) {
  return /^[a-zA-Z0-9_-]{43}$/.test(str);
}
function isBSVTxid(str) {
  return /^[a-fA-F0-9]{64}$/.test(str);
}
function detectProvider(contentId) {
  if (isIPFSCid(contentId)) return "ipfs";
  if (isArweaveTxid(contentId)) return "arweave";
  if (isBSVTxid(contentId)) return "bsv";
  return void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArweaveAdapter,
  BSVAdapter,
  DropBlocksManager,
  IPFSAdapter,
  createArweaveAdapter,
  createBSVAdapter,
  createDropBlocks,
  createIPFSAdapter,
  detectProvider,
  formatFileSize,
  getMimeType,
  isArweaveTxid,
  isBSVTxid,
  isIPFSCid
});
//# sourceMappingURL=index.cjs.map