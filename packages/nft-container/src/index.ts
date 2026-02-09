/**
 * @b0ase/nft-container
 *
 * Universal file tokenization container format (.nft/.ft).
 *
 * Wraps any file with metadata for blockchain tokenization.
 * Supports both non-fungible (.nft) and fungible (.ft) token types.
 *
 * @example
 * ```typescript
 * import {
 *   createNFTContainer,
 *   createFTContainer,
 *   addBlockchainRef,
 *   serializeContainer,
 * } from '@b0ase/nft-container';
 *
 * // Create NFT container for an image
 * const nft = await createNFTContainer({
 *   file: {
 *     name: 'artwork.png',
 *     mimeType: 'image/png',
 *     size: 1024000,
 *     content: imageBytes,
 *   },
 *   token: {
 *     name: 'My Artwork',
 *     symbol: 'ART',
 *     description: 'A beautiful digital artwork',
 *     royaltyPercent: 5,
 *   },
 *   creators: [
 *     { name: 'Alice', address: '$alice', share: 100 },
 *   ],
 * });
 *
 * // Add blockchain reference after minting
 * const mintedNft = addBlockchainRef(nft, {
 *   network: 'bsv',
 *   standard: '1sat-ordinals',
 *   inscriptionId: 'abc123...',
 *   txid: 'def456...',
 * });
 *
 * // Save as .nft file
 * const nftJson = serializeContainer(mintedNft);
 * fs.writeFileSync('artwork.nft', nftJson);
 *
 * // Create FT container for a token
 * const ft = createFTContainer({
 *   token: {
 *     name: 'Project Token',
 *     symbol: 'PROJ',
 *     description: 'Governance token for Project',
 *   },
 *   supply: {
 *     totalSupply: 1000000n,
 *     decimals: 8,
 *     mintable: false,
 *     burnable: true,
 *   },
 *   creators: [
 *     { name: 'Project DAO', address: '0x...', share: 100 },
 *   ],
 * });
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Container types
  ContainerFormat,
  BlockchainNetwork,
  TokenStandard,

  // File metadata
  FileMetadata,

  // Token metadata
  TokenMetadata,
  TokenAttribute,
  CollectionInfo,

  // Blockchain references
  BlockchainRef,
  StorageRef,

  // Ownership
  CreatorInfo,
  OwnershipRecord,
  ProvenanceEntry,

  // Fungible tokens
  FungibleSupply,

  // Containers
  NFTContainer,
  FTContainer,
  Container,

  // Creation inputs
  CreateNFTContainerInput,
  CreateFTContainerInput,
} from './types';

// ============================================================================
// Container Functions
// ============================================================================

export {
  // Creation
  createNFTContainer,
  createFTContainer,

  // Updates
  addBlockchainRef,
  addStorageRef,
  transferOwnership,
  burnContainer,

  // Validation
  validateContainer,
  type ValidationResult,

  // Type guards
  isNFTContainer,
  isFTContainer,
  isMinted,
  isStored,

  // Serialization
  serializeContainer,
  deserializeContainer,
  getContainerExtension,
  getContainerFilename,

  // Utilities
  hashContent,
} from './container';
