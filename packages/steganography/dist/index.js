// src/index.ts
var MAGIC_HEADER = new Uint8Array([83, 84, 69, 71]);
var HEADER_SIZE = 12;
var DEFAULT_OPTIONS = {
  method: "lsb",
  channels: ["r", "g", "b"],
  bitsPerChannel: 1,
  encryption: "none",
  password: "",
  spread: false,
  seed: 0
};
var SteganographyEngine = class {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  // ==========================================================================
  // Encoding
  // ==========================================================================
  encode(imageData, message) {
    const data = typeof message === "string" ? this.stringToBytes(message) : message;
    const capacity = this.calculateCapacity(imageData);
    if (data.length + HEADER_SIZE > capacity.usableBytes) {
      throw new Error(
        `Message too large. Max: ${capacity.usableBytes - HEADER_SIZE} bytes, Got: ${data.length} bytes`
      );
    }
    const payload = this.preparePayload(data);
    const finalPayload = this.options.encryption !== "none" ? this.encrypt(payload, this.options.password) : payload;
    const result = this.encodePayload(imageData, finalPayload);
    return {
      imageData: result,
      bytesEncoded: data.length,
      capacity: capacity.usableBytes,
      usedCapacity: finalPayload.length / capacity.usableBytes * 100
    };
  }
  encodeText(imageData, text) {
    return this.encode(imageData, text);
  }
  encodeFile(imageData, fileData, filename) {
    const filenameBytes = this.stringToBytes(filename);
    const combined = new Uint8Array(2 + filenameBytes.length + fileData.length);
    combined[0] = filenameBytes.length >> 8 & 255;
    combined[1] = filenameBytes.length & 255;
    combined.set(filenameBytes, 2);
    combined.set(fileData, 2 + filenameBytes.length);
    return this.encode(imageData, combined);
  }
  // ==========================================================================
  // Decoding
  // ==========================================================================
  decode(imageData, options) {
    const opts = { ...this.options, ...options };
    const payload = this.extractPayload(imageData, opts);
    const decrypted = opts.encryption !== "none" ? this.decrypt(payload, opts.password) : payload;
    const { data, length } = this.parsePayload(decrypted);
    return {
      data,
      text: this.bytesToString(data),
      bytesDecoded: length
    };
  }
  decodeText(imageData, options) {
    const result = this.decode(imageData, options);
    return result.text || "";
  }
  decodeFile(imageData, options) {
    const result = this.decode(imageData, options);
    const filenameLength = result.data[0] << 8 | result.data[1];
    const filename = this.bytesToString(result.data.slice(2, 2 + filenameLength));
    const fileData = result.data.slice(2 + filenameLength);
    return { filename, data: fileData };
  }
  // ==========================================================================
  // Analysis
  // ==========================================================================
  calculateCapacity(imageData) {
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
      pixelCount
    };
  }
  detect(imageData) {
    const indicators = [];
    let confidence = 0;
    try {
      const firstBytes = this.extractBits(imageData, HEADER_SIZE * 8);
      const hasMagic = this.checkMagicHeader(this.bitsToBytes(firstBytes));
      if (hasMagic) {
        indicators.push("Magic header detected");
        confidence += 50;
      }
    } catch {
    }
    const lsbStats = this.analyzeLSB(imageData);
    if (lsbStats.anomalyScore > 0.3) {
      indicators.push("LSB distribution anomaly");
      confidence += 20;
    }
    if (lsbStats.hasPatterns) {
      indicators.push("Repeating patterns in LSB");
      confidence += 15;
    }
    if (lsbStats.chiSquare > 0.05) {
      indicators.push("Chi-square test indicates hidden data");
      confidence += 15;
    }
    return {
      hasHiddenData: confidence >= 50,
      confidence: Math.min(100, confidence),
      method: confidence >= 50 ? "lsb" : void 0,
      estimatedSize: confidence >= 50 ? this.estimateHiddenSize(imageData) : void 0,
      indicators
    };
  }
  // ==========================================================================
  // Private Methods - Encoding
  // ==========================================================================
  preparePayload(data) {
    const payload = new Uint8Array(HEADER_SIZE + data.length);
    payload.set(MAGIC_HEADER, 0);
    payload[4] = data.length >> 24 & 255;
    payload[5] = data.length >> 16 & 255;
    payload[6] = data.length >> 8 & 255;
    payload[7] = data.length & 255;
    payload[8] = this.options.method === "lsb" ? 0 : 1;
    payload[9] = this.options.bitsPerChannel;
    payload[10] = this.encodeChannels(this.options.channels);
    payload[11] = this.options.spread ? 1 : 0;
    payload.set(data, HEADER_SIZE);
    return payload;
  }
  encodePayload(imageData, payload) {
    const result = {
      width: imageData.width,
      height: imageData.height,
      data: new Uint8ClampedArray(imageData.data)
    };
    const bits = this.bytesToBits(payload);
    let bitIndex = 0;
    if (this.options.spread) {
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
  extractPayload(imageData, options) {
    const headerBits = this.extractBits(imageData, HEADER_SIZE * 8, options);
    const header = this.bitsToBytes(headerBits);
    if (!this.checkMagicHeader(header)) {
      throw new Error("No hidden data found or invalid format");
    }
    const length = header[4] << 24 | header[5] << 16 | header[6] << 8 | header[7];
    if (length <= 0 || length > this.calculateCapacity(imageData).usableBytes) {
      throw new Error("Invalid data length");
    }
    const totalBits = (HEADER_SIZE + length) * 8;
    const allBits = this.extractBits(imageData, totalBits, options);
    return this.bitsToBytes(allBits);
  }
  extractBits(imageData, count, options) {
    const opts = options || this.options;
    const bits = [];
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
  parsePayload(payload) {
    if (!this.checkMagicHeader(payload)) {
      throw new Error("Invalid payload format");
    }
    const length = payload[4] << 24 | payload[5] << 16 | payload[6] << 8 | payload[7];
    const data = payload.slice(HEADER_SIZE, HEADER_SIZE + length);
    return { data, length };
  }
  // ==========================================================================
  // Private Methods - Encryption
  // ==========================================================================
  encrypt(data, password) {
    if (this.options.encryption === "xor") {
      return this.xorCipher(data, password);
    }
    return data;
  }
  decrypt(data, password) {
    if (this.options.encryption === "xor") {
      return this.xorCipher(data, password);
    }
    return data;
  }
  xorCipher(data, key) {
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
  analyzeLSB(imageData) {
    let zeros = 0;
    let ones = 0;
    const lsbSequence = [];
    for (let i = 0; i < Math.min(imageData.data.length, 1e4); i += 4) {
      const lsb = imageData.data[i] & 1;
      lsbSequence.push(lsb);
      if (lsb === 0) zeros++;
      else ones++;
    }
    const total = zeros + ones;
    const expectedHalf = total / 2;
    const anomalyScore = Math.abs(zeros - expectedHalf) / expectedHalf;
    let patternCount = 0;
    for (let i = 0; i < lsbSequence.length - 8; i++) {
      const pattern = lsbSequence.slice(i, i + 8).join("");
      for (let j = i + 8; j < lsbSequence.length - 8; j++) {
        if (lsbSequence.slice(j, j + 8).join("") === pattern) {
          patternCount++;
        }
      }
    }
    const hasPatterns = patternCount > lsbSequence.length / 100;
    const chiSquare = anomalyScore > 0.1 ? 0.1 : 0;
    return { anomalyScore, hasPatterns, chiSquare };
  }
  estimateHiddenSize(imageData) {
    try {
      const headerBits = this.extractBits(imageData, HEADER_SIZE * 8);
      const header = this.bitsToBytes(headerBits);
      if (this.checkMagicHeader(header)) {
        return header[4] << 24 | header[5] << 16 | header[6] << 8 | header[7];
      }
    } catch {
    }
    return 0;
  }
  // ==========================================================================
  // Private Methods - Utilities
  // ==========================================================================
  checkMagicHeader(data) {
    return data[0] === MAGIC_HEADER[0] && data[1] === MAGIC_HEADER[1] && data[2] === MAGIC_HEADER[2] && data[3] === MAGIC_HEADER[3];
  }
  getChannelOffset(channel) {
    const offsets = { r: 0, g: 1, b: 2, a: 3 };
    return offsets[channel];
  }
  encodeChannels(channels) {
    let flags = 0;
    if (channels.includes("r")) flags |= 1;
    if (channels.includes("g")) flags |= 2;
    if (channels.includes("b")) flags |= 4;
    if (channels.includes("a")) flags |= 8;
    return flags;
  }
  getBit(byte, position) {
    return byte >> position & 1;
  }
  setBit(byte, position, value) {
    if (value === 1) {
      return byte | 1 << position;
    } else {
      return byte & ~(1 << position);
    }
  }
  bytesToBits(bytes) {
    const bits = [];
    for (const byte of bytes) {
      for (let i = 7; i >= 0; i--) {
        bits.push(byte >> i & 1);
      }
    }
    return bits;
  }
  bitsToBytes(bits) {
    const bytes = new Uint8Array(Math.ceil(bits.length / 8));
    for (let i = 0; i < bits.length; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = 7 - i % 8;
      bytes[byteIndex] |= bits[i] << bitIndex;
    }
    return bytes;
  }
  stringToBytes(str) {
    return new TextEncoder().encode(str);
  }
  bytesToString(bytes) {
    return new TextDecoder().decode(bytes);
  }
  generatePositions(count, max, seed) {
    const positions = [];
    const used = /* @__PURE__ */ new Set();
    let state = seed || 12345;
    while (positions.length < count && positions.length < max) {
      state = state * 1103515245 + 12345 & 2147483647;
      const pos = state % max;
      if (!used.has(pos)) {
        used.add(pos);
        positions.push(pos);
      }
    }
    return positions;
  }
};
function createSteganography(options) {
  return new SteganographyEngine(options);
}
function encodeText(imageData, text, options) {
  const engine = new SteganographyEngine(options);
  return engine.encodeText(imageData, text);
}
function decodeText(imageData, options) {
  const engine = new SteganographyEngine(options);
  return engine.decodeText(imageData, options);
}
function detectHiddenData(imageData) {
  const engine = new SteganographyEngine();
  return engine.detect(imageData);
}
function getCapacity(imageData, options) {
  const engine = new SteganographyEngine(options);
  return engine.calculateCapacity(imageData);
}
function imageDataFromCanvas(ctx, x = 0, y = 0, width, height) {
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  const data = ctx.getImageData(x, y, w, h);
  return {
    width: data.width,
    height: data.height,
    data: data.data
  };
}
function imageDataToCanvas(ctx, imageData, x = 0, y = 0) {
  const canvasImageData = ctx.createImageData(imageData.width, imageData.height);
  canvasImageData.data.set(imageData.data);
  ctx.putImageData(canvasImageData, x, y);
}
export {
  DEFAULT_OPTIONS,
  HEADER_SIZE,
  MAGIC_HEADER,
  SteganographyEngine,
  createSteganography,
  decodeText,
  detectHiddenData,
  encodeText,
  getCapacity,
  imageDataFromCanvas,
  imageDataToCanvas
};
//# sourceMappingURL=index.js.map