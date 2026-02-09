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
  addBlockchainRef: () => addBlockchainRef,
  addStorageRef: () => addStorageRef,
  burnContainer: () => burnContainer,
  createFTContainer: () => createFTContainer,
  createNFTContainer: () => createNFTContainer,
  deserializeContainer: () => deserializeContainer,
  getContainerExtension: () => getContainerExtension,
  getContainerFilename: () => getContainerFilename,
  hashContent: () => hashContent,
  isFTContainer: () => isFTContainer,
  isMinted: () => isMinted,
  isNFTContainer: () => isNFTContainer,
  isStored: () => isStored,
  serializeContainer: () => serializeContainer,
  transferOwnership: () => transferOwnership,
  validateContainer: () => validateContainer
});
module.exports = __toCommonJS(index_exports);

// src/container.ts
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
async function hashContent(content) {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle?.digest) {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", content);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content[i] | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
function getExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}
async function createNFTContainer(input) {
  const now = /* @__PURE__ */ new Date();
  const id = generateId("nft");
  let contentHash = "";
  if (input.file.content) {
    contentHash = await hashContent(input.file.content);
  }
  const file = {
    name: input.file.name,
    mimeType: input.file.mimeType,
    size: input.file.size,
    contentHash,
    extension: getExtension(input.file.name),
    createdAt: now
  };
  const provenance = [
    {
      event: "created",
      to: input.creators[0]?.address,
      timestamp: now
    }
  ];
  return {
    version: "1.0",
    type: "nft",
    id,
    file,
    token: input.token,
    creators: input.creators,
    provenance,
    blockchainRefs: input.blockchainRefs || [],
    storageRefs: input.storageRefs || [],
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata,
    content: input.file.content
  };
}
function createFTContainer(input) {
  const now = /* @__PURE__ */ new Date();
  const id = generateId("ft");
  return {
    version: "1.0",
    type: "ft",
    id,
    token: input.token,
    supply: {
      totalSupply: input.supply.totalSupply,
      circulatingSupply: input.supply.circulatingSupply ?? input.supply.totalSupply,
      decimals: input.supply.decimals,
      mintable: input.supply.mintable,
      burnable: input.supply.burnable,
      maxSupply: input.supply.maxSupply
    },
    creators: input.creators,
    blockchainRefs: input.blockchainRefs || [],
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata
  };
}
function addBlockchainRef(container, ref) {
  return {
    ...container,
    blockchainRefs: [...container.blockchainRefs, ref],
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function addStorageRef(container, ref) {
  return {
    ...container,
    storageRefs: [...container.storageRefs, ref],
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function transferOwnership(container, newOwner, options) {
  const now = /* @__PURE__ */ new Date();
  const previousOwner = container.ownership?.owner;
  const ownership = {
    owner: newOwner,
    since: now,
    acquisitionType: options?.price ? "purchase" : "transfer",
    price: options?.price,
    currency: options?.currency,
    txRef: options?.txRef
  };
  const provenanceEntry = {
    event: options?.price ? "sold" : "transferred",
    from: previousOwner,
    to: newOwner,
    price: options?.price,
    currency: options?.currency,
    timestamp: now,
    txRef: options?.txRef
  };
  return {
    ...container,
    ownership,
    provenance: [...container.provenance, provenanceEntry],
    updatedAt: now
  };
}
function burnContainer(container, txRef) {
  const now = /* @__PURE__ */ new Date();
  const provenanceEntry = {
    event: "burned",
    from: container.ownership?.owner,
    timestamp: now,
    txRef
  };
  return {
    ...container,
    provenance: [...container.provenance, provenanceEntry],
    updatedAt: now,
    metadata: {
      ...container.metadata,
      burned: true,
      burnedAt: now.toISOString()
    }
  };
}
function validateContainer(container) {
  const errors = [];
  const warnings = [];
  if (!container.version) errors.push("Missing version");
  if (!container.type) errors.push("Missing type");
  if (!container.id) errors.push("Missing id");
  if (!container.token?.name) errors.push("Missing token name");
  if (!container.token?.symbol) errors.push("Missing token symbol");
  if (container.creators.length === 0) errors.push("At least one creator required");
  if (container.type === "nft") {
    const nft = container;
    if (!nft.file?.name) errors.push("Missing file name");
    if (!nft.file?.mimeType) errors.push("Missing file MIME type");
    if (nft.file?.size <= 0) errors.push("Invalid file size");
  } else if (container.type === "ft") {
    const ft = container;
    if (ft.supply.totalSupply <= BigInt(0)) {
      errors.push("Total supply must be positive");
    }
    if (ft.supply.decimals < 0 || ft.supply.decimals > 18) {
      errors.push("Decimals must be 0-18");
    }
  }
  if (container.blockchainRefs.length === 0) {
    warnings.push("No blockchain references (not minted)");
  }
  if (container.type === "nft") {
    const nft = container;
    if (nft.storageRefs.length === 0) {
      warnings.push("No storage references (file not uploaded)");
    }
    if (!nft.file?.contentHash) {
      warnings.push("No content hash (integrity cannot be verified)");
    }
  }
  const totalShare = container.creators.reduce((sum, c) => sum + c.share, 0);
  if (Math.abs(totalShare - 100) > 0.01) {
    warnings.push(`Creator shares sum to ${totalShare}%, expected 100%`);
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
function isNFTContainer(container) {
  return container.type === "nft";
}
function isFTContainer(container) {
  return container.type === "ft";
}
function isMinted(container) {
  return container.blockchainRefs.some((ref) => ref.txid || ref.inscriptionId);
}
function isStored(container) {
  return container.storageRefs.length > 0;
}
function serializeContainer(container) {
  const serializable = { ...container };
  if (isNFTContainer(serializable) && serializable.content) {
    const base64 = Buffer.from(serializable.content).toString("base64");
    serializable.contentBase64 = base64;
    delete serializable.content;
  }
  return JSON.stringify(
    serializable,
    (_, value) => typeof value === "bigint" ? value.toString() + "n" : value,
    2
  );
}
function deserializeContainer(json) {
  const parsed = JSON.parse(json, (_, value) => {
    if (typeof value === "string" && value.endsWith("n")) {
      const num = value.slice(0, -1);
      if (/^\d+$/.test(num)) {
        return BigInt(num);
      }
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value);
    }
    return value;
  });
  if (parsed.contentBase64) {
    parsed.content = new Uint8Array(Buffer.from(parsed.contentBase64, "base64"));
    delete parsed.contentBase64;
  }
  return parsed;
}
function getContainerExtension(container) {
  return container.type === "nft" ? ".nft" : ".ft";
}
function getContainerFilename(container) {
  const baseName = container.token.symbol.toLowerCase();
  return `${baseName}${getContainerExtension(container)}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addBlockchainRef,
  addStorageRef,
  burnContainer,
  createFTContainer,
  createNFTContainer,
  deserializeContainer,
  getContainerExtension,
  getContainerFilename,
  hashContent,
  isFTContainer,
  isMinted,
  isNFTContainer,
  isStored,
  serializeContainer,
  transferOwnership,
  validateContainer
});
//# sourceMappingURL=index.cjs.map