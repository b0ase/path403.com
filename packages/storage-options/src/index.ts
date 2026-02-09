/**
 * @b0ase/storage-options
 *
 * Cloud and blockchain storage option definitions and utilities.
 *
 * @example
 * ```typescript
 * import {
 *   STORAGE_PROVIDERS,
 *   getProvider,
 *   selectBestProvider,
 *   estimateStorageCost,
 * } from '@b0ase/storage-options';
 *
 * // Get all providers
 * console.log(STORAGE_PROVIDERS);
 *
 * // Get specific provider
 * const ipfs = getProvider('ipfs');
 *
 * // Select best provider for use case
 * const best = selectBestProvider({
 *   fileSize: 1024 * 1024, // 1MB
 *   permanence: 'permanent',
 *   budget: 'low',
 * });
 *
 * // Estimate cost
 * const cost = estimateStorageCost('arweave', 1024 * 1024);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Storage provider type */
export type StorageProviderType =
  | 'cloud'      // Traditional cloud (S3, GCS, Azure)
  | 'ipfs'       // IPFS network
  | 'arweave'    // Arweave permanent storage
  | 'blockchain' // On-chain (B://, Bcat, OP_RETURN)
  | 'hybrid';    // Combination

/** Storage permanence */
export type StoragePermanence =
  | 'temporary'  // Can be deleted
  | 'pinned'     // Pinned but not guaranteed
  | 'permanent'; // Immutable/permanent

/** Storage tier */
export type StorageTier =
  | 'hot'        // Frequently accessed
  | 'warm'       // Occasionally accessed
  | 'cold'       // Rarely accessed
  | 'archive';   // Long-term archive

/** Budget level */
export type BudgetLevel = 'free' | 'low' | 'medium' | 'high' | 'unlimited';

/** Storage provider definition */
export interface StorageProvider {
  /** Provider ID */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Provider type */
  type: StorageProviderType;
  /** Permanence level */
  permanence: StoragePermanence;
  /** Storage tier */
  tier: StorageTier;
  /** Icon name (lucide) */
  icon: string;
  /** Max file size in bytes (0 = unlimited) */
  maxFileSize: number;
  /** Supports directories */
  supportsDirectories: boolean;
  /** Is decentralized */
  decentralized: boolean;
  /** Requires payment */
  requiresPayment: boolean;
  /** Base cost per MB (USD, 0 = free) */
  costPerMb: number;
  /** URI prefix */
  uriPrefix: string;
  /** Supported content types (empty = all) */
  supportedTypes: string[];
  /** Features */
  features: string[];
}

/** Storage selection criteria */
export interface StorageSelectionCriteria {
  /** File size in bytes */
  fileSize?: number;
  /** Required permanence */
  permanence?: StoragePermanence;
  /** Budget level */
  budget?: BudgetLevel;
  /** Requires decentralization */
  requireDecentralized?: boolean;
  /** Content type */
  contentType?: string;
  /** Preferred tier */
  tier?: StorageTier;
}

/** Storage reference */
export interface StorageReference {
  /** Provider ID */
  provider: string;
  /** Content URI */
  uri: string;
  /** Content hash */
  hash?: string;
  /** File size */
  size?: number;
  /** Content type */
  contentType?: string;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Expiry (if temporary) */
  expiresAt?: Date;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Storage Providers
// ============================================================================

/** IPFS provider */
export const IPFS_PROVIDER: StorageProvider = {
  id: 'ipfs',
  name: 'IPFS',
  description: 'InterPlanetary File System - decentralized content addressing',
  type: 'ipfs',
  permanence: 'pinned',
  tier: 'hot',
  icon: 'globe',
  maxFileSize: 0, // Unlimited
  supportsDirectories: true,
  decentralized: true,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: 'ipfs://',
  supportedTypes: [],
  features: ['content-addressing', 'deduplication', 'p2p', 'versioning'],
};

/** Arweave provider */
export const ARWEAVE_PROVIDER: StorageProvider = {
  id: 'arweave',
  name: 'Arweave',
  description: 'Permanent, decentralized storage on the permaweb',
  type: 'arweave',
  permanence: 'permanent',
  tier: 'archive',
  icon: 'archive',
  maxFileSize: 0,
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.005, // ~$0.005 per MB
  uriPrefix: 'ar://',
  supportedTypes: [],
  features: ['permanent', 'immutable', 'censorship-resistant'],
};

/** B:// Protocol provider */
export const B_PROTOCOL_PROVIDER: StorageProvider = {
  id: 'b-protocol',
  name: 'B:// Protocol',
  description: 'Bitcoin SV on-chain file storage',
  type: 'blockchain',
  permanence: 'permanent',
  tier: 'archive',
  icon: 'database',
  maxFileSize: 100000, // ~100KB practical limit
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5, // ~$0.50 per MB in BSV fees
  uriPrefix: 'b://',
  supportedTypes: [],
  features: ['immutable', 'on-chain', 'timestamped'],
};

/** Bcat Protocol provider (chunked) */
export const BCAT_PROVIDER: StorageProvider = {
  id: 'bcat',
  name: 'Bcat Protocol',
  description: 'Bitcoin SV chunked file storage for larger files',
  type: 'blockchain',
  permanence: 'permanent',
  tier: 'archive',
  icon: 'layers',
  maxFileSize: 10000000, // ~10MB with chunking
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5,
  uriPrefix: 'bcat://',
  supportedTypes: [],
  features: ['immutable', 'on-chain', 'chunked', 'large-files'],
};

/** D:// Protocol provider */
export const D_PROTOCOL_PROVIDER: StorageProvider = {
  id: 'd-protocol',
  name: 'D:// Protocol',
  description: 'Dynamic Bitcoin SV storage with updates',
  type: 'blockchain',
  permanence: 'permanent',
  tier: 'hot',
  icon: 'refresh-cw',
  maxFileSize: 100000,
  supportsDirectories: false,
  decentralized: true,
  requiresPayment: true,
  costPerMb: 0.5,
  uriPrefix: 'd://',
  supportedTypes: [],
  features: ['updatable', 'on-chain', 'versioned'],
};

/** AWS S3 provider */
export const S3_PROVIDER: StorageProvider = {
  id: 's3',
  name: 'Amazon S3',
  description: 'AWS Simple Storage Service',
  type: 'cloud',
  permanence: 'temporary',
  tier: 'hot',
  icon: 'cloud',
  maxFileSize: 5000000000000, // 5TB
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: true,
  costPerMb: 0.000023, // ~$0.023 per GB
  uriPrefix: 's3://',
  supportedTypes: [],
  features: ['scalable', 'cdn', 'versioning', 'lifecycle'],
};

/** Supabase Storage provider */
export const SUPABASE_PROVIDER: StorageProvider = {
  id: 'supabase',
  name: 'Supabase Storage',
  description: 'Supabase file storage with RLS',
  type: 'cloud',
  permanence: 'temporary',
  tier: 'hot',
  icon: 'database',
  maxFileSize: 50000000, // 50MB default
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: 'supabase://',
  supportedTypes: [],
  features: ['rls', 'cdn', 'transforms', 'policies'],
};

/** Local storage provider */
export const LOCAL_PROVIDER: StorageProvider = {
  id: 'local',
  name: 'Local Storage',
  description: 'Local filesystem storage',
  type: 'cloud',
  permanence: 'temporary',
  tier: 'hot',
  icon: 'hard-drive',
  maxFileSize: 0,
  supportsDirectories: true,
  decentralized: false,
  requiresPayment: false,
  costPerMb: 0,
  uriPrefix: 'file://',
  supportedTypes: [],
  features: ['fast', 'private', 'no-network'],
};

// ============================================================================
// Provider Collections
// ============================================================================

/** All storage providers */
export const STORAGE_PROVIDERS: StorageProvider[] = [
  IPFS_PROVIDER,
  ARWEAVE_PROVIDER,
  B_PROTOCOL_PROVIDER,
  BCAT_PROVIDER,
  D_PROTOCOL_PROVIDER,
  S3_PROVIDER,
  SUPABASE_PROVIDER,
  LOCAL_PROVIDER,
];

/** Providers by ID */
export const PROVIDERS_BY_ID: Record<string, StorageProvider> = {
  ipfs: IPFS_PROVIDER,
  arweave: ARWEAVE_PROVIDER,
  'b-protocol': B_PROTOCOL_PROVIDER,
  bcat: BCAT_PROVIDER,
  'd-protocol': D_PROTOCOL_PROVIDER,
  s3: S3_PROVIDER,
  supabase: SUPABASE_PROVIDER,
  local: LOCAL_PROVIDER,
};

/** Blockchain providers */
export const BLOCKCHAIN_PROVIDERS = [
  B_PROTOCOL_PROVIDER,
  BCAT_PROVIDER,
  D_PROTOCOL_PROVIDER,
];

/** Decentralized providers */
export const DECENTRALIZED_PROVIDERS = [
  IPFS_PROVIDER,
  ARWEAVE_PROVIDER,
  ...BLOCKCHAIN_PROVIDERS,
];

/** Cloud providers */
export const CLOUD_PROVIDERS = [S3_PROVIDER, SUPABASE_PROVIDER, LOCAL_PROVIDER];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get provider by ID
 */
export function getProvider(id: string): StorageProvider | undefined {
  return PROVIDERS_BY_ID[id];
}

/**
 * Get provider or throw
 */
export function getProviderOrThrow(id: string): StorageProvider {
  const provider = getProvider(id);
  if (!provider) {
    throw new Error(`Storage provider not found: ${id}`);
  }
  return provider;
}

/**
 * Select best provider based on criteria
 */
export function selectBestProvider(
  criteria: StorageSelectionCriteria
): StorageProvider | undefined {
  let candidates = [...STORAGE_PROVIDERS];

  // Filter by file size
  if (criteria.fileSize) {
    candidates = candidates.filter(
      (p) => p.maxFileSize === 0 || p.maxFileSize >= criteria.fileSize!
    );
  }

  // Filter by permanence
  if (criteria.permanence) {
    const permanenceOrder: StoragePermanence[] = ['temporary', 'pinned', 'permanent'];
    const minIndex = permanenceOrder.indexOf(criteria.permanence);
    candidates = candidates.filter(
      (p) => permanenceOrder.indexOf(p.permanence) >= minIndex
    );
  }

  // Filter by decentralization
  if (criteria.requireDecentralized) {
    candidates = candidates.filter((p) => p.decentralized);
  }

  // Filter by budget
  if (criteria.budget) {
    const maxCost = {
      free: 0,
      low: 0.01,
      medium: 0.1,
      high: 1,
      unlimited: Infinity,
    }[criteria.budget];
    candidates = candidates.filter((p) => p.costPerMb <= maxCost);
  }

  // Sort by cost (cheapest first)
  candidates.sort((a, b) => a.costPerMb - b.costPerMb);

  return candidates[0];
}

/**
 * Get providers matching criteria
 */
export function getMatchingProviders(
  criteria: StorageSelectionCriteria
): StorageProvider[] {
  let candidates = [...STORAGE_PROVIDERS];

  if (criteria.fileSize) {
    candidates = candidates.filter(
      (p) => p.maxFileSize === 0 || p.maxFileSize >= criteria.fileSize!
    );
  }

  if (criteria.permanence === 'permanent') {
    candidates = candidates.filter((p) => p.permanence === 'permanent');
  }

  if (criteria.requireDecentralized) {
    candidates = candidates.filter((p) => p.decentralized);
  }

  return candidates;
}

/**
 * Estimate storage cost
 */
export function estimateStorageCost(
  providerId: string,
  sizeBytes: number
): { cost: number; currency: string } {
  const provider = getProvider(providerId);
  if (!provider) {
    return { cost: 0, currency: 'USD' };
  }

  const sizeMb = sizeBytes / (1024 * 1024);
  return {
    cost: sizeMb * provider.costPerMb,
    currency: 'USD',
  };
}

/**
 * Format storage size
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Parse storage URI
 */
export function parseStorageUri(uri: string): {
  provider?: string;
  path: string;
} {
  for (const provider of STORAGE_PROVIDERS) {
    if (uri.startsWith(provider.uriPrefix)) {
      return {
        provider: provider.id,
        path: uri.slice(provider.uriPrefix.length),
      };
    }
  }

  // Check for common patterns
  if (uri.startsWith('https://') || uri.startsWith('http://')) {
    if (uri.includes('ipfs.io') || uri.includes('dweb.link')) {
      return { provider: 'ipfs', path: uri };
    }
    if (uri.includes('arweave.net')) {
      return { provider: 'arweave', path: uri };
    }
  }

  return { path: uri };
}

/**
 * Create storage reference
 */
export function createStorageReference(options: {
  provider: string;
  uri: string;
  hash?: string;
  size?: number;
  contentType?: string;
  metadata?: Record<string, unknown>;
}): StorageReference {
  return {
    provider: options.provider,
    uri: options.uri,
    hash: options.hash,
    size: options.size,
    contentType: options.contentType,
    uploadedAt: new Date(),
    metadata: options.metadata,
  };
}
