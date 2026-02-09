/**
 * @b0ase/nft-container - Type definitions
 *
 * Universal file tokenization container format (.nft/.ft)
 */
/** Container format type */
type ContainerFormat = 'nft' | 'ft';
/** Supported blockchain networks */
type BlockchainNetwork = 'bsv' | 'ethereum' | 'solana' | 'polygon' | 'arbitrum' | 'base';
/** Token standard */
type TokenStandard = 'bsv-20' | 'ordinals' | '1sat-ordinals' | 'erc-721' | 'erc-1155' | 'spl-token';
/** File metadata within container */
interface FileMetadata {
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
/** Token metadata for blockchain registration */
interface TokenMetadata {
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
interface TokenAttribute {
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
interface CollectionInfo {
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
/** Blockchain inscription/mint reference */
interface BlockchainRef {
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
interface StorageRef {
    /** Storage provider */
    provider: 'ipfs' | 'arweave' | 'bcat' | 'b://' | 'd://' | 's3' | 'local';
    /** Content identifier (CID, txid, URL) */
    uri: string;
    /** Backup URIs */
    backupUris?: string[];
    /** Storage timestamp */
    storedAt?: Date;
}
/** Creator information */
interface CreatorInfo {
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
interface OwnershipRecord {
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
interface ProvenanceEntry {
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
/** Fungible token supply info */
interface FungibleSupply {
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
/** NFT Container (.nft) - Non-fungible token wrapper */
interface NFTContainer {
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
interface FTContainer {
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
type Container = NFTContainer | FTContainer;
/** Input for creating NFT container */
interface CreateNFTContainerInput {
    /** File to wrap */
    file: {
        name: string;
        mimeType: string;
        size: number;
        content?: Uint8Array;
    };
    /** Token metadata */
    token: Omit<TokenMetadata, 'image'> & {
        image?: string;
    };
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
interface CreateFTContainerInput {
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

/**
 * @b0ase/nft-container - Container creation and management
 */

/**
 * Calculate SHA-256 hash of content
 * Note: In Node.js, use crypto.createHash('sha256')
 * In browser, use crypto.subtle.digest('SHA-256', ...)
 */
declare function hashContent(content: Uint8Array): Promise<string>;
/**
 * Create an NFT container
 */
declare function createNFTContainer(input: CreateNFTContainerInput): Promise<NFTContainer>;
/**
 * Create an FT container
 */
declare function createFTContainer(input: CreateFTContainerInput): FTContainer;
/**
 * Add blockchain reference to container
 */
declare function addBlockchainRef<T extends Container>(container: T, ref: BlockchainRef): T;
/**
 * Add storage reference to NFT container
 */
declare function addStorageRef(container: NFTContainer, ref: StorageRef): NFTContainer;
/**
 * Record ownership transfer
 */
declare function transferOwnership(container: NFTContainer, newOwner: string, options?: {
    price?: number;
    currency?: string;
    txRef?: BlockchainRef;
}): NFTContainer;
/**
 * Mark container as burned
 */
declare function burnContainer(container: NFTContainer, txRef?: BlockchainRef): NFTContainer;
/** Validation result */
interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validate container structure
 */
declare function validateContainer(container: Container): ValidationResult;
/**
 * Check if container is NFT
 */
declare function isNFTContainer(container: Container): container is NFTContainer;
/**
 * Check if container is FT
 */
declare function isFTContainer(container: Container): container is FTContainer;
/**
 * Check if container is minted
 */
declare function isMinted(container: Container): boolean;
/**
 * Check if NFT container file is stored
 */
declare function isStored(container: NFTContainer): boolean;
/**
 * Serialize container to JSON (for .nft/.ft file)
 */
declare function serializeContainer(container: Container): string;
/**
 * Deserialize container from JSON
 */
declare function deserializeContainer(json: string): Container;
/**
 * Get container file extension
 */
declare function getContainerExtension(container: Container): string;
/**
 * Get container filename
 */
declare function getContainerFilename(container: Container): string;

export { type BlockchainNetwork, type BlockchainRef, type CollectionInfo, type Container, type ContainerFormat, type CreateFTContainerInput, type CreateNFTContainerInput, type CreatorInfo, type FTContainer, type FileMetadata, type FungibleSupply, type NFTContainer, type OwnershipRecord, type ProvenanceEntry, type StorageRef, type TokenAttribute, type TokenMetadata, type TokenStandard, type ValidationResult, addBlockchainRef, addStorageRef, burnContainer, createFTContainer, createNFTContainer, deserializeContainer, getContainerExtension, getContainerFilename, hashContent, isFTContainer, isMinted, isNFTContainer, isStored, serializeContainer, transferOwnership, validateContainer };
