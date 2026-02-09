/**
 * @b0ase/nft-minting-modal
 *
 * NFT creation and minting interface types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** NFT standard */
export type NFTStandard =
  | 'ordinals'
  | 'bsv-21'
  | 'erc-721'
  | 'erc-1155'
  | 'metaplex';

/** Content type */
export type ContentType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'html'
  | '3d'
  | 'code';

/** Minting status */
export type MintingStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'signing'
  | 'broadcasting'
  | 'confirming'
  | 'completed'
  | 'failed';

/** Rarity level */
export type RarityLevel =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'unique';

/** NFT attribute */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage';
  max_value?: number;
  rarity?: number;
}

/** NFT metadata */
export interface NFTMetadata {
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
export interface CollectionInfo {
  name: string;
  description?: string;
  image?: string;
  external_link?: string;
  seller_fee_basis_points?: number;
  fee_recipient?: string;
}

/** File upload */
export interface FileUpload {
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
export interface MintOptions {
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
export interface MintResult {
  success: boolean;
  inscriptionId?: string;
  tokenId?: string;
  txid?: string;
  contractAddress?: string;
  explorerUrl?: string;
  error?: string;
}

/** Minting state */
export interface MintingState {
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
export interface ModalConfig {
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
export interface MintStep {
  id: string;
  title: string;
  description?: string;
  component: 'upload' | 'metadata' | 'options' | 'preview' | 'confirm' | 'result';
  optional?: boolean;
  completed: boolean;
  active: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_MODAL_CONFIG: ModalConfig = {
  allowedContentTypes: ['image', 'video', 'audio', 'document'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedStandards: ['ordinals', 'bsv-21'],
  defaultStandard: 'ordinals',
  defaultBlockchain: 'bsv',
  showPreview: true,
  showAttributeEditor: true,
  showRoyaltySettings: true,
  showCollectionSelector: true,
};

export const DEFAULT_MINT_OPTIONS: MintOptions = {
  standard: 'ordinals',
  blockchain: 'bsv',
  quantity: 1,
  royaltyPercent: 5,
};

export const CONTENT_TYPE_MIMES: Record<ContentType, string[]> = {
  image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
  document: ['application/pdf', 'text/plain', 'text/markdown'],
  html: ['text/html'],
  '3d': ['model/gltf-binary', 'model/gltf+json'],
  code: ['text/javascript', 'application/json', 'text/css'],
};

export const DEFAULT_STEPS: MintStep[] = [
  { id: 'upload', title: 'Upload', component: 'upload', completed: false, active: true },
  { id: 'metadata', title: 'Details', component: 'metadata', completed: false, active: false },
  { id: 'options', title: 'Options', component: 'options', completed: false, active: false },
  { id: 'preview', title: 'Preview', component: 'preview', completed: false, active: false },
  { id: 'confirm', title: 'Mint', component: 'confirm', completed: false, active: false },
];

// ============================================================================
// Minting Manager
// ============================================================================

export class MintingManager {
  private state: MintingState;
  private config: ModalConfig;
  private steps: MintStep[];
  private currentStepIndex: number;
  private listeners: Set<(state: MintingState) => void> = new Set();
  private mintCallback?: (state: MintingState) => Promise<MintResult>;

  constructor(config?: Partial<ModalConfig>) {
    this.config = { ...DEFAULT_MODAL_CONFIG, ...config };
    this.steps = DEFAULT_STEPS.map(s => ({ ...s }));
    this.currentStepIndex = 0;
    this.state = {
      status: 'idle',
      progress: 0,
      statusMessage: '',
      metadata: { name: '' },
      options: { ...DEFAULT_MINT_OPTIONS },
    };
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  getState(): MintingState {
    return { ...this.state };
  }

  subscribe(listener: (state: MintingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private updateState(updates: Partial<MintingState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // ==========================================================================
  // Step Management
  // ==========================================================================

  getSteps(): MintStep[] {
    return this.steps.map(s => ({ ...s }));
  }

  getCurrentStep(): MintStep {
    return { ...this.steps[this.currentStepIndex] };
  }

  nextStep(): boolean {
    if (this.currentStepIndex >= this.steps.length - 1) return false;

    this.steps[this.currentStepIndex].completed = true;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex++;
    this.steps[this.currentStepIndex].active = true;

    return true;
  }

  prevStep(): boolean {
    if (this.currentStepIndex <= 0) return false;

    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex--;
    this.steps[this.currentStepIndex].active = true;
    this.steps[this.currentStepIndex].completed = false;

    return true;
  }

  goToStep(stepId: string): boolean {
    const index = this.steps.findIndex(s => s.id === stepId);
    if (index < 0) return false;

    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex = index;
    this.steps[this.currentStepIndex].active = true;

    return true;
  }

  // ==========================================================================
  // File Handling
  // ==========================================================================

  setFile(file: FileUpload): void {
    this.updateState({ file });

    // Auto-populate metadata name from filename
    if (!this.state.metadata.name && file.name) {
      const name = file.name.replace(/\.[^/.]+$/, '');
      this.updateState({
        metadata: { ...this.state.metadata, name },
      });
    }
  }

  updateFileProgress(progress: number): void {
    if (!this.state.file) return;
    this.updateState({
      file: { ...this.state.file, uploadProgress: progress },
    });
  }

  setFileUploaded(url: string): void {
    if (!this.state.file) return;
    this.updateState({
      file: { ...this.state.file, uploadedUrl: url, uploadProgress: 100 },
      metadata: { ...this.state.metadata, image: url },
    });
  }

  // ==========================================================================
  // Metadata
  // ==========================================================================

  setMetadata(metadata: Partial<NFTMetadata>): void {
    this.updateState({
      metadata: { ...this.state.metadata, ...metadata },
    });
  }

  addAttribute(attribute: NFTAttribute): void {
    const attributes = [...(this.state.metadata.attributes || []), attribute];
    this.updateState({
      metadata: { ...this.state.metadata, attributes },
    });
  }

  updateAttribute(index: number, attribute: NFTAttribute): void {
    const attributes = [...(this.state.metadata.attributes || [])];
    attributes[index] = attribute;
    this.updateState({
      metadata: { ...this.state.metadata, attributes },
    });
  }

  removeAttribute(index: number): void {
    const attributes = [...(this.state.metadata.attributes || [])];
    attributes.splice(index, 1);
    this.updateState({
      metadata: { ...this.state.metadata, attributes },
    });
  }

  // ==========================================================================
  // Options
  // ==========================================================================

  setOptions(options: Partial<MintOptions>): void {
    this.updateState({
      options: { ...this.state.options, ...options },
    });
  }

  // ==========================================================================
  // Minting
  // ==========================================================================

  setMintCallback(callback: (state: MintingState) => Promise<MintResult>): void {
    this.mintCallback = callback;
  }

  async mint(): Promise<MintResult> {
    if (!this.mintCallback) {
      throw new Error('Mint callback not configured');
    }

    try {
      this.updateState({ status: 'processing', progress: 0, statusMessage: 'Preparing...' });

      this.updateState({ status: 'uploading', progress: 20, statusMessage: 'Uploading content...' });

      this.updateState({ status: 'processing', progress: 40, statusMessage: 'Processing metadata...' });

      this.updateState({ status: 'signing', progress: 60, statusMessage: 'Requesting signature...' });

      const result = await this.mintCallback(this.state);

      if (result.success) {
        this.updateState({
          status: 'completed',
          progress: 100,
          statusMessage: 'NFT minted successfully!',
          result,
        });
      } else {
        this.updateState({
          status: 'failed',
          progress: 0,
          statusMessage: result.error || 'Minting failed',
          error: result.error,
          result,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateState({
        status: 'failed',
        progress: 0,
        statusMessage: errorMessage,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check size
    if (file.size > this.config.maxFileSize) {
      return { valid: false, error: `File too large. Max size: ${formatFileSize(this.config.maxFileSize)}` };
    }

    // Check type
    const contentType = getContentType(file.type);
    if (!contentType || !this.config.allowedContentTypes.includes(contentType)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  validateMetadata(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.state.metadata.name?.trim()) {
      errors.push('Name is required');
    }

    if (this.state.metadata.name && this.state.metadata.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    return { valid: errors.length === 0, errors };
  }

  canProceed(): boolean {
    const step = this.getCurrentStep();

    switch (step.component) {
      case 'upload':
        return !!this.state.file;
      case 'metadata':
        return this.validateMetadata().valid;
      case 'options':
        return true;
      case 'preview':
        return true;
      case 'confirm':
        return this.state.status !== 'processing';
      default:
        return true;
    }
  }

  // ==========================================================================
  // Reset
  // ==========================================================================

  reset(): void {
    this.steps = DEFAULT_STEPS.map(s => ({ ...s }));
    this.currentStepIndex = 0;
    this.state = {
      status: 'idle',
      progress: 0,
      statusMessage: '',
      metadata: { name: '' },
      options: { ...DEFAULT_MINT_OPTIONS },
    };
    this.notify();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMintingManager(config?: Partial<ModalConfig>): MintingManager {
  return new MintingManager(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getContentType(mimeType: string): ContentType | undefined {
  for (const [type, mimes] of Object.entries(CONTENT_TYPE_MIMES)) {
    if (mimes.includes(mimeType)) {
      return type as ContentType;
    }
  }
  return undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function generateMetadataJson(metadata: NFTMetadata): string {
  return JSON.stringify(metadata, null, 2);
}

export function getRarityColor(rarity: RarityLevel): string {
  const colors: Record<RarityLevel, string> = {
    common: '#9CA3AF',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
    unique: '#EF4444',
  };
  return colors[rarity];
}

export function calculateRoyalty(salePrice: number, royaltyPercent: number): number {
  return salePrice * (royaltyPercent / 100);
}

export function getExplorerUrl(
  blockchain: string,
  type: 'tx' | 'token' | 'inscription',
  id: string
): string {
  const explorers: Record<string, Record<string, string>> = {
    bsv: {
      tx: `https://whatsonchain.com/tx/${id}`,
      token: `https://whatsonchain.com/tx/${id}`,
      inscription: `https://1satordinals.com/inscription/${id}`,
    },
    bitcoin: {
      tx: `https://mempool.space/tx/${id}`,
      inscription: `https://ordinals.com/inscription/${id}`,
    },
    ethereum: {
      tx: `https://etherscan.io/tx/${id}`,
      token: `https://etherscan.io/token/${id}`,
    },
    solana: {
      tx: `https://solscan.io/tx/${id}`,
      token: `https://solscan.io/token/${id}`,
    },
  };

  return explorers[blockchain]?.[type] || '';
}
