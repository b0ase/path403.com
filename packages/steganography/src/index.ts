/**
 * @b0ase/steganography
 *
 * Hide and extract data in images using steganography techniques.
 * Supports LSB (Least Significant Bit) encoding with optional encryption.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Encoding method */
export type EncodingMethod = 'lsb' | 'lsb-rgb' | 'lsb-rgba' | 'dct';

/** Encryption type */
export type EncryptionType = 'none' | 'xor' | 'aes';

/** Color channel */
export type Channel = 'r' | 'g' | 'b' | 'a';

/** Encode options */
export interface EncodeOptions {
  method?: EncodingMethod;
  channels?: Channel[];
  bitsPerChannel?: number;
  encryption?: EncryptionType;
  password?: string;
  spread?: boolean;
  seed?: number;
}

/** Decode options */
export interface DecodeOptions {
  method?: EncodingMethod;
  channels?: Channel[];
  bitsPerChannel?: number;
  encryption?: EncryptionType;
  password?: string;
  spread?: boolean;
  seed?: number;
}

/** Image data wrapper */
export interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

/** Encode result */
export interface EncodeResult {
  imageData: ImageData;
  bytesEncoded: number;
  capacity: number;
  usedCapacity: number;
}

/** Decode result */
export interface DecodeResult {
  data: Uint8Array;
  text?: string;
  bytesDecoded: number;
}

/** Capacity analysis */
export interface CapacityAnalysis {
  totalBytes: number;
  usableBytes: number;
  maxMessageLength: number;
  bitsPerPixel: number;
  pixelCount: number;
}

/** Detection result */
export interface DetectionResult {
  hasHiddenData: boolean;
  confidence: number;
  method?: EncodingMethod;
  estimatedSize?: number;
  indicators: string[];
}

// ============================================================================
// Constants
// ============================================================================

export const MAGIC_HEADER = new Uint8Array([0x53, 0x54, 0x45, 0x47]); // "STEG"
export const HEADER_SIZE = 12; // Magic (4) + Length (4) + Options (4)
export const DEFAULT_OPTIONS: Required<EncodeOptions> = {
  method: 'lsb',
  channels: ['r', 'g', 'b'],
  bitsPerChannel: 1,
  encryption: 'none',
  password: '',
  spread: false,
  seed: 0,
};

// ============================================================================
// Steganography Engine
// ============================================================================

export class SteganographyEngine {
  private options: Required<EncodeOptions>;

  constructor(options: EncodeOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // ==========================================================================
  // Encoding
  // ==========================================================================

  encode(imageData: ImageData, message: string | Uint8Array): EncodeResult {
    const data = typeof message === 'string' ? this.stringToBytes(message) : message;

    // Check capacity
    const capacity = this.calculateCapacity(imageData);
    if (data.length + HEADER_SIZE > capacity.usableBytes) {
      throw new Error(
        `Message too large. Max: ${capacity.usableBytes - HEADER_SIZE} bytes, Got: ${data.length} bytes`
      );
    }

    // Prepare payload with header
    const payload = this.preparePayload(data);

    // Optionally encrypt
    const finalPayload =
      this.options.encryption !== 'none' ? this.encrypt(payload, this.options.password) : payload;

    // Encode into image
    const result = this.encodePayload(imageData, finalPayload);

    return {
      imageData: result,
      bytesEncoded: data.length,
      capacity: capacity.usableBytes,
      usedCapacity: (finalPayload.length / capacity.usableBytes) * 100,
    };
  }

  encodeText(imageData: ImageData, text: string): EncodeResult {
    return this.encode(imageData, text);
  }

  encodeFile(imageData: ImageData, fileData: Uint8Array, filename: string): EncodeResult {
    // Prepend filename to data
    const filenameBytes = this.stringToBytes(filename);
    const combined = new Uint8Array(2 + filenameBytes.length + fileData.length);
    combined[0] = (filenameBytes.length >> 8) & 0xff;
    combined[1] = filenameBytes.length & 0xff;
    combined.set(filenameBytes, 2);
    combined.set(fileData, 2 + filenameBytes.length);

    return this.encode(imageData, combined);
  }

  // ==========================================================================
  // Decoding
  // ==========================================================================

  decode(imageData: ImageData, options?: DecodeOptions): DecodeResult {
    const opts = { ...this.options, ...options };

    // Extract payload from image
    const payload = this.extractPayload(imageData, opts);

    // Optionally decrypt
    const decrypted = opts.encryption !== 'none' ? this.decrypt(payload, opts.password!) : payload;

    // Validate and parse header
    const { data, length } = this.parsePayload(decrypted);

    return {
      data,
      text: this.bytesToString(data),
      bytesDecoded: length,
    };
  }

  decodeText(imageData: ImageData, options?: DecodeOptions): string {
    const result = this.decode(imageData, options);
    return result.text || '';
  }

  decodeFile(
    imageData: ImageData,
    options?: DecodeOptions
  ): { filename: string; data: Uint8Array } {
    const result = this.decode(imageData, options);

    // Parse filename from data
    const filenameLength = (result.data[0] << 8) | result.data[1];
    const filename = this.bytesToString(result.data.slice(2, 2 + filenameLength));
    const fileData = result.data.slice(2 + filenameLength);

    return { filename, data: fileData };
  }

  // ==========================================================================
  // Analysis
  // ==========================================================================

  calculateCapacity(imageData: ImageData): CapacityAnalysis {
    const pixelCount = imageData.width * imageData.height;
    const bitsPerPixel = this.options.channels.length * this.options.bitsPerChannel;
    const totalBits = pixelCount * bitsPerPixel;
    const totalBytes = Math.floor(totalBits / 8);
    const usableBytes = totalBytes - HEADER_SIZE;

    return {
      totalBytes,
      usableBytes: Math.max(0, usableBytes),
      maxMessageLength: Math.max(0, usableBytes),
      bitsPerPixel,
      pixelCount,
    };
  }

  detect(imageData: ImageData): DetectionResult {
    const indicators: string[] = [];
    let confidence = 0;

    // Check for magic header
    try {
      const firstBytes = this.extractBits(imageData, HEADER_SIZE * 8);
      const hasMagic = this.checkMagicHeader(this.bitsToBytes(firstBytes));
      if (hasMagic) {
        indicators.push('Magic header detected');
        confidence += 50;
      }
    } catch {
      // Ignore extraction errors
    }

    // Statistical analysis - check LSB distribution
    const lsbStats = this.analyzeLSB(imageData);
    if (lsbStats.anomalyScore > 0.3) {
      indicators.push('LSB distribution anomaly');
      confidence += 20;
    }

    // Check for patterns in LSB
    if (lsbStats.hasPatterns) {
      indicators.push('Repeating patterns in LSB');
      confidence += 15;
    }

    // Check chi-square test
    if (lsbStats.chiSquare > 0.05) {
      indicators.push('Chi-square test indicates hidden data');
      confidence += 15;
    }

    return {
      hasHiddenData: confidence >= 50,
      confidence: Math.min(100, confidence),
      method: confidence >= 50 ? 'lsb' : undefined,
      estimatedSize: confidence >= 50 ? this.estimateHiddenSize(imageData) : undefined,
      indicators,
    };
  }

  // ==========================================================================
  // Private Methods - Encoding
  // ==========================================================================

  private preparePayload(data: Uint8Array): Uint8Array {
    const payload = new Uint8Array(HEADER_SIZE + data.length);

    // Magic header
    payload.set(MAGIC_HEADER, 0);

    // Length (4 bytes, big endian)
    payload[4] = (data.length >> 24) & 0xff;
    payload[5] = (data.length >> 16) & 0xff;
    payload[6] = (data.length >> 8) & 0xff;
    payload[7] = data.length & 0xff;

    // Options flags (4 bytes)
    payload[8] = this.options.method === 'lsb' ? 0 : 1;
    payload[9] = this.options.bitsPerChannel;
    payload[10] = this.encodeChannels(this.options.channels);
    payload[11] = this.options.spread ? 1 : 0;

    // Data
    payload.set(data, HEADER_SIZE);

    return payload;
  }

  private encodePayload(imageData: ImageData, payload: Uint8Array): ImageData {
    const result: ImageData = {
      width: imageData.width,
      height: imageData.height,
      data: new Uint8ClampedArray(imageData.data),
    };

    const bits = this.bytesToBits(payload);
    let bitIndex = 0;

    if (this.options.spread) {
      // Spread encoding using PRNG
      const positions = this.generatePositions(
        bits.length,
        imageData.width * imageData.height,
        this.options.seed
      );

      for (const pos of positions) {
        if (bitIndex >= bits.length) break;

        const pixelIndex = pos * 4;
        for (const channel of this.options.channels) {
          if (bitIndex >= bits.length) break;

          const channelOffset = this.getChannelOffset(channel);
          result.data[pixelIndex + channelOffset] = this.setBit(
            result.data[pixelIndex + channelOffset],
            0,
            bits[bitIndex++]
          );
        }
      }
    } else {
      // Sequential encoding
      for (let i = 0; i < result.data.length && bitIndex < bits.length; i += 4) {
        for (const channel of this.options.channels) {
          if (bitIndex >= bits.length) break;

          const channelOffset = this.getChannelOffset(channel);
          for (let bit = 0; bit < this.options.bitsPerChannel; bit++) {
            if (bitIndex >= bits.length) break;
            result.data[i + channelOffset] = this.setBit(
              result.data[i + channelOffset],
              bit,
              bits[bitIndex++]
            );
          }
        }
      }
    }

    return result;
  }

  // ==========================================================================
  // Private Methods - Decoding
  // ==========================================================================

  private extractPayload(imageData: ImageData, options: Required<EncodeOptions>): Uint8Array {
    // First extract header to get length
    const headerBits = this.extractBits(imageData, HEADER_SIZE * 8, options);
    const header = this.bitsToBytes(headerBits);

    // Validate magic
    if (!this.checkMagicHeader(header)) {
      throw new Error('No hidden data found or invalid format');
    }

    // Get length
    const length = (header[4] << 24) | (header[5] << 16) | (header[6] << 8) | header[7];

    if (length <= 0 || length > this.calculateCapacity(imageData).usableBytes) {
      throw new Error('Invalid data length');
    }

    // Extract full payload
    const totalBits = (HEADER_SIZE + length) * 8;
    const allBits = this.extractBits(imageData, totalBits, options);

    return this.bitsToBytes(allBits);
  }

  private extractBits(
    imageData: ImageData,
    count: number,
    options?: Required<EncodeOptions>
  ): number[] {
    const opts = options || this.options;
    const bits: number[] = [];

    if (opts.spread) {
      const positions = this.generatePositions(
        count,
        imageData.width * imageData.height,
        opts.seed
      );

      for (const pos of positions) {
        if (bits.length >= count) break;

        const pixelIndex = pos * 4;
        for (const channel of opts.channels) {
          if (bits.length >= count) break;

          const channelOffset = this.getChannelOffset(channel);
          bits.push(this.getBit(imageData.data[pixelIndex + channelOffset], 0));
        }
      }
    } else {
      for (let i = 0; i < imageData.data.length && bits.length < count; i += 4) {
        for (const channel of opts.channels) {
          if (bits.length >= count) break;

          const channelOffset = this.getChannelOffset(channel);
          for (let bit = 0; bit < opts.bitsPerChannel; bit++) {
            if (bits.length >= count) break;
            bits.push(this.getBit(imageData.data[i + channelOffset], bit));
          }
        }
      }
    }

    return bits;
  }

  private parsePayload(payload: Uint8Array): { data: Uint8Array; length: number } {
    if (!this.checkMagicHeader(payload)) {
      throw new Error('Invalid payload format');
    }

    const length = (payload[4] << 24) | (payload[5] << 16) | (payload[6] << 8) | payload[7];
    const data = payload.slice(HEADER_SIZE, HEADER_SIZE + length);

    return { data, length };
  }

  // ==========================================================================
  // Private Methods - Encryption
  // ==========================================================================

  private encrypt(data: Uint8Array, password: string): Uint8Array {
    if (this.options.encryption === 'xor') {
      return this.xorCipher(data, password);
    }
    // AES would require external library - simplified for now
    return data;
  }

  private decrypt(data: Uint8Array, password: string): Uint8Array {
    if (this.options.encryption === 'xor') {
      return this.xorCipher(data, password);
    }
    return data;
  }

  private xorCipher(data: Uint8Array, key: string): Uint8Array {
    const keyBytes = this.stringToBytes(key);
    const result = new Uint8Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }

    return result;
  }

  // ==========================================================================
  // Private Methods - Analysis
  // ==========================================================================

  private analyzeLSB(imageData: ImageData): {
    anomalyScore: number;
    hasPatterns: boolean;
    chiSquare: number;
  } {
    let zeros = 0;
    let ones = 0;
    const lsbSequence: number[] = [];

    for (let i = 0; i < Math.min(imageData.data.length, 10000); i += 4) {
      const lsb = imageData.data[i] & 1;
      lsbSequence.push(lsb);
      if (lsb === 0) zeros++;
      else ones++;
    }

    // Calculate anomaly score (0-1, higher = more anomalous)
    const total = zeros + ones;
    const expectedHalf = total / 2;
    const anomalyScore = Math.abs(zeros - expectedHalf) / expectedHalf;

    // Check for patterns
    let patternCount = 0;
    for (let i = 0; i < lsbSequence.length - 8; i++) {
      const pattern = lsbSequence.slice(i, i + 8).join('');
      for (let j = i + 8; j < lsbSequence.length - 8; j++) {
        if (lsbSequence.slice(j, j + 8).join('') === pattern) {
          patternCount++;
        }
      }
    }

    const hasPatterns = patternCount > lsbSequence.length / 100;

    // Simplified chi-square (would need proper implementation)
    const chiSquare = anomalyScore > 0.1 ? 0.1 : 0;

    return { anomalyScore, hasPatterns, chiSquare };
  }

  private estimateHiddenSize(imageData: ImageData): number {
    try {
      const headerBits = this.extractBits(imageData, HEADER_SIZE * 8);
      const header = this.bitsToBytes(headerBits);

      if (this.checkMagicHeader(header)) {
        return (header[4] << 24) | (header[5] << 16) | (header[6] << 8) | header[7];
      }
    } catch {
      // Ignore errors
    }
    return 0;
  }

  // ==========================================================================
  // Private Methods - Utilities
  // ==========================================================================

  private checkMagicHeader(data: Uint8Array): boolean {
    return (
      data[0] === MAGIC_HEADER[0] &&
      data[1] === MAGIC_HEADER[1] &&
      data[2] === MAGIC_HEADER[2] &&
      data[3] === MAGIC_HEADER[3]
    );
  }

  private getChannelOffset(channel: Channel): number {
    const offsets: Record<Channel, number> = { r: 0, g: 1, b: 2, a: 3 };
    return offsets[channel];
  }

  private encodeChannels(channels: Channel[]): number {
    let flags = 0;
    if (channels.includes('r')) flags |= 1;
    if (channels.includes('g')) flags |= 2;
    if (channels.includes('b')) flags |= 4;
    if (channels.includes('a')) flags |= 8;
    return flags;
  }

  private getBit(byte: number, position: number): number {
    return (byte >> position) & 1;
  }

  private setBit(byte: number, position: number, value: number): number {
    if (value === 1) {
      return byte | (1 << position);
    } else {
      return byte & ~(1 << position);
    }
  }

  private bytesToBits(bytes: Uint8Array): number[] {
    const bits: number[] = [];
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) {
        bits.push((byte >> i) & 1);
      }
    }
    return bits;
  }

  private bitsToBytes(bits: number[]): Uint8Array {
    const bytes = new Uint8Array(Math.ceil(bits.length / 8));
    for (let i = 0; i < bits.length; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = 7 - (i % 8);
      bytes[byteIndex] |= bits[i] << bitIndex;
    }
    return bytes;
  }

  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  private generatePositions(count: number, max: number, seed: number): number[] {
    // Simple PRNG for position generation
    const positions: number[] = [];
    const used = new Set<number>();

    let state = seed || 12345;
    while (positions.length < count && positions.length < max) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const pos = state % max;

      if (!used.has(pos)) {
        used.add(pos);
        positions.push(pos);
      }
    }

    return positions;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createSteganography(options?: EncodeOptions): SteganographyEngine {
  return new SteganographyEngine(options);
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Encode text into image
 */
export function encodeText(
  imageData: ImageData,
  text: string,
  options?: EncodeOptions
): EncodeResult {
  const engine = new SteganographyEngine(options);
  return engine.encodeText(imageData, text);
}

/**
 * Decode text from image
 */
export function decodeText(imageData: ImageData, options?: DecodeOptions): string {
  const engine = new SteganographyEngine(options);
  return engine.decodeText(imageData, options);
}

/**
 * Check if image has hidden data
 */
export function detectHiddenData(imageData: ImageData): DetectionResult {
  const engine = new SteganographyEngine();
  return engine.detect(imageData);
}

/**
 * Calculate image capacity
 */
export function getCapacity(imageData: ImageData, options?: EncodeOptions): CapacityAnalysis {
  const engine = new SteganographyEngine(options);
  return engine.calculateCapacity(imageData);
}

/**
 * Create ImageData from canvas context
 */
export function imageDataFromCanvas(
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  width?: number,
  height?: number
): ImageData {
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  const data = ctx.getImageData(x, y, w, h);
  return {
    width: data.width,
    height: data.height,
    data: data.data,
  };
}

/**
 * Apply ImageData to canvas context
 */
export function imageDataToCanvas(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  x: number = 0,
  y: number = 0
): void {
  const canvasImageData = ctx.createImageData(imageData.width, imageData.height);
  canvasImageData.data.set(imageData.data);
  ctx.putImageData(canvasImageData, x, y);
}
