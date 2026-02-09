/**
 * @b0ase/nft-container - Container creation and management
 */

import type {
  NFTContainer,
  FTContainer,
  Container,
  CreateNFTContainerInput,
  CreateFTContainerInput,
  FileMetadata,
  BlockchainRef,
  StorageRef,
  ProvenanceEntry,
  OwnershipRecord,
} from './types';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate unique container ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate SHA-256 hash of content
 * Note: In Node.js, use crypto.createHash('sha256')
 * In browser, use crypto.subtle.digest('SHA-256', ...)
 */
export async function hashContent(content: Uint8Array): Promise<string> {
  // Check if we're in a browser-like environment with crypto.subtle
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto?.subtle?.digest
  ) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', content);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: compute simple checksum (not cryptographically secure)
  // In production, use proper crypto library
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash + content[i]) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// ============================================================================
// NFT Container Creation
// ============================================================================

/**
 * Create an NFT container
 */
export async function createNFTContainer(
  input: CreateNFTContainerInput
): Promise<NFTContainer> {
  const now = new Date();
  const id = generateId('nft');

  // Calculate content hash if content is provided
  let contentHash = '';
  if (input.file.content) {
    contentHash = await hashContent(input.file.content);
  }

  const file: FileMetadata = {
    name: input.file.name,
    mimeType: input.file.mimeType,
    size: input.file.size,
    contentHash,
    extension: getExtension(input.file.name),
    createdAt: now,
  };

  // Create initial provenance entry
  const provenance: ProvenanceEntry[] = [
    {
      event: 'created',
      to: input.creators[0]?.address,
      timestamp: now,
    },
  ];

  return {
    version: '1.0',
    type: 'nft',
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
    content: input.file.content,
  };
}

/**
 * Create an FT container
 */
export function createFTContainer(input: CreateFTContainerInput): FTContainer {
  const now = new Date();
  const id = generateId('ft');

  return {
    version: '1.0',
    type: 'ft',
    id,
    token: input.token,
    supply: {
      totalSupply: input.supply.totalSupply,
      circulatingSupply: input.supply.circulatingSupply ?? input.supply.totalSupply,
      decimals: input.supply.decimals,
      mintable: input.supply.mintable,
      burnable: input.supply.burnable,
      maxSupply: input.supply.maxSupply,
    },
    creators: input.creators,
    blockchainRefs: input.blockchainRefs || [],
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata,
  };
}

// ============================================================================
// Container Updates
// ============================================================================

/**
 * Add blockchain reference to container
 */
export function addBlockchainRef<T extends Container>(
  container: T,
  ref: BlockchainRef
): T {
  return {
    ...container,
    blockchainRefs: [...container.blockchainRefs, ref],
    updatedAt: new Date(),
  };
}

/**
 * Add storage reference to NFT container
 */
export function addStorageRef(
  container: NFTContainer,
  ref: StorageRef
): NFTContainer {
  return {
    ...container,
    storageRefs: [...container.storageRefs, ref],
    updatedAt: new Date(),
  };
}

/**
 * Record ownership transfer
 */
export function transferOwnership(
  container: NFTContainer,
  newOwner: string,
  options?: {
    price?: number;
    currency?: string;
    txRef?: BlockchainRef;
  }
): NFTContainer {
  const now = new Date();
  const previousOwner = container.ownership?.owner;

  const ownership: OwnershipRecord = {
    owner: newOwner,
    since: now,
    acquisitionType: options?.price ? 'purchase' : 'transfer',
    price: options?.price,
    currency: options?.currency,
    txRef: options?.txRef,
  };

  const provenanceEntry: ProvenanceEntry = {
    event: options?.price ? 'sold' : 'transferred',
    from: previousOwner,
    to: newOwner,
    price: options?.price,
    currency: options?.currency,
    timestamp: now,
    txRef: options?.txRef,
  };

  return {
    ...container,
    ownership,
    provenance: [...container.provenance, provenanceEntry],
    updatedAt: now,
  };
}

/**
 * Mark container as burned
 */
export function burnContainer(
  container: NFTContainer,
  txRef?: BlockchainRef
): NFTContainer {
  const now = new Date();

  const provenanceEntry: ProvenanceEntry = {
    event: 'burned',
    from: container.ownership?.owner,
    timestamp: now,
    txRef,
  };

  return {
    ...container,
    provenance: [...container.provenance, provenanceEntry],
    updatedAt: now,
    metadata: {
      ...container.metadata,
      burned: true,
      burnedAt: now.toISOString(),
    },
  };
}

// ============================================================================
// Container Validation
// ============================================================================

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate container structure
 */
export function validateContainer(container: Container): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!container.version) errors.push('Missing version');
  if (!container.type) errors.push('Missing type');
  if (!container.id) errors.push('Missing id');
  if (!container.token?.name) errors.push('Missing token name');
  if (!container.token?.symbol) errors.push('Missing token symbol');
  if (container.creators.length === 0) errors.push('At least one creator required');

  // Type-specific validation
  if (container.type === 'nft') {
    const nft = container as NFTContainer;
    if (!nft.file?.name) errors.push('Missing file name');
    if (!nft.file?.mimeType) errors.push('Missing file MIME type');
    if (nft.file?.size <= 0) errors.push('Invalid file size');
  } else if (container.type === 'ft') {
    const ft = container as FTContainer;
    if (ft.supply.totalSupply <= BigInt(0)) {
      errors.push('Total supply must be positive');
    }
    if (ft.supply.decimals < 0 || ft.supply.decimals > 18) {
      errors.push('Decimals must be 0-18');
    }
  }

  // Warnings
  if (container.blockchainRefs.length === 0) {
    warnings.push('No blockchain references (not minted)');
  }
  if (container.type === 'nft') {
    const nft = container as NFTContainer;
    if (nft.storageRefs.length === 0) {
      warnings.push('No storage references (file not uploaded)');
    }
    if (!nft.file?.contentHash) {
      warnings.push('No content hash (integrity cannot be verified)');
    }
  }

  // Creator validation
  const totalShare = container.creators.reduce((sum, c) => sum + c.share, 0);
  if (Math.abs(totalShare - 100) > 0.01) {
    warnings.push(`Creator shares sum to ${totalShare}%, expected 100%`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Container Type Guards
// ============================================================================

/**
 * Check if container is NFT
 */
export function isNFTContainer(container: Container): container is NFTContainer {
  return container.type === 'nft';
}

/**
 * Check if container is FT
 */
export function isFTContainer(container: Container): container is FTContainer {
  return container.type === 'ft';
}

/**
 * Check if container is minted
 */
export function isMinted(container: Container): boolean {
  return container.blockchainRefs.some((ref) => ref.txid || ref.inscriptionId);
}

/**
 * Check if NFT container file is stored
 */
export function isStored(container: NFTContainer): boolean {
  return container.storageRefs.length > 0;
}

// ============================================================================
// Container Serialization
// ============================================================================

/**
 * Serialize container to JSON (for .nft/.ft file)
 */
export function serializeContainer(container: Container): string {
  // Create a copy without binary content
  const serializable = { ...container };
  if (isNFTContainer(serializable) && serializable.content) {
    // Convert Uint8Array to base64 for JSON serialization
    const base64 = Buffer.from(serializable.content).toString('base64');
    (serializable as Record<string, unknown>).contentBase64 = base64;
    delete (serializable as Record<string, unknown>).content;
  }

  // Convert bigint to string for JSON
  return JSON.stringify(
    serializable,
    (_, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value),
    2
  );
}

/**
 * Deserialize container from JSON
 */
export function deserializeContainer(json: string): Container {
  const parsed = JSON.parse(json, (_, value) => {
    // Convert bigint strings back
    if (typeof value === 'string' && value.endsWith('n')) {
      const num = value.slice(0, -1);
      if (/^\d+$/.test(num)) {
        return BigInt(num);
      }
    }
    // Convert date strings back
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value);
    }
    return value;
  });

  // Restore binary content from base64
  if (parsed.contentBase64) {
    parsed.content = new Uint8Array(Buffer.from(parsed.contentBase64, 'base64'));
    delete parsed.contentBase64;
  }

  return parsed as Container;
}

/**
 * Get container file extension
 */
export function getContainerExtension(container: Container): string {
  return container.type === 'nft' ? '.nft' : '.ft';
}

/**
 * Get container filename
 */
export function getContainerFilename(container: Container): string {
  const baseName = container.token.symbol.toLowerCase();
  return `${baseName}${getContainerExtension(container)}`;
}
