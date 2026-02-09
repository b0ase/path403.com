/**
 * @b0ase/dropblocks
 *
 * Decentralized storage management with multi-provider support.
 *
 * @packageDocumentation
 */
/** Storage provider type */
type StorageProvider = 'ipfs' | 'arweave' | 'bsv' | 'filecoin' | 's3' | 'r2' | 'local' | 'ordinals';
/** File status */
type FileStatus = 'pending' | 'uploading' | 'pinned' | 'replicated' | 'failed' | 'deleted';
/** Content identifier type */
type ContentIdType = 'cid' | 'txid' | 'inscription' | 'url' | 'hash';
/** Storage file metadata */
interface StorageFile {
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
interface FileReplica {
    provider: StorageProvider;
    contentId: string;
    contentIdType: ContentIdType;
    url?: string;
    status: FileStatus;
    syncedAt: Date;
}
/** Upload options */
interface UploadOptions {
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
interface UploadProgress {
    bytesUploaded: number;
    totalBytes: number;
    percentage: number;
    provider: StorageProvider;
}
/** Provider configuration */
interface ProviderConfig {
    provider: StorageProvider;
    endpoint?: string;
    apiKey?: string;
    secretKey?: string;
    bucket?: string;
    gateway?: string;
    options?: Record<string, unknown>;
}
/** Storage stats */
interface StorageStats {
    totalFiles: number;
    totalSize: number;
    byProvider: Record<StorageProvider, {
        files: number;
        size: number;
    }>;
    byStatus: Record<FileStatus, number>;
}
/** Pin status */
interface PinStatus {
    isPinned: boolean;
    provider: StorageProvider;
    contentId: string;
    pinnedAt?: Date;
    expiresAt?: Date;
}
/** Storage provider adapter interface */
interface StorageAdapter {
    provider: StorageProvider;
    upload(data: Uint8Array | string, options?: UploadOptions): Promise<StorageFile>;
    download(contentId: string): Promise<Uint8Array>;
    delete(contentId: string): Promise<boolean>;
    getUrl(contentId: string): string;
    pin(contentId: string): Promise<PinStatus>;
    unpin(contentId: string): Promise<boolean>;
    getStatus(contentId: string): Promise<FileStatus>;
}
declare class IPFSAdapter implements StorageAdapter {
    provider: StorageProvider;
    private gateway;
    private apiEndpoint?;
    private apiKey?;
    constructor(config: ProviderConfig);
    upload(data: Uint8Array | string, options?: UploadOptions): Promise<StorageFile>;
    download(contentId: string): Promise<Uint8Array>;
    delete(_contentId: string): Promise<boolean>;
    getUrl(contentId: string): string;
    pin(contentId: string): Promise<PinStatus>;
    unpin(_contentId: string): Promise<boolean>;
    getStatus(_contentId: string): Promise<FileStatus>;
    private generateId;
    private generateRandomString;
    private computeChecksum;
}
declare class ArweaveAdapter implements StorageAdapter {
    provider: StorageProvider;
    private gateway;
    private apiEndpoint;
    constructor(config: ProviderConfig);
    upload(data: Uint8Array | string, options?: UploadOptions): Promise<StorageFile>;
    download(contentId: string): Promise<Uint8Array>;
    delete(_contentId: string): Promise<boolean>;
    getUrl(contentId: string): string;
    pin(contentId: string): Promise<PinStatus>;
    unpin(_contentId: string): Promise<boolean>;
    getStatus(_contentId: string): Promise<FileStatus>;
    private generateId;
    private generateRandomString;
    private computeChecksum;
}
declare class BSVAdapter implements StorageAdapter {
    provider: StorageProvider;
    private network;
    constructor(config: ProviderConfig);
    upload(data: Uint8Array | string, options?: UploadOptions): Promise<StorageFile>;
    download(contentId: string): Promise<Uint8Array>;
    delete(_contentId: string): Promise<boolean>;
    getUrl(contentId: string): string;
    pin(contentId: string): Promise<PinStatus>;
    unpin(_contentId: string): Promise<boolean>;
    getStatus(_contentId: string): Promise<FileStatus>;
    private generateId;
    private generateTxid;
    private computeChecksum;
    private hexToBytes;
}
declare class DropBlocksManager {
    private adapters;
    private files;
    private defaultProvider;
    constructor(defaultProvider?: StorageProvider);
    registerAdapter(adapter: StorageAdapter): void;
    setDefaultProvider(provider: StorageProvider): void;
    private getAdapter;
    upload(data: Uint8Array | string, options?: UploadOptions & {
        provider?: StorageProvider;
    }): Promise<StorageFile>;
    download(fileIdOrContentId: string, provider?: StorageProvider): Promise<Uint8Array>;
    delete(fileId: string): Promise<boolean>;
    getFile(fileId: string): StorageFile | undefined;
    getFileByContentId(contentId: string): StorageFile | undefined;
    getUrl(fileId: string): string | undefined;
    pin(fileId: string): Promise<PinStatus | undefined>;
    unpin(fileId: string): Promise<boolean>;
    listFiles(filter?: {
        provider?: StorageProvider;
        status?: FileStatus;
        mimeType?: string;
    }): StorageFile[];
    getStats(): StorageStats;
    replicate(fileId: string, targetProviders: StorageProvider[]): Promise<FileReplica[]>;
}
declare function createDropBlocks(defaultProvider?: StorageProvider): DropBlocksManager;
declare function createIPFSAdapter(config?: Partial<ProviderConfig>): IPFSAdapter;
declare function createArweaveAdapter(config?: Partial<ProviderConfig>): ArweaveAdapter;
declare function createBSVAdapter(config?: Partial<ProviderConfig>): BSVAdapter;
declare function formatFileSize(bytes: number): string;
declare function getMimeType(filename: string): string;
declare function isIPFSCid(str: string): boolean;
declare function isArweaveTxid(str: string): boolean;
declare function isBSVTxid(str: string): boolean;
declare function detectProvider(contentId: string): StorageProvider | undefined;

export { ArweaveAdapter, BSVAdapter, type ContentIdType, DropBlocksManager, type FileReplica, type FileStatus, IPFSAdapter, type PinStatus, type ProviderConfig, type StorageAdapter, type StorageFile, type StorageProvider, type StorageStats, type UploadOptions, type UploadProgress, createArweaveAdapter, createBSVAdapter, createDropBlocks, createIPFSAdapter, detectProvider, formatFileSize, getMimeType, isArweaveTxid, isBSVTxid, isIPFSCid };
