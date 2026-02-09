/**
 * @b0ase/nft-minting-modal
 *
 * NFT creation and minting interface types and utilities.
 *
 * @packageDocumentation
 */
/** NFT standard */
type NFTStandard = 'ordinals' | 'bsv-21' | 'erc-721' | 'erc-1155' | 'metaplex';
/** Content type */
type ContentType = 'image' | 'video' | 'audio' | 'document' | 'html' | '3d' | 'code';
/** Minting status */
type MintingStatus = 'idle' | 'uploading' | 'processing' | 'signing' | 'broadcasting' | 'confirming' | 'completed' | 'failed';
/** Rarity level */
type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
/** NFT attribute */
interface NFTAttribute {
    trait_type: string;
    value: string | number;
    display_type?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage';
    max_value?: number;
    rarity?: number;
}
/** NFT metadata */
interface NFTMetadata {
    name: string;
    description?: string;
    image?: string;
    animation_url?: string;
    external_url?: string;
    attributes?: NFTAttribute[];
    properties?: Record<string, unknown>;
    collection?: CollectionInfo;
}
/** Collection info */
interface CollectionInfo {
    name: string;
    description?: string;
    image?: string;
    external_link?: string;
    seller_fee_basis_points?: number;
    fee_recipient?: string;
}
/** File upload */
interface FileUpload {
    id: string;
    file?: File;
    url?: string;
    name: string;
    size: number;
    mimeType: string;
    contentType: ContentType;
    preview?: string;
    uploadProgress: number;
    uploadedUrl?: string;
    error?: string;
}
/** Mint options */
interface MintOptions {
    standard: NFTStandard;
    blockchain: 'bsv' | 'bitcoin' | 'ethereum' | 'solana';
    quantity: number;
    royaltyPercent?: number;
    royaltyAddress?: string;
    collection?: string;
    isSoulbound?: boolean;
    isLazy?: boolean;
    scheduledAt?: Date;
}
/** Mint result */
interface MintResult {
    success: boolean;
    inscriptionId?: string;
    tokenId?: string;
    txid?: string;
    contractAddress?: string;
    explorerUrl?: string;
    error?: string;
}
/** Minting state */
interface MintingState {
    status: MintingStatus;
    progress: number;
    statusMessage: string;
    file?: FileUpload;
    metadata: NFTMetadata;
    options: MintOptions;
    result?: MintResult;
    error?: string;
}
/** Modal config */
interface ModalConfig {
    allowedContentTypes: ContentType[];
    maxFileSize: number;
    supportedStandards: NFTStandard[];
    defaultStandard: NFTStandard;
    defaultBlockchain: string;
    showPreview: boolean;
    showAttributeEditor: boolean;
    showRoyaltySettings: boolean;
    showCollectionSelector: boolean;
    customBranding?: {
        title?: string;
        logo?: string;
        primaryColor?: string;
    };
}
/** Step definition */
interface MintStep {
    id: string;
    title: string;
    description?: string;
    component: 'upload' | 'metadata' | 'options' | 'preview' | 'confirm' | 'result';
    optional?: boolean;
    completed: boolean;
    active: boolean;
}
declare const DEFAULT_MODAL_CONFIG: ModalConfig;
declare const DEFAULT_MINT_OPTIONS: MintOptions;
declare const CONTENT_TYPE_MIMES: Record<ContentType, string[]>;
declare const DEFAULT_STEPS: MintStep[];
declare class MintingManager {
    private state;
    private config;
    private steps;
    private currentStepIndex;
    private listeners;
    private mintCallback?;
    constructor(config?: Partial<ModalConfig>);
    getState(): MintingState;
    subscribe(listener: (state: MintingState) => void): () => void;
    private notify;
    private updateState;
    getSteps(): MintStep[];
    getCurrentStep(): MintStep;
    nextStep(): boolean;
    prevStep(): boolean;
    goToStep(stepId: string): boolean;
    setFile(file: FileUpload): void;
    updateFileProgress(progress: number): void;
    setFileUploaded(url: string): void;
    setMetadata(metadata: Partial<NFTMetadata>): void;
    addAttribute(attribute: NFTAttribute): void;
    updateAttribute(index: number, attribute: NFTAttribute): void;
    removeAttribute(index: number): void;
    setOptions(options: Partial<MintOptions>): void;
    setMintCallback(callback: (state: MintingState) => Promise<MintResult>): void;
    mint(): Promise<MintResult>;
    validateFile(file: File): {
        valid: boolean;
        error?: string;
    };
    validateMetadata(): {
        valid: boolean;
        errors: string[];
    };
    canProceed(): boolean;
    reset(): void;
}
declare function createMintingManager(config?: Partial<ModalConfig>): MintingManager;
declare function getContentType(mimeType: string): ContentType | undefined;
declare function formatFileSize(bytes: number): string;
declare function generateMetadataJson(metadata: NFTMetadata): string;
declare function getRarityColor(rarity: RarityLevel): string;
declare function calculateRoyalty(salePrice: number, royaltyPercent: number): number;
declare function getExplorerUrl(blockchain: string, type: 'tx' | 'token' | 'inscription', id: string): string;

export { CONTENT_TYPE_MIMES, type CollectionInfo, type ContentType, DEFAULT_MINT_OPTIONS, DEFAULT_MODAL_CONFIG, DEFAULT_STEPS, type FileUpload, type MintOptions, type MintResult, type MintStep, MintingManager, type MintingState, type MintingStatus, type ModalConfig, type NFTAttribute, type NFTMetadata, type NFTStandard, type RarityLevel, calculateRoyalty, createMintingManager, formatFileSize, generateMetadataJson, getContentType, getExplorerUrl, getRarityColor };
