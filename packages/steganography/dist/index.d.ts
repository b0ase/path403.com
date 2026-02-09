/**
 * @b0ase/steganography
 *
 * Hide and extract data in images using steganography techniques.
 * Supports LSB (Least Significant Bit) encoding with optional encryption.
 *
 * @packageDocumentation
 */
/** Encoding method */
type EncodingMethod = 'lsb' | 'lsb-rgb' | 'lsb-rgba' | 'dct';
/** Encryption type */
type EncryptionType = 'none' | 'xor' | 'aes';
/** Color channel */
type Channel = 'r' | 'g' | 'b' | 'a';
/** Encode options */
interface EncodeOptions {
    method?: EncodingMethod;
    channels?: Channel[];
    bitsPerChannel?: number;
    encryption?: EncryptionType;
    password?: string;
    spread?: boolean;
    seed?: number;
}
/** Decode options */
interface DecodeOptions {
    method?: EncodingMethod;
    channels?: Channel[];
    bitsPerChannel?: number;
    encryption?: EncryptionType;
    password?: string;
    spread?: boolean;
    seed?: number;
}
/** Image data wrapper */
interface ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}
/** Encode result */
interface EncodeResult {
    imageData: ImageData;
    bytesEncoded: number;
    capacity: number;
    usedCapacity: number;
}
/** Decode result */
interface DecodeResult {
    data: Uint8Array;
    text?: string;
    bytesDecoded: number;
}
/** Capacity analysis */
interface CapacityAnalysis {
    totalBytes: number;
    usableBytes: number;
    maxMessageLength: number;
    bitsPerPixel: number;
    pixelCount: number;
}
/** Detection result */
interface DetectionResult {
    hasHiddenData: boolean;
    confidence: number;
    method?: EncodingMethod;
    estimatedSize?: number;
    indicators: string[];
}
declare const MAGIC_HEADER: Uint8Array<ArrayBuffer>;
declare const HEADER_SIZE = 12;
declare const DEFAULT_OPTIONS: Required<EncodeOptions>;
declare class SteganographyEngine {
    private options;
    constructor(options?: EncodeOptions);
    encode(imageData: ImageData, message: string | Uint8Array): EncodeResult;
    encodeText(imageData: ImageData, text: string): EncodeResult;
    encodeFile(imageData: ImageData, fileData: Uint8Array, filename: string): EncodeResult;
    decode(imageData: ImageData, options?: DecodeOptions): DecodeResult;
    decodeText(imageData: ImageData, options?: DecodeOptions): string;
    decodeFile(imageData: ImageData, options?: DecodeOptions): {
        filename: string;
        data: Uint8Array;
    };
    calculateCapacity(imageData: ImageData): CapacityAnalysis;
    detect(imageData: ImageData): DetectionResult;
    private preparePayload;
    private encodePayload;
    private extractPayload;
    private extractBits;
    private parsePayload;
    private encrypt;
    private decrypt;
    private xorCipher;
    private analyzeLSB;
    private estimateHiddenSize;
    private checkMagicHeader;
    private getChannelOffset;
    private encodeChannels;
    private getBit;
    private setBit;
    private bytesToBits;
    private bitsToBytes;
    private stringToBytes;
    private bytesToString;
    private generatePositions;
}
declare function createSteganography(options?: EncodeOptions): SteganographyEngine;
/**
 * Encode text into image
 */
declare function encodeText(imageData: ImageData, text: string, options?: EncodeOptions): EncodeResult;
/**
 * Decode text from image
 */
declare function decodeText(imageData: ImageData, options?: DecodeOptions): string;
/**
 * Check if image has hidden data
 */
declare function detectHiddenData(imageData: ImageData): DetectionResult;
/**
 * Calculate image capacity
 */
declare function getCapacity(imageData: ImageData, options?: EncodeOptions): CapacityAnalysis;
/**
 * Create ImageData from canvas context
 */
declare function imageDataFromCanvas(ctx: CanvasRenderingContext2D, x?: number, y?: number, width?: number, height?: number): ImageData;
/**
 * Apply ImageData to canvas context
 */
declare function imageDataToCanvas(ctx: CanvasRenderingContext2D, imageData: ImageData, x?: number, y?: number): void;

export { type CapacityAnalysis, type Channel, DEFAULT_OPTIONS, type DecodeOptions, type DecodeResult, type DetectionResult, type EncodeOptions, type EncodeResult, type EncodingMethod, type EncryptionType, HEADER_SIZE, type ImageData, MAGIC_HEADER, SteganographyEngine, createSteganography, decodeText, detectHiddenData, encodeText, getCapacity, imageDataFromCanvas, imageDataToCanvas };
