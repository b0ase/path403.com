// src/index.ts
var IPFS_PROVIDER = {
  id: "ipfs",
  name: "IPFS",
  description: "InterPlanetary File System - decentralized content addressing",
  type: "ipfs",
  permanence: "pinned",
  tier: "hot",
  icon: "globe",
  maxFileSize: 0,
  // Unlimited
  supportsDirectories: true,
  decentralized: true,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: "ipfs://",
  supportedTypes: [],
  features: ["content-addressing", "deduplication", "p2p", "versioning"]
};
var ARWEAVE_PROVIDER = {
  id: "arweave",
  name: "Arweave",
  description: "Permanent, decentralized storage on the permaweb",
  type: "arweave",
  permanence: "permanent",
  tier: "archive",
  icon: "archive",
  maxFileSize: 0,
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 5e-3,
  // ~$0.005 per MB
  uriPrefix: "ar://",
  supportedTypes: [],
  features: ["permanent", "immutable", "censorship-resistant"]
};
var B_PROTOCOL_PROVIDER = {
  id: "b-protocol",
  name: "B:// Protocol",
  description: "Bitcoin SV on-chain file storage",
  type: "blockchain",
  permanence: "permanent",
  tier: "archive",
  icon: "database",
  maxFileSize: 1e5,
  // ~100KB practical limit
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5,
  // ~$0.50 per MB in BSV fees
  uriPrefix: "b://",
  supportedTypes: [],
  features: ["immutable", "on-chain", "timestamped"]
};
var BCAT_PROVIDER = {
  id: "bcat",
  name: "Bcat Protocol",
  description: "Bitcoin SV chunked file storage for larger files",
  type: "blockchain",
  permanence: "permanent",
  tier: "archive",
  icon: "layers",
  maxFileSize: 1e7,
  // ~10MB with chunking
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5,
  uriPrefix: "bcat://",
  supportedTypes: [],
  features: ["immutable", "on-chain", "chunked", "large-files"]
};
var D_PROTOCOL_PROVIDER = {
  id: "d-protocol",
  name: "D:// Protocol",
  description: "Dynamic Bitcoin SV storage with updates",
  type: "blockchain",
  permanence: "permanent",
  tier: "hot",
  icon: "refresh-cw",
  maxFileSize: 1e5,
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5,
  uriPrefix: "d://",
  supportedTypes: [],
  features: ["updatable", "on-chain", "versioned"]
};
var S3_PROVIDER = {
  id: "s3",
  name: "Amazon S3",
  description: "AWS Simple Storage Service",
  type: "cloud",
  permanence: "temporary",
  tier: "hot",
  icon: "cloud",
  maxFileSize: 5e12,
  // 5TB
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: true,
  costPerMb: 23e-6,
  // ~$0.023 per GB
  uriPrefix: "s3://",
  supportedTypes: [],
  features: ["scalable", "cdn", "versioning", "lifecycle"]
};
var SUPABASE_PROVIDER = {
  id: "supabase",
  name: "Supabase Storage",
  description: "Supabase file storage with RLS",
  type: "cloud",
  permanence: "temporary",
  tier: "hot",
  icon: "database",
  maxFileSize: 5e7,
  // 50MB default
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: "supabase://",
  supportedTypes: [],
  features: ["rls", "cdn", "transforms", "policies"]
};
var LOCAL_PROVIDER = {
  id: "local",
  name: "Local Storage",
  description: "Local filesystem storage",
  type: "cloud",
  permanence: "temporary",
  tier: "hot",
  icon: "hard-drive",
  maxFileSize: 0,
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: "file://",
  supportedTypes: [],
  features: ["fast", "private", "no-network"]
};
var STORAGE_PROVIDERS = [
  IPFS_PROVIDER,
  ARWEAVE_PROVIDER,
  B_PROTOCOL_PROVIDER,
  BCAT_PROVIDER,
  D_PROTOCOL_PROVIDER,
  S3_PROVIDER,
  SUPABASE_PROVIDER,
  LOCAL_PROVIDER
];
var PROVIDERS_BY_ID = {
  ipfs: IPFS_PROVIDER,
  arweave: ARWEAVE_PROVIDER,
  "b-protocol": B_PROTOCOL_PROVIDER,
  bcat: BCAT_PROVIDER,
  "d-protocol": D_PROTOCOL_PROVIDER,
  s3: S3_PROVIDER,
  supabase: SUPABASE_PROVIDER,
  local: LOCAL_PROVIDER
};
var BLOCKCHAIN_PROVIDERS = [
  B_PROTOCOL_PROVIDER,
  BCAT_PROVIDER,
  D_PROTOCOL_PROVIDER
];
var DECENTRALIZED_PROVIDERS = [
  IPFS_PROVIDER,
  ARWEAVE_PROVIDER,
  ...BLOCKCHAIN_PROVIDERS
];
var CLOUD_PROVIDERS = [S3_PROVIDER, SUPABASE_PROVIDER, LOCAL_PROVIDER];
function getProvider(id) {
  return PROVIDERS_BY_ID[id];
}
function getProviderOrThrow(id) {
  const provider = getProvider(id);
  if (!provider) {
    throw new Error(`Storage provider not found: ${id}`);
  }
  return provider;
}
function selectBestProvider(criteria) {
  let candidates = [...STORAGE_PROVIDERS];
  if (criteria.fileSize) {
    candidates = candidates.filter(
      (p) => p.maxFileSize === 0 || p.maxFileSize >= criteria.fileSize
    );
  }
  if (criteria.permanence) {
    const permanenceOrder = ["temporary", "pinned", "permanent"];
    const minIndex = permanenceOrder.indexOf(criteria.permanence);
    candidates = candidates.filter(
      (p) => permanenceOrder.indexOf(p.permanence) >= minIndex
    );
  }
  if (criteria.requireDecentralized) {
    candidates = candidates.filter((p) => p.decentralized);
  }
  if (criteria.budget) {
    const maxCost = {
      free: 0,
      low: 0.01,
      medium: 0.1,
      high: 1,
      unlimited: Infinity
    }[criteria.budget];
    candidates = candidates.filter((p) => p.costPerMb <= maxCost);
  }
  candidates.sort((a, b) => a.costPerMb - b.costPerMb);
  return candidates[0];
}
function getMatchingProviders(criteria) {
  let candidates = [...STORAGE_PROVIDERS];
  if (criteria.fileSize) {
    candidates = candidates.filter(
      (p) => p.maxFileSize === 0 || p.maxFileSize >= criteria.fileSize
    );
  }
  if (criteria.permanence === "permanent") {
    candidates = candidates.filter((p) => p.permanence === "permanent");
  }
  if (criteria.requireDecentralized) {
    candidates = candidates.filter((p) => p.decentralized);
  }
  return candidates;
}
function estimateStorageCost(providerId, sizeBytes) {
  const provider = getProvider(providerId);
  if (!provider) {
    return { cost: 0, currency: "USD" };
  }
  const sizeMb = sizeBytes / (1024 * 1024);
  return {
    cost: sizeMb * provider.costPerMb,
    currency: "USD"
  };
}
function formatStorageSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function parseStorageUri(uri) {
  for (const provider of STORAGE_PROVIDERS) {
    if (uri.startsWith(provider.uriPrefix)) {
      return {
        provider: provider.id,
        path: uri.slice(provider.uriPrefix.length)
      };
    }
  }
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    if (uri.includes("ipfs.io") || uri.includes("dweb.link")) {
      return { provider: "ipfs", path: uri };
    }
    if (uri.includes("arweave.net")) {
      return { provider: "arweave", path: uri };
    }
  }
  return { path: uri };
}
function createStorageReference(options) {
  return {
    provider: options.provider,
    uri: options.uri,
    hash: options.hash,
    size: options.size,
    contentType: options.contentType,
    uploadedAt: /* @__PURE__ */ new Date(),
    metadata: options.metadata
  };
}
export {
  ARWEAVE_PROVIDER,
  BCAT_PROVIDER,
  BLOCKCHAIN_PROVIDERS,
  B_PROTOCOL_PROVIDER,
  CLOUD_PROVIDERS,
  DECENTRALIZED_PROVIDERS,
  D_PROTOCOL_PROVIDER,
  IPFS_PROVIDER,
  LOCAL_PROVIDER,
  PROVIDERS_BY_ID,
  S3_PROVIDER,
  STORAGE_PROVIDERS,
  SUPABASE_PROVIDER,
  createStorageReference,
  estimateStorageCost,
  formatStorageSize,
  getMatchingProviders,
  getProvider,
  getProviderOrThrow,
  parseStorageUri,
  selectBestProvider
};
//# sourceMappingURL=index.js.map