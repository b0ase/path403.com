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
/** Storage provider type */
type StorageProviderType = 'cloud' | 'ipfs' | 'arweave' | 'blockchain' | 'hybrid';
/** Storage permanence */
type StoragePermanence = 'temporary' | 'pinned' | 'permanent';
/** Storage tier */
type StorageTier = 'hot' | 'warm' | 'cold' | 'archive';
/** Budget level */
type BudgetLevel = 'free' | 'low' | 'medium' | 'high' | 'unlimited';
/** Storage provider definition */
interface StorageProvider {
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
interface StorageSelectionCriteria {
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
interface StorageReference {
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
/** IPFS provider */
declare const IPFS_PROVIDER: StorageProvider;
/** Arweave provider */
declare const ARWEAVE_PROVIDER: StorageProvider;
/** B:// Protocol provider */
declare const B_PROTOCOL_PROVIDER: StorageProvider;
/** Bcat Protocol provider (chunked) */
declare const BCAT_PROVIDER: StorageProvider;
/** D:// Protocol provider */
declare const D_PROTOCOL_PROVIDER: StorageProvider;
/** AWS S3 provider */
declare const S3_PROVIDER: StorageProvider;
/** Supabase Storage provider */
declare const SUPABASE_PROVIDER: StorageProvider;
/** Local storage provider */
declare const LOCAL_PROVIDER: StorageProvider;
/** All storage providers */
declare const STORAGE_PROVIDERS: StorageProvider[];
/** Providers by ID */
declare const PROVIDERS_BY_ID: Record<string, StorageProvider>;
/** Blockchain providers */
declare const BLOCKCHAIN_PROVIDERS: StorageProvider[];
/** Decentralized providers */
declare const DECENTRALIZED_PROVIDERS: StorageProvider[];
/** Cloud providers */
declare const CLOUD_PROVIDERS: StorageProvider[];
/**
 * Get provider by ID
 */
declare function getProvider(id: string): StorageProvider | undefined;
/**
 * Get provider or throw
 */
declare function getProviderOrThrow(id: string): StorageProvider;
/**
 * Select best provider based on criteria
 */
declare function selectBestProvider(criteria: StorageSelectionCriteria): StorageProvider | undefined;
/**
 * Get providers matching criteria
 */
declare function getMatchingProviders(criteria: StorageSelectionCriteria): StorageProvider[];
/**
 * Estimate storage cost
 */
declare function estimateStorageCost(providerId: string, sizeBytes: number): {
    cost: number;
    currency: string;
};
/**
 * Format storage size
 */
declare function formatStorageSize(bytes: number): string;
/**
 * Parse storage URI
 */
declare function parseStorageUri(uri: string): {
    provider?: string;
    path: string;
};
/**
 * Create storage reference
 */
declare function createStorageReference(options: {
    provider: string;
    uri: string;
    hash?: string;
    size?: number;
    contentType?: string;
    metadata?: Record<string, unknown>;
}): StorageReference;

export { ARWEAVE_PROVIDER, BCAT_PROVIDER, BLOCKCHAIN_PROVIDERS, B_PROTOCOL_PROVIDER, type BudgetLevel, CLOUD_PROVIDERS, DECENTRALIZED_PROVIDERS, D_PROTOCOL_PROVIDER, IPFS_PROVIDER, LOCAL_PROVIDER, PROVIDERS_BY_ID, S3_PROVIDER, STORAGE_PROVIDERS, SUPABASE_PROVIDER, type StoragePermanence, type StorageProvider, type StorageProviderType, type StorageReference, type StorageSelectionCriteria, type StorageTier, createStorageReference, estimateStorageCost, formatStorageSize, getMatchingProviders, getProvider, getProviderOrThrow, parseStorageUri, selectBestProvider };
