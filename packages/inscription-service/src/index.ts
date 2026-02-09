/**
 * @b0ase/inscription-service
 *
 * Ordinals inscription service types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Blockchain network */
export type InscriptionNetwork = 'bsv' | 'bitcoin';

/** Inscription status */
export type InscriptionStatus =
  | 'pending'
  | 'broadcasting'
  | 'mempool'
  | 'confirming'
  | 'confirmed'
  | 'failed';

/** Content type */
export type ContentType =
  | 'text/plain'
  | 'text/html'
  | 'text/css'
  | 'text/javascript'
  | 'application/json'
  | 'application/javascript'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'video/mp4'
  | 'video/webm'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'model/gltf-binary'
  | 'application/pdf';

/** Inscription type */
export type InscriptionType =
  | 'image'
  | 'text'
  | 'html'
  | 'json'
  | 'video'
  | 'audio'
  | '3d'
  | 'document'
  | 'code';

/** Inscription envelope */
export interface InscriptionEnvelope {
  contentType: ContentType;
  content: Uint8Array;
  pointer?: number;
  parent?: string;
  metadata?: InscriptionMetadata;
  metaprotocol?: string;
  delegate?: string;
}

/** Inscription metadata */
export interface InscriptionMetadata {
  name?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  collection?: string;
  creator?: string;
  [key: string]: unknown;
}

/** Inscription request */
export interface InscriptionRequest {
  network: InscriptionNetwork;
  envelope: InscriptionEnvelope;
  feeRate: number;
  destinationAddress: string;
  changeAddress?: string;
}

/** Inscription result */
export interface InscriptionResult {
  inscriptionId: string;
  txid: string;
  commitTxid?: string;
  revealTxid?: string;
  status: InscriptionStatus;
  fee: bigint;
  satpoint: string;
  content: {
    type: ContentType;
    size: number;
    hash: string;
  };
  explorerUrl: string;
}

/** Inscription info */
export interface InscriptionInfo {
  id: string;
  number?: number;
  address: string;
  outputValue: bigint;
  satpoint: string;
  contentType: ContentType;
  contentLength: number;
  genesisHeight: number;
  genesisTimestamp: Date;
  txid: string;
  content?: Uint8Array;
  metadata?: InscriptionMetadata;
}

/** Collection info */
export interface CollectionInfo {
  id: string;
  name: string;
  description?: string;
  creator: string;
  totalSupply: number;
  inscribed: number;
  floorPrice?: bigint;
  totalVolume?: bigint;
}

/** Ordinals UTXO */
export interface OrdinalsUTXO {
  txid: string;
  vout: number;
  satoshis: bigint;
  script: string;
  inscriptions: InscriptionInfo[];
  runes?: RuneBalance[];
}

/** Rune balance */
export interface RuneBalance {
  runeId: string;
  runeName: string;
  amount: bigint;
  divisibility: number;
  symbol?: string;
}

/** Fee estimate */
export interface FeeEstimate {
  commit: bigint;
  reveal: bigint;
  total: bigint;
  feeRate: number;
  size: {
    commit: number;
    reveal: number;
  };
}

/** Batch inscription */
export interface BatchInscription {
  id: string;
  envelopes: InscriptionEnvelope[];
  status: InscriptionStatus;
  results: InscriptionResult[];
  totalFee: bigint;
  createdAt: Date;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_FEE_RATE = 1; // sat/vbyte

export const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'glb': 'model/gltf-binary',
  'pdf': 'application/pdf',
};

export const MAX_CONTENT_SIZE = 400 * 1024; // 400KB standard limit

// ============================================================================
// Inscription Service
// ============================================================================

export class InscriptionService {
  private network: InscriptionNetwork;
  private apiUrl: string;
  private inscriptions: Map<string, InscriptionInfo> = new Map();
  private pendingRequests: Map<string, InscriptionRequest> = new Map();

  constructor(network: InscriptionNetwork = 'bsv', apiUrl?: string) {
    this.network = network;
    this.apiUrl = apiUrl || this.getDefaultApiUrl(network);
  }

  private getDefaultApiUrl(network: InscriptionNetwork): string {
    switch (network) {
      case 'bsv':
        return 'https://api.1satordinals.com';
      case 'bitcoin':
        return 'https://ordinals.com';
    }
  }

  // ==========================================================================
  // Inscription Creation
  // ==========================================================================

  createEnvelope(
    content: Uint8Array | string,
    contentType: ContentType,
    metadata?: InscriptionMetadata
  ): InscriptionEnvelope {
    const contentBytes = typeof content === 'string'
      ? new TextEncoder().encode(content)
      : content;

    return {
      contentType,
      content: contentBytes,
      metadata,
    };
  }

  async prepareInscription(request: InscriptionRequest): Promise<PreparedInscription> {
    const { envelope, feeRate, destinationAddress, changeAddress } = request;

    // Validate content size
    if (envelope.content.length > MAX_CONTENT_SIZE) {
      throw new Error(`Content exceeds maximum size of ${MAX_CONTENT_SIZE} bytes`);
    }

    // Calculate fees
    const feeEstimate = this.estimateFees(envelope, feeRate);

    // Build envelope script
    const envelopeScript = this.buildEnvelopeScript(envelope);

    const prepared: PreparedInscription = {
      id: generateInscriptionId(),
      envelope,
      envelopeScript,
      destinationAddress,
      changeAddress: changeAddress || destinationAddress,
      feeEstimate,
      status: 'pending',
      createdAt: new Date(),
    };

    this.pendingRequests.set(prepared.id, request);
    return prepared;
  }

  estimateFees(envelope: InscriptionEnvelope, feeRate: number): FeeEstimate {
    // Envelope overhead: ~30 bytes
    // Content: variable
    // Script overhead: ~50 bytes
    const envelopeSize = 30 + envelope.content.length + 50;

    // Commit tx: ~150 bytes
    const commitSize = 150;

    // Reveal tx: envelope + ~150 bytes
    const revealSize = envelopeSize + 150;

    const commitFee = BigInt(Math.ceil(commitSize * feeRate));
    const revealFee = BigInt(Math.ceil(revealSize * feeRate));

    return {
      commit: commitFee,
      reveal: revealFee,
      total: commitFee + revealFee,
      feeRate,
      size: { commit: commitSize, reveal: revealSize },
    };
  }

  private buildEnvelopeScript(envelope: InscriptionEnvelope): string {
    const parts: string[] = [];

    // OP_FALSE OP_IF "ord"
    parts.push('0063036f7264');

    // Content type tag (01)
    parts.push('01');
    parts.push(this.pushData(new TextEncoder().encode(envelope.contentType)));

    // Content (00)
    parts.push('00');
    parts.push(this.pushData(envelope.content));

    // Pointer tag (02) if present
    if (envelope.pointer !== undefined) {
      parts.push('02');
      parts.push(this.pushInt(envelope.pointer));
    }

    // Parent tag (03) if present
    if (envelope.parent) {
      parts.push('03');
      parts.push(this.pushData(hexToBytes(envelope.parent)));
    }

    // Metadata tag (05) if present
    if (envelope.metadata) {
      parts.push('05');
      const metadataJson = JSON.stringify(envelope.metadata);
      parts.push(this.pushData(new TextEncoder().encode(metadataJson)));
    }

    // Metaprotocol tag (07) if present
    if (envelope.metaprotocol) {
      parts.push('07');
      parts.push(this.pushData(new TextEncoder().encode(envelope.metaprotocol)));
    }

    // Delegate tag (0b) if present
    if (envelope.delegate) {
      parts.push('0b');
      parts.push(this.pushData(hexToBytes(envelope.delegate)));
    }

    // OP_ENDIF
    parts.push('68');

    return parts.join('');
  }

  private pushData(data: Uint8Array): string {
    const len = data.length;
    let prefix: string;

    if (len <= 75) {
      prefix = len.toString(16).padStart(2, '0');
    } else if (len <= 255) {
      prefix = '4c' + len.toString(16).padStart(2, '0');
    } else if (len <= 65535) {
      const lenHex = len.toString(16).padStart(4, '0');
      prefix = '4d' + lenHex.slice(2, 4) + lenHex.slice(0, 2);
    } else {
      const lenHex = len.toString(16).padStart(8, '0');
      prefix = '4e' + lenHex.slice(6, 8) + lenHex.slice(4, 6) + lenHex.slice(2, 4) + lenHex.slice(0, 2);
    }

    return prefix + bytesToHex(data);
  }

  private pushInt(n: number): string {
    if (n === 0) return '00';
    if (n >= 1 && n <= 16) return (0x50 + n).toString(16);
    if (n < 256) return '01' + n.toString(16).padStart(2, '0');
    if (n < 65536) {
      const hex = n.toString(16).padStart(4, '0');
      return '02' + hex.slice(2, 4) + hex.slice(0, 2);
    }
    // Larger numbers...
    const hex = n.toString(16).padStart(8, '0');
    return '04' + hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);
  }

  // ==========================================================================
  // Inscription Lookup
  // ==========================================================================

  async getInscription(inscriptionId: string): Promise<InscriptionInfo | null> {
    // Check cache first
    const cached = this.inscriptions.get(inscriptionId);
    if (cached) return cached;

    // Would fetch from API in real implementation
    return null;
  }

  async getInscriptionContent(inscriptionId: string): Promise<Uint8Array | null> {
    const info = await this.getInscription(inscriptionId);
    return info?.content || null;
  }

  async getInscriptionsByAddress(address: string): Promise<InscriptionInfo[]> {
    // Would fetch from API in real implementation
    return [];
  }

  async getCollection(collectionId: string): Promise<CollectionInfo | null> {
    // Would fetch from API in real implementation
    return null;
  }

  // ==========================================================================
  // Batch Operations
  // ==========================================================================

  async prepareBatchInscription(
    envelopes: InscriptionEnvelope[],
    destinationAddress: string,
    feeRate: number = DEFAULT_FEE_RATE
  ): Promise<BatchInscription> {
    const batch: BatchInscription = {
      id: generateBatchId(),
      envelopes,
      status: 'pending',
      results: [],
      totalFee: 0n,
      createdAt: new Date(),
    };

    // Calculate total fees
    for (const envelope of envelopes) {
      const estimate = this.estimateFees(envelope, feeRate);
      batch.totalFee += estimate.total;
    }

    return batch;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  getExplorerUrl(inscriptionId: string): string {
    switch (this.network) {
      case 'bsv':
        return `https://1satordinals.com/inscription/${inscriptionId}`;
      case 'bitcoin':
        return `https://ordinals.com/inscription/${inscriptionId}`;
    }
  }

  getContentUrl(inscriptionId: string): string {
    switch (this.network) {
      case 'bsv':
        return `https://1satordinals.com/content/${inscriptionId}`;
      case 'bitcoin':
        return `https://ordinals.com/content/${inscriptionId}`;
    }
  }

  setNetwork(network: InscriptionNetwork): void {
    this.network = network;
    this.apiUrl = this.getDefaultApiUrl(network);
  }

  getNetwork(): InscriptionNetwork {
    return this.network;
  }
}

/** Prepared inscription */
export interface PreparedInscription {
  id: string;
  envelope: InscriptionEnvelope;
  envelopeScript: string;
  destinationAddress: string;
  changeAddress: string;
  feeEstimate: FeeEstimate;
  status: InscriptionStatus;
  createdAt: Date;
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createInscriptionService(
  network: InscriptionNetwork = 'bsv',
  apiUrl?: string
): InscriptionService {
  return new InscriptionService(network, apiUrl);
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateInscriptionId(): string {
  return `pending_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getContentTypeFromExtension(filename: string): ContentType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPE_MAP[ext] || 'application/octet-stream' as ContentType;
}

export function getInscriptionType(contentType: ContentType): InscriptionType {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType === 'text/html') return 'html';
  if (contentType === 'text/plain') return 'text';
  if (contentType === 'application/json') return 'json';
  if (contentType === 'application/pdf') return 'document';
  if (contentType === 'model/gltf-binary') return '3d';
  if (contentType.includes('javascript') || contentType === 'text/css') return 'code';
  return 'text';
}

export function parseInscriptionId(inscriptionId: string): { txid: string; index: number } | null {
  const parts = inscriptionId.split('i');
  if (parts.length !== 2) return null;

  const txid = parts[0];
  const index = parseInt(parts[1], 10);

  if (txid.length !== 64 || isNaN(index)) return null;

  return { txid, index };
}

export function formatInscriptionId(txid: string, index: number): string {
  return `${txid}i${index}`;
}

export function formatSatpoint(txid: string, vout: number, offset: number = 0): string {
  return `${txid}:${vout}:${offset}`;
}

export function parseSatpoint(satpoint: string): { txid: string; vout: number; offset: number } | null {
  const parts = satpoint.split(':');
  if (parts.length < 2) return null;

  const txid = parts[0];
  const vout = parseInt(parts[1], 10);
  const offset = parts[2] ? parseInt(parts[2], 10) : 0;

  if (txid.length !== 64 || isNaN(vout)) return null;

  return { txid, vout, offset };
}

export function calculateContentHash(content: Uint8Array): string {
  // Placeholder - would use actual SHA256 in real implementation
  let hash = 0n;
  for (const byte of content) {
    hash = (hash * 31n + BigInt(byte)) % (2n ** 256n);
  }
  return hash.toString(16).padStart(64, '0');
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function isValidInscriptionContent(content: Uint8Array): { valid: boolean; error?: string } {
  if (content.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (content.length > MAX_CONTENT_SIZE) {
    return {
      valid: false,
      error: `Content exceeds maximum size of ${formatFileSize(MAX_CONTENT_SIZE)}`,
    };
  }

  return { valid: true };
}
