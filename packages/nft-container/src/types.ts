/**
 * @b0ase/nft-container - Type definitions
 *
 * Universal file tokenization container format (.nft/.ft)
 */

// ============================================================================
// Container Types
// ============================================================================

/** Container format type */
export type ContainerFormat = 'nft' | 'ft';

/** Supported blockchain networks */
export type BlockchainNetwork =
  | 'bsv'
  | 'ethereum'
  | 'solana'
  | 'polygon'
  | 'arbitrum'
  | 'base';

/** Token standard */
export type TokenStandard =
  | 'bsv-20'
  | 'ordinals'
  | '1sat-ordinals'
  | 'erc-721'
  | 'erc-1155'
  | 'spl-token';

// ============================================================================
// File Metadata
// ============================================================================

/** File metadata within container */
export interface FileMetadata {
  /** Original filename */
  name: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** SHA-256 hash of file content */
  contentHash: string;
  /** File extension */
  extension: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  modifiedAt?: Date;
  /** Additional file attributes */
  attributes?: Record<string, unknown>;
}

// ============================================================================
// Token Metadata
// ============================================================================

/** Token metadata for blockchain registration */
export interface TokenMetadata {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token description */
  description?: string;
  /** Token image URL (for display) */
  image?: string;
  /** External link */
  externalUrl?: string;
  /** NFT attributes (OpenSea-style) */
  attributes?: TokenAttribute[];
  /** Royalty percentage (0-100) */
  royaltyPercent?: number;
  /** Royalty recipient address */
  royaltyRecipient?: string;
  /** Token category */
  category?: string;
  /** Collection info */
  collection?: CollectionInfo;
}

/** Token attribute (OpenSea-compatible) */
export interface TokenAttribute {
  /** Attribute name/type */
  trait_type: string;
  /** Attribute value */
  value: string | number;
  /** Display type (for numbers) */
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
  /** Max value (for boost types) */
  max_value?: number;
}

/** Collection information */
export interface CollectionInfo {
  /** Collection name */
  name: string;
  /** Collection description */
  description?: string;
  /** Collection image */
  image?: string;
  /** Collection banner */
  banner?: string;
  /** Collection external link */
  externalUrl?: string;
}

// ============================================================================
// Blockchain References
// ============================================================================

/** Blockchain inscription/mint reference */
export interface BlockchainRef {
  /** Network */
  network: BlockchainNetwork;
  /** Token standard */
  standard: TokenStandard;
  /** Transaction ID */
  txid?: string;
  /** Contract address */
  contractAddress?: string;
  /** Token ID within contract */
  tokenId?: string;
  /** Inscription ID (for ordinals) */
  inscriptionId?: string;
  /** Block height */
  blockHeight?: number;
  /** Confirmation count */
  confirmations?: number;
  /** Mint timestamp */
  mintedAt?: Date;
}

/** Storage reference for file content */
export interface StorageRef {
  /** Storage provider */
  provider: 'ipfs' | 'arweave' | 'bcat' | 'b://' | 'd://' | 's3' | 'local';
  /** Content identifier (CID, txid, URL) */
  uri: string;
  /** Backup URIs */
  backupUris?: string[];
  /** Storage timestamp */
  storedAt?: Date;
}

// ============================================================================
// Ownership & Provenance
// ============================================================================

/** Creator information */
export interface CreatorInfo {
  /** Creator name/handle */
  name: string;
  /** Creator address (payment handle or wallet) */
  address: string;
  /** Creator share percentage (for royalties) */
  share: number;
  /** Verified creator */
  verified?: boolean;
  /** Creator profile URL */
  profileUrl?: string;
}

/** Ownership record */
export interface OwnershipRecord {
  /** Current owner address */
  owner: string;
  /** Ownership start date */
  since: Date;
  /** Acquisition type */
  acquisitionType: 'mint' | 'transfer' | 'purchase' | 'airdrop' | 'claim';
  /** Acquisition price (if purchased) */
  price?: number;
  /** Price currency */
  currency?: string;
  /** Transaction reference */
  txRef?: BlockchainRef;
}

/** Provenance entry */
export interface ProvenanceEntry {
  /** Event type */
  event: 'created' | 'transferred' | 'listed' | 'sold' | 'burned';
  /** From address */
  from?: string;
  /** To address */
  to?: string;
  /** Price (if sold) */
  price?: number;
  /** Currency */
  currency?: string;
  /** Timestamp */
  timestamp: Date;
  /** Transaction reference */
  txRef?: BlockchainRef;
}

// ============================================================================
// Fungible Token Specific
// ============================================================================

/** Fungible token supply info */
export interface FungibleSupply {
  /** Total supply */
  totalSupply: bigint;
  /** Circulating supply */
  circulatingSupply: bigint;
  /** Decimal places */
  decimals: number;
  /** Is mintable */
  mintable: boolean;
  /** Is burnable */
  burnable: boolean;
  /** Max supply (if capped) */
  maxSupply?: bigint;
}

// ============================================================================
// Container Structure
// ============================================================================

/** NFT Container (.nft) - Non-fungible token wrapper */
export interface NFTContainer {
  /** Container format version */
  version: '1.0';
  /** Container type */
  type: 'nft';
  /** Unique container ID */
  id: string;

  /** File metadata */
  file: FileMetadata;
  /** Token metadata */
  token: TokenMetadata;

  /** Creators */
  creators: CreatorInfo[];
  /** Current ownership */
  ownership?: OwnershipRecord;
  /** Provenance history */
  provenance: ProvenanceEntry[];

  /** Blockchain references */
  blockchainRefs: BlockchainRef[];
  /** Storage references */
  storageRefs: StorageRef[];

  /** Container creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Raw file content (optional, for embedded containers) */
  content?: Uint8Array;
}

/** FT Container (.ft) - Fungible token file wrapper */
export interface FTContainer {
  /** Container format version */
  version: '1.0';
  /** Container type */
  type: 'ft';
  /** Unique container ID */
  id: string;

  /** File metadata (optional, FT may not have file) */
  file?: FileMetadata;
  /** Token metadata */
  token: TokenMetadata;
  /** Supply information */
  supply: FungibleSupply;

  /** Creators/deployers */
  creators: CreatorInfo[];

  /** Blockchain references */
  blockchainRefs: BlockchainRef[];

  /** Container creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Union type for any container */
export type Container = NFTContainer | FTContainer;

// ============================================================================
// Container Creation Inputs
// ============================================================================

/** Input for creating NFT container */
export interface CreateNFTContainerInput {
  /** File to wrap */
  file: {
    name: string;
    mimeType: string;
    size: number;
    content?: Uint8Array;
  };
  /** Token metadata */
  token: Omit<TokenMetadata, 'image'> & { image?: string };
  /** Creators */
  creators: CreatorInfo[];
  /** Blockchain references (if already minted) */
  blockchainRefs?: BlockchainRef[];
  /** Storage references (if already stored) */
  storageRefs?: StorageRef[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Input for creating FT container */
export interface CreateFTContainerInput {
  /** Token metadata */
  token: TokenMetadata;
  /** Supply information */
  supply: Omit<FungibleSupply, 'circulatingSupply'> & {
    circulatingSupply?: bigint;
  };
  /** Creators/deployers */
  creators: CreatorInfo[];
  /** Blockchain references */
  blockchainRefs?: BlockchainRef[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
