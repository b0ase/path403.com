/**
 * @b0ase/dropblocks
 *
 * Decentralized storage management with multi-provider support.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Storage provider type */
export type StorageProvider =
  | 'ipfs'
  | 'arweave'
  | 'bsv'
  | 'filecoin'
  | 's3'
  | 'r2'
  | 'local'
  | 'ordinals';

/** File status */
export type FileStatus =
  | 'pending'
  | 'uploading'
  | 'pinned'
  | 'replicated'
  | 'failed'
  | 'deleted';

/** Content identifier type */
export type ContentIdType = 'cid' | 'txid' | 'inscription' | 'url' | 'hash';

/** Storage file metadata */
export interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  contentId: string;
  contentIdType: ContentIdType;
  provider: StorageProvider;
  status: FileStatus;
  url?: string;
  gateway?: string;
  checksum: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  replicas?: FileReplica[];
}

/** File replica on another provider */
export interface FileReplica {
  provider: StorageProvider;
  contentId: string;
  contentIdType: ContentIdType;
  url?: string;
  status: FileStatus;
  syncedAt: Date;
}

/** Upload options */
export interface UploadOptions {
  name?: string;
  mimeType?: string;
  encrypt?: boolean;
  encryptionKey?: string;
  replicate?: StorageProvider[];
  pin?: boolean;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  onProgress?: (progress: UploadProgress) => void;
}

/** Upload progress */
export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  provider: StorageProvider;
}

/** Provider configuration */
export interface ProviderConfig {
  provider: StorageProvider;
  endpoint?: string;
  apiKey?: string;
  secretKey?: string;
  bucket?: string;
  gateway?: string;
  options?: Record<string, unknown>;
}

/** Storage stats */
export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byProvider: Record<StorageProvider, { files: number; size: number }>;
  byStatus: Record<FileStatus, number>;
}

/** Pin status */
export interface PinStatus {
  isPinned: boolean;
  provider: StorageProvider;
  contentId: string;
  pinnedAt?: Date;
  expiresAt?: Date;
}

// ============================================================================
// Provider Adapters (Interfaces)
// ============================================================================

/** Storage provider adapter interface */
export interface StorageAdapter {
  provider: StorageProvider;

  upload(
    data: Uint8Array | string,
    options?: UploadOptions
  ): Promise<StorageFile>;

  download(contentId: string): Promise<Uint8Array>;

  delete(contentId: string): Promise<boolean>;

  getUrl(contentId: string): string;

  pin(contentId: string): Promise<PinStatus>;

  unpin(contentId: string): Promise<boolean>;

  getStatus(contentId: string): Promise<FileStatus>;
}

// ============================================================================
// IPFS Adapter
// ============================================================================

export class IPFSAdapter implements StorageAdapter {
  provider: StorageProvider = 'ipfs';
  private gateway: string;
  private apiEndpoint?: string;
  private apiKey?: string;

  constructor(config: ProviderConfig) {
    this.gateway = config.gateway || 'https://ipfs.io/ipfs/';
    this.apiEndpoint = config.endpoint;
    this.apiKey = config.apiKey;
  }

  async upload(
    data: Uint8Array | string,
    options?: UploadOptions
  ): Promise<StorageFile> {
    // In real implementation, this would use IPFS HTTP API or Pinata/Infura
    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);

    // Simulate CID generation (real impl would use ipfs-only-hash or actual IPFS)
    const cid = `Qm${this.generateRandomString(44)}`;

    return {
      id: this.generateId(),
      name: options?.name || 'untitled',
      mimeType: options?.mimeType || 'application/octet-stream',
      size: content.length,
      contentId: cid,
      contentIdType: 'cid',
      provider: 'ipfs',
      status: 'pinned',
      url: `${this.gateway}${cid}`,
      gateway: this.gateway,
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: options?.expiresAt,
      metadata: options?.metadata,
    };
  }

  async download(contentId: string): Promise<Uint8Array> {
    const response = await fetch(`${this.gateway}${contentId}`);
    if (!response.ok) {
      throw new Error(`Failed to download from IPFS: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  async delete(_contentId: string): Promise<boolean> {
    // IPFS doesn't support deletion, only unpinning
    return false;
  }

  getUrl(contentId: string): string {
    return `${this.gateway}${contentId}`;
  }

  async pin(contentId: string): Promise<PinStatus> {
    // Would call pinning service API
    return {
      isPinned: true,
      provider: 'ipfs',
      contentId,
      pinnedAt: new Date(),
    };
  }

  async unpin(_contentId: string): Promise<boolean> {
    // Would call pinning service API
    return true;
  }

  async getStatus(_contentId: string): Promise<FileStatus> {
    return 'pinned';
  }

  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async computeChecksum(data: Uint8Array): Promise<string> {
    // Simple hash for demo - real impl would use crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

// ============================================================================
// Arweave Adapter
// ============================================================================

export class ArweaveAdapter implements StorageAdapter {
  provider: StorageProvider = 'arweave';
  private gateway: string;
  private apiEndpoint: string;

  constructor(config: ProviderConfig) {
    this.gateway = config.gateway || 'https://arweave.net/';
    this.apiEndpoint = config.endpoint || 'https://arweave.net';
  }

  async upload(
    data: Uint8Array | string,
    options?: UploadOptions
  ): Promise<StorageFile> {
    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);

    // Simulate Arweave TXID (43 chars base64url)
    const txid = this.generateRandomString(43);

    return {
      id: this.generateId(),
      name: options?.name || 'untitled',
      mimeType: options?.mimeType || 'application/octet-stream',
      size: content.length,
      contentId: txid,
      contentIdType: 'txid',
      provider: 'arweave',
      status: 'pinned',
      url: `${this.gateway}${txid}`,
      gateway: this.gateway,
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: options?.metadata,
    };
  }

  async download(contentId: string): Promise<Uint8Array> {
    const response = await fetch(`${this.gateway}${contentId}`);
    if (!response.ok) {
      throw new Error(`Failed to download from Arweave: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  async delete(_contentId: string): Promise<boolean> {
    // Arweave is permanent - cannot delete
    return false;
  }

  getUrl(contentId: string): string {
    return `${this.gateway}${contentId}`;
  }

  async pin(contentId: string): Promise<PinStatus> {
    // Arweave is permanent - always "pinned"
    return {
      isPinned: true,
      provider: 'arweave',
      contentId,
      pinnedAt: new Date(),
    };
  }

  async unpin(_contentId: string): Promise<boolean> {
    // Cannot unpin from Arweave
    return false;
  }

  async getStatus(_contentId: string): Promise<FileStatus> {
    return 'pinned';
  }

  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async computeChecksum(data: Uint8Array): Promise<string> {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

// ============================================================================
// BSV Adapter
// ============================================================================

export class BSVAdapter implements StorageAdapter {
  provider: StorageProvider = 'bsv';
  private network: 'mainnet' | 'testnet';

  constructor(config: ProviderConfig) {
    this.network = config.options?.network as 'mainnet' | 'testnet' || 'mainnet';
  }

  async upload(
    data: Uint8Array | string,
    options?: UploadOptions
  ): Promise<StorageFile> {
    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const checksum = await this.computeChecksum(content);

    // Simulate BSV TXID (64 char hex)
    const txid = this.generateTxid();

    return {
      id: this.generateId(),
      name: options?.name || 'untitled',
      mimeType: options?.mimeType || 'application/octet-stream',
      size: content.length,
      contentId: txid,
      contentIdType: 'txid',
      provider: 'bsv',
      status: 'pinned',
      url: this.getUrl(txid),
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: options?.metadata,
    };
  }

  async download(contentId: string): Promise<Uint8Array> {
    const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/tx/${contentId}/hex`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download from BSV: ${response.statusText}`);
    }
    const hex = await response.text();
    // Parse OP_RETURN data from transaction
    return this.hexToBytes(hex);
  }

  async delete(_contentId: string): Promise<boolean> {
    // Blockchain is permanent
    return false;
  }

  getUrl(contentId: string): string {
    return `https://whatsonchain.com/tx/${contentId}`;
  }

  async pin(contentId: string): Promise<PinStatus> {
    return {
      isPinned: true,
      provider: 'bsv',
      contentId,
      pinnedAt: new Date(),
    };
  }

  async unpin(_contentId: string): Promise<boolean> {
    return false;
  }

  async getStatus(_contentId: string): Promise<FileStatus> {
    return 'pinned';
  }

  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTxid(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async computeChecksum(data: Uint8Array): Promise<string> {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
}

// ============================================================================
// DropBlocks Manager
// ============================================================================

export class DropBlocksManager {
  private adapters: Map<StorageProvider, StorageAdapter> = new Map();
  private files: Map<string, StorageFile> = new Map();
  private defaultProvider: StorageProvider;

  constructor(defaultProvider: StorageProvider = 'ipfs') {
    this.defaultProvider = defaultProvider;
  }

  registerAdapter(adapter: StorageAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  setDefaultProvider(provider: StorageProvider): void {
    if (!this.adapters.has(provider)) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }
    this.defaultProvider = provider;
  }

  private getAdapter(provider: StorageProvider): StorageAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }
    return adapter;
  }

  async upload(
    data: Uint8Array | string,
    options?: UploadOptions & { provider?: StorageProvider }
  ): Promise<StorageFile> {
    const provider = options?.provider || this.defaultProvider;
    const adapter = this.getAdapter(provider);

    const file = await adapter.upload(data, options);
    this.files.set(file.id, file);

    // Handle replication
    if (options?.replicate && options.replicate.length > 0) {
      const replicas: FileReplica[] = [];

      for (const replicaProvider of options.replicate) {
        if (replicaProvider === provider) continue;

        try {
          const replicaAdapter = this.getAdapter(replicaProvider);
          const replicaFile = await replicaAdapter.upload(data, options);

          replicas.push({
            provider: replicaProvider,
            contentId: replicaFile.contentId,
            contentIdType: replicaFile.contentIdType,
            url: replicaFile.url,
            status: 'replicated',
            syncedAt: new Date(),
          });
        } catch (error) {
          replicas.push({
            provider: replicaProvider,
            contentId: '',
            contentIdType: 'hash',
            status: 'failed',
            syncedAt: new Date(),
          });
        }
      }

      file.replicas = replicas;
      file.status = 'replicated';
      this.files.set(file.id, file);
    }

    return file;
  }

  async download(
    fileIdOrContentId: string,
    provider?: StorageProvider
  ): Promise<Uint8Array> {
    // Try to find by file ID first
    const file = this.files.get(fileIdOrContentId);

    if (file) {
      const adapter = this.getAdapter(provider || file.provider);
      return adapter.download(file.contentId);
    }

    // Otherwise treat as content ID
    if (!provider) {
      throw new Error('Provider required when downloading by content ID');
    }

    const adapter = this.getAdapter(provider);
    return adapter.download(fileIdOrContentId);
  }

  async delete(fileId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    if (!file) return false;

    const adapter = this.getAdapter(file.provider);
    await adapter.delete(file.contentId);

    file.status = 'deleted';
    file.updatedAt = new Date();
    this.files.set(fileId, file);

    return true;
  }

  getFile(fileId: string): StorageFile | undefined {
    return this.files.get(fileId);
  }

  getFileByContentId(contentId: string): StorageFile | undefined {
    for (const file of this.files.values()) {
      if (file.contentId === contentId) return file;
    }
    return undefined;
  }

  getUrl(fileId: string): string | undefined {
    const file = this.files.get(fileId);
    if (!file) return undefined;

    const adapter = this.getAdapter(file.provider);
    return adapter.getUrl(file.contentId);
  }

  async pin(fileId: string): Promise<PinStatus | undefined> {
    const file = this.files.get(fileId);
    if (!file) return undefined;

    const adapter = this.getAdapter(file.provider);
    return adapter.pin(file.contentId);
  }

  async unpin(fileId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    if (!file) return false;

    const adapter = this.getAdapter(file.provider);
    return adapter.unpin(file.contentId);
  }

  listFiles(filter?: {
    provider?: StorageProvider;
    status?: FileStatus;
    mimeType?: string;
  }): StorageFile[] {
    let files = Array.from(this.files.values());

    if (filter?.provider) {
      files = files.filter(f => f.provider === filter.provider);
    }
    if (filter?.status) {
      files = files.filter(f => f.status === filter.status);
    }
    if (filter?.mimeType) {
      files = files.filter(f => f.mimeType === filter.mimeType);
    }

    return files;
  }

  getStats(): StorageStats {
    const files = Array.from(this.files.values());

    const byProvider: Record<string, { files: number; size: number }> = {};
    const byStatus: Record<string, number> = {};

    let totalSize = 0;

    for (const file of files) {
      totalSize += file.size;

      if (!byProvider[file.provider]) {
        byProvider[file.provider] = { files: 0, size: 0 };
      }
      byProvider[file.provider].files++;
      byProvider[file.provider].size += file.size;

      byStatus[file.status] = (byStatus[file.status] || 0) + 1;
    }

    return {
      totalFiles: files.length,
      totalSize,
      byProvider: byProvider as StorageStats['byProvider'],
      byStatus: byStatus as StorageStats['byStatus'],
    };
  }

  async replicate(
    fileId: string,
    targetProviders: StorageProvider[]
  ): Promise<FileReplica[]> {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    // Download from original
    const data = await this.download(fileId);

    const replicas: FileReplica[] = file.replicas || [];

    for (const provider of targetProviders) {
      if (provider === file.provider) continue;

      // Check if already replicated
      const existingReplica = replicas.find(r => r.provider === provider);
      if (existingReplica && existingReplica.status === 'replicated') continue;

      try {
        const adapter = this.getAdapter(provider);
        const replicaFile = await adapter.upload(data, {
          name: file.name,
          mimeType: file.mimeType,
          metadata: file.metadata,
        });

        const replicaIndex = replicas.findIndex(r => r.provider === provider);
        const replica: FileReplica = {
          provider,
          contentId: replicaFile.contentId,
          contentIdType: replicaFile.contentIdType,
          url: replicaFile.url,
          status: 'replicated',
          syncedAt: new Date(),
        };

        if (replicaIndex >= 0) {
          replicas[replicaIndex] = replica;
        } else {
          replicas.push(replica);
        }
      } catch (error) {
        const replica: FileReplica = {
          provider,
          contentId: '',
          contentIdType: 'hash',
          status: 'failed',
          syncedAt: new Date(),
        };
        replicas.push(replica);
      }
    }

    file.replicas = replicas;
    file.status = 'replicated';
    file.updatedAt = new Date();
    this.files.set(fileId, file);

    return replicas;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createDropBlocks(
  defaultProvider: StorageProvider = 'ipfs'
): DropBlocksManager {
  return new DropBlocksManager(defaultProvider);
}

export function createIPFSAdapter(config: Partial<ProviderConfig> = {}): IPFSAdapter {
  return new IPFSAdapter({ provider: 'ipfs', ...config });
}

export function createArweaveAdapter(config: Partial<ProviderConfig> = {}): ArweaveAdapter {
  return new ArweaveAdapter({ provider: 'arweave', ...config });
}

export function createBSVAdapter(config: Partial<ProviderConfig> = {}): BSVAdapter {
  return new BSVAdapter({ provider: 'bsv', ...config });
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Data
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    // Code
    js: 'application/javascript',
    ts: 'application/typescript',
    html: 'text/html',
    css: 'text/css',
    // Media
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    // Archives
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export function isIPFSCid(str: string): boolean {
  return str.startsWith('Qm') || str.startsWith('bafy');
}

export function isArweaveTxid(str: string): boolean {
  return /^[a-zA-Z0-9_-]{43}$/.test(str);
}

export function isBSVTxid(str: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(str);
}

export function detectProvider(contentId: string): StorageProvider | undefined {
  if (isIPFSCid(contentId)) return 'ipfs';
  if (isArweaveTxid(contentId)) return 'arweave';
  if (isBSVTxid(contentId)) return 'bsv';
  return undefined;
}
