/**
 * @b0ase/inscription-service
 *
 * Ordinals inscription service types and utilities.
 *
 * @packageDocumentation
 */
/** Blockchain network */
type InscriptionNetwork = 'bsv' | 'bitcoin';
/** Inscription status */
type InscriptionStatus = 'pending' | 'broadcasting' | 'mempool' | 'confirming' | 'confirmed' | 'failed';
/** Content type */
type ContentType = 'text/plain' | 'text/html' | 'text/css' | 'text/javascript' | 'application/json' | 'application/javascript' | 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml' | 'video/mp4' | 'video/webm' | 'audio/mpeg' | 'audio/wav' | 'model/gltf-binary' | 'application/pdf';
/** Inscription type */
type InscriptionType = 'image' | 'text' | 'html' | 'json' | 'video' | 'audio' | '3d' | 'document' | 'code';
/** Inscription envelope */
interface InscriptionEnvelope {
    contentType: ContentType;
    content: Uint8Array;
    pointer?: number;
    parent?: string;
    metadata?: InscriptionMetadata;
    metaprotocol?: string;
    delegate?: string;
}
/** Inscription metadata */
interface InscriptionMetadata {
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
interface InscriptionRequest {
    network: InscriptionNetwork;
    envelope: InscriptionEnvelope;
    feeRate: number;
    destinationAddress: string;
    changeAddress?: string;
}
/** Inscription result */
interface InscriptionResult {
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
interface InscriptionInfo {
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
interface CollectionInfo {
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
interface OrdinalsUTXO {
    txid: string;
    vout: number;
    satoshis: bigint;
    script: string;
    inscriptions: InscriptionInfo[];
    runes?: RuneBalance[];
}
/** Rune balance */
interface RuneBalance {
    runeId: string;
    runeName: string;
    amount: bigint;
    divisibility: number;
    symbol?: string;
}
/** Fee estimate */
interface FeeEstimate {
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
interface BatchInscription {
    id: string;
    envelopes: InscriptionEnvelope[];
    status: InscriptionStatus;
    results: InscriptionResult[];
    totalFee: bigint;
    createdAt: Date;
}
declare const DEFAULT_FEE_RATE = 1;
declare const CONTENT_TYPE_MAP: Record<string, ContentType>;
declare const MAX_CONTENT_SIZE: number;
declare class InscriptionService {
    private network;
    private apiUrl;
    private inscriptions;
    private pendingRequests;
    constructor(network?: InscriptionNetwork, apiUrl?: string);
    private getDefaultApiUrl;
    createEnvelope(content: Uint8Array | string, contentType: ContentType, metadata?: InscriptionMetadata): InscriptionEnvelope;
    prepareInscription(request: InscriptionRequest): Promise<PreparedInscription>;
    estimateFees(envelope: InscriptionEnvelope, feeRate: number): FeeEstimate;
    private buildEnvelopeScript;
    private pushData;
    private pushInt;
    getInscription(inscriptionId: string): Promise<InscriptionInfo | null>;
    getInscriptionContent(inscriptionId: string): Promise<Uint8Array | null>;
    getInscriptionsByAddress(address: string): Promise<InscriptionInfo[]>;
    getCollection(collectionId: string): Promise<CollectionInfo | null>;
    prepareBatchInscription(envelopes: InscriptionEnvelope[], destinationAddress: string, feeRate?: number): Promise<BatchInscription>;
    getExplorerUrl(inscriptionId: string): string;
    getContentUrl(inscriptionId: string): string;
    setNetwork(network: InscriptionNetwork): void;
    getNetwork(): InscriptionNetwork;
}
/** Prepared inscription */
interface PreparedInscription {
    id: string;
    envelope: InscriptionEnvelope;
    envelopeScript: string;
    destinationAddress: string;
    changeAddress: string;
    feeEstimate: FeeEstimate;
    status: InscriptionStatus;
    createdAt: Date;
}
declare function createInscriptionService(network?: InscriptionNetwork, apiUrl?: string): InscriptionService;
declare function getContentTypeFromExtension(filename: string): ContentType;
declare function getInscriptionType(contentType: ContentType): InscriptionType;
declare function parseInscriptionId(inscriptionId: string): {
    txid: string;
    index: number;
} | null;
declare function formatInscriptionId(txid: string, index: number): string;
declare function formatSatpoint(txid: string, vout: number, offset?: number): string;
declare function parseSatpoint(satpoint: string): {
    txid: string;
    vout: number;
    offset: number;
} | null;
declare function calculateContentHash(content: Uint8Array): string;
declare function formatFileSize(bytes: number): string;
declare function isValidInscriptionContent(content: Uint8Array): {
    valid: boolean;
    error?: string;
};

export { type BatchInscription, CONTENT_TYPE_MAP, type CollectionInfo, type ContentType, DEFAULT_FEE_RATE, type FeeEstimate, type InscriptionEnvelope, type InscriptionInfo, type InscriptionMetadata, type InscriptionNetwork, type InscriptionRequest, type InscriptionResult, InscriptionService, type InscriptionStatus, type InscriptionType, MAX_CONTENT_SIZE, type OrdinalsUTXO, type PreparedInscription, type RuneBalance, calculateContentHash, createInscriptionService, formatFileSize, formatInscriptionId, formatSatpoint, getContentTypeFromExtension, getInscriptionType, isValidInscriptionContent, parseInscriptionId, parseSatpoint };
