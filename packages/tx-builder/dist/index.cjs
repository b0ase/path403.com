"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_BUILD_OPTIONS: () => DEFAULT_BUILD_OPTIONS,
  DEFAULT_FEE_RATE: () => DEFAULT_FEE_RATE,
  SIGHASH_ALL: () => SIGHASH_ALL,
  SIGHASH_ANYONECANPAY: () => SIGHASH_ANYONECANPAY,
  SIGHASH_FORKID: () => SIGHASH_FORKID,
  SIGHASH_NONE: () => SIGHASH_NONE,
  SIGHASH_SINGLE: () => SIGHASH_SINGLE,
  TransactionBuilder: () => TransactionBuilder,
  calculateTxid: () => calculateTxid,
  createMultisigScript: () => createMultisigScript,
  createOpReturnScript: () => createOpReturnScript,
  createP2PKHScript: () => createP2PKHScript,
  createP2SHScript: () => createP2SHScript,
  createTransactionBuilder: () => createTransactionBuilder,
  decodeAddress: () => decodeAddress,
  encodeAddress: () => encodeAddress,
  estimateVSize: () => estimateVSize,
  parseTransaction: () => parseTransaction,
  serializeTransaction: () => serializeTransaction
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_FEE_RATE = {
  satoshisPerByte: 1,
  priority: "medium"
};
var DEFAULT_BUILD_OPTIONS = {
  feeRate: DEFAULT_FEE_RATE,
  minChange: 546n,
  dustThreshold: 546n,
  coinSelection: "largest-first",
  locktime: 0,
  version: 2,
  rbf: false
};
var SIGHASH_ALL = 1;
var SIGHASH_NONE = 2;
var SIGHASH_SINGLE = 3;
var SIGHASH_ANYONECANPAY = 128;
var SIGHASH_FORKID = 64;
var TransactionBuilder = class _TransactionBuilder {
  constructor(options) {
    this.inputs = [];
    this.outputs = [];
    this.utxos = [];
    this.options = { ...DEFAULT_BUILD_OPTIONS, ...options };
  }
  // ==========================================================================
  // Input Management
  // ==========================================================================
  addInput(input) {
    this.inputs.push({
      sequence: this.options.rbf ? 4294967293 : 4294967295,
      ...input
    });
    return this;
  }
  addUTXO(utxo) {
    this.utxos.push(utxo);
    return this;
  }
  addUTXOs(utxos) {
    this.utxos.push(...utxos);
    return this;
  }
  clearInputs() {
    this.inputs = [];
    return this;
  }
  // ==========================================================================
  // Output Management
  // ==========================================================================
  addOutput(output) {
    this.outputs.push(output);
    return this;
  }
  addP2PKHOutput(address, satoshis) {
    const script = createP2PKHScript(address);
    this.outputs.push({ satoshis, script, address });
    return this;
  }
  addOpReturnOutput(data) {
    const script = createOpReturnScript(data);
    this.outputs.push({ satoshis: 0n, script });
    return this;
  }
  addDataOutput(data) {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const script = createOpReturnScript({ data: bytes });
    this.outputs.push({ satoshis: 0n, script, data: bytes });
    return this;
  }
  clearOutputs() {
    this.outputs = [];
    return this;
  }
  // ==========================================================================
  // Building
  // ==========================================================================
  selectCoins(targetAmount) {
    const strategy = this.options.coinSelection || "largest-first";
    const sortedUTXOs = this.sortUTXOs(this.utxos, strategy);
    const selected = [];
    let totalInput = 0n;
    const estimatedSize = this.estimateSize(this.inputs.length + 1, this.outputs.length + 1);
    const estimatedFee = BigInt(Math.ceil(estimatedSize * (this.options.feeRate?.satoshisPerByte || 1)));
    const requiredAmount = targetAmount + estimatedFee;
    for (const utxo of sortedUTXOs) {
      if (totalInput >= requiredAmount) break;
      selected.push(utxo);
      totalInput += utxo.satoshis;
    }
    if (totalInput < requiredAmount) {
      throw new Error(`Insufficient funds: need ${requiredAmount}, have ${totalInput}`);
    }
    const totalOutput = targetAmount;
    const fee = estimatedFee;
    const change = totalInput - totalOutput - fee;
    const waste = change < (this.options.minChange || 546n) ? change : 0n;
    return {
      inputs: selected,
      totalInput,
      totalOutput,
      fee,
      change: change >= (this.options.minChange || 546n) ? change : 0n,
      waste
    };
  }
  sortUTXOs(utxos, strategy) {
    const sorted = [...utxos];
    switch (strategy) {
      case "largest-first":
        return sorted.sort((a, b) => b.satoshis > a.satoshis ? 1 : -1);
      case "smallest-first":
        return sorted.sort((a, b) => a.satoshis > b.satoshis ? 1 : -1);
      case "oldest-first":
        return sorted.sort((a, b) => (b.confirmations || 0) - (a.confirmations || 0));
      case "random":
        return sorted.sort(() => Math.random() - 0.5);
      default:
        return sorted;
    }
  }
  build() {
    const totalOutput = this.outputs.reduce((sum, o) => sum + o.satoshis, 0n);
    if (this.utxos.length > 0 && this.inputs.length === 0) {
      const selection = this.selectCoins(totalOutput);
      for (const utxo of selection.inputs) {
        this.addInput({
          txid: utxo.txid,
          vout: utxo.vout,
          satoshis: utxo.satoshis,
          script: utxo.script
        });
      }
      if (selection.change > 0n && this.options.changeAddress) {
        this.addP2PKHOutput(this.options.changeAddress, selection.change);
      }
    }
    const tx = {
      version: this.options.version || 2,
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      locktime: this.options.locktime || 0
    };
    tx.size = this.calculateSize(tx);
    tx.fee = this.calculateFee(tx);
    return tx;
  }
  // ==========================================================================
  // Estimation
  // ==========================================================================
  estimateSize(inputCount, outputCount) {
    const numInputs = inputCount ?? this.inputs.length;
    const numOutputs = outputCount ?? this.outputs.length;
    let size = 10;
    size += numInputs * 148;
    size += numOutputs * 34;
    return size;
  }
  calculateSize(tx) {
    let size = 10;
    size += tx.inputs.length * 148;
    size += tx.outputs.reduce((sum, o) => {
      return sum + 8 + 1 + o.script.length / 2;
    }, 0);
    return size;
  }
  estimateFee() {
    const size = this.estimateSize();
    return BigInt(Math.ceil(size * (this.options.feeRate?.satoshisPerByte || 1)));
  }
  calculateFee(tx) {
    const size = tx.size || this.calculateSize(tx);
    return BigInt(Math.ceil(size * (this.options.feeRate?.satoshisPerByte || 1)));
  }
  // ==========================================================================
  // Serialization
  // ==========================================================================
  toHex() {
    const tx = this.build();
    return serializeTransaction(tx);
  }
  toJSON() {
    return this.build();
  }
  // ==========================================================================
  // Reset
  // ==========================================================================
  reset() {
    this.inputs = [];
    this.outputs = [];
    this.utxos = [];
    return this;
  }
  // ==========================================================================
  // Static Helpers
  // ==========================================================================
  static fromHex(hex) {
    const tx = parseTransaction(hex);
    const builder = new _TransactionBuilder();
    builder.inputs = tx.inputs;
    builder.outputs = tx.outputs;
    return builder;
  }
};
function createTransactionBuilder(options) {
  return new TransactionBuilder(options);
}
function createP2PKHScript(address) {
  const decoded = decodeAddress(address);
  if (!decoded) throw new Error("Invalid address");
  return `76a914${decoded.hash}88ac`;
}
function createP2SHScript(scriptHash) {
  return `a914${scriptHash}87`;
}
function createOpReturnScript(data) {
  let bytes;
  if (typeof data.data === "string") {
    switch (data.encoding) {
      case "hex":
        bytes = hexToBytes(data.data);
        break;
      case "base64":
        bytes = base64ToBytes(data.data);
        break;
      default:
        bytes = new TextEncoder().encode(data.data);
    }
  } else {
    bytes = data.data;
  }
  const pushData = createPushData(bytes);
  const protocolPush = data.protocol ? createPushData(new TextEncoder().encode(data.protocol)) : "";
  return `006a${protocolPush}${pushData}`;
}
function createMultisigScript(config) {
  const { threshold, publicKeys, sortedKeys } = config;
  if (threshold > publicKeys.length) {
    throw new Error("Threshold cannot exceed number of public keys");
  }
  const keys = sortedKeys ? [...publicKeys].sort() : publicKeys;
  const m = threshold + 80;
  const n = keys.length + 80;
  let script = m.toString(16).padStart(2, "0");
  for (const key of keys) {
    script += createPushData(hexToBytes(key));
  }
  script += n.toString(16).padStart(2, "0");
  script += "ae";
  return script;
}
function createPushData(data) {
  const len = data.length;
  let prefix;
  if (len <= 75) {
    prefix = len.toString(16).padStart(2, "0");
  } else if (len <= 255) {
    prefix = "4c" + len.toString(16).padStart(2, "0");
  } else if (len <= 65535) {
    prefix = "4d" + len.toString(16).padStart(4, "0");
  } else {
    prefix = "4e" + len.toString(16).padStart(8, "0");
  }
  return prefix + bytesToHex(data);
}
function decodeAddress(address) {
  try {
    const decoded = base58Decode(address);
    if (!decoded || decoded.length !== 25) return null;
    const version = decoded[0];
    const hash = bytesToHex(decoded.slice(1, 21));
    const checksum = decoded.slice(21);
    const payload = decoded.slice(0, 21);
    const expectedChecksum = doubleSha256(payload).slice(0, 4);
    for (let i = 0; i < 4; i++) {
      if (checksum[i] !== expectedChecksum[i]) return null;
    }
    const type = version === 0 || version === 111 ? "p2pkh" : "p2sh";
    return { version, hash, type };
  } catch {
    return null;
  }
}
function encodeAddress(hash, type, testnet = false) {
  const version = type === "p2pkh" ? testnet ? 111 : 0 : testnet ? 196 : 5;
  const payload = new Uint8Array(21);
  payload[0] = version;
  payload.set(hexToBytes(hash), 1);
  const checksum = doubleSha256(payload).slice(0, 4);
  const full = new Uint8Array(25);
  full.set(payload);
  full.set(checksum, 21);
  return base58Encode(full);
}
function serializeTransaction(tx) {
  let hex = "";
  hex += int32ToHex(tx.version);
  hex += varIntToHex(tx.inputs.length);
  for (const input of tx.inputs) {
    hex += reverseHex(input.txid);
    hex += int32ToHex(input.vout);
    const script = input.unlockingScript || "";
    hex += varIntToHex(script.length / 2);
    hex += script;
    hex += int32ToHex(input.sequence ?? 4294967295);
  }
  hex += varIntToHex(tx.outputs.length);
  for (const output of tx.outputs) {
    hex += int64ToHex(output.satoshis);
    hex += varIntToHex(output.script.length / 2);
    hex += output.script;
  }
  hex += int32ToHex(tx.locktime);
  return hex;
}
function parseTransaction(hex) {
  let offset = 0;
  const readBytes = (count) => {
    const result = hex.slice(offset, offset + count * 2);
    offset += count * 2;
    return result;
  };
  const readInt32 = () => {
    const bytes = readBytes(4);
    return hexToInt32(bytes);
  };
  const readInt64 = () => {
    const bytes = readBytes(8);
    return hexToInt64(bytes);
  };
  const readVarInt = () => {
    const first = parseInt(readBytes(1), 16);
    if (first < 253) return first;
    if (first === 253) return parseInt(reverseHex(readBytes(2)), 16);
    if (first === 254) return parseInt(reverseHex(readBytes(4)), 16);
    return parseInt(reverseHex(readBytes(8)), 16);
  };
  const version = readInt32();
  const inputCount = readVarInt();
  const inputs = [];
  for (let i = 0; i < inputCount; i++) {
    const txid = reverseHex(readBytes(32));
    const vout = readInt32();
    const scriptLen = readVarInt();
    const unlockingScript = readBytes(scriptLen);
    const sequence = readInt32();
    inputs.push({
      txid,
      vout,
      satoshis: 0n,
      // Not in raw tx
      unlockingScript,
      sequence
    });
  }
  const outputCount = readVarInt();
  const outputs = [];
  for (let i = 0; i < outputCount; i++) {
    const satoshis = readInt64();
    const scriptLen = readVarInt();
    const script = readBytes(scriptLen);
    outputs.push({ satoshis, script });
  }
  const locktime = readInt32();
  return { version, inputs, outputs, locktime };
}
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function reverseHex(hex) {
  const bytes = hex.match(/.{2}/g) || [];
  return bytes.reverse().join("");
}
function int32ToHex(n) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, n, true);
  return bytesToHex(new Uint8Array(buf));
}
function int64ToHex(n) {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, n, true);
  return bytesToHex(new Uint8Array(buf));
}
function hexToInt32(hex) {
  const bytes = hexToBytes(hex);
  return new DataView(bytes.buffer).getUint32(0, true);
}
function hexToInt64(hex) {
  const bytes = hexToBytes(hex);
  return new DataView(bytes.buffer).getBigUint64(0, true);
}
function varIntToHex(n) {
  if (n < 253) {
    return n.toString(16).padStart(2, "0");
  } else if (n <= 65535) {
    return "fd" + reverseHex(n.toString(16).padStart(4, "0"));
  } else if (n <= 4294967295) {
    return "fe" + reverseHex(n.toString(16).padStart(8, "0"));
  } else {
    return "ff" + reverseHex(n.toString(16).padStart(16, "0"));
  }
}
var BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Decode(str) {
  let num = 0n;
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) return null;
    num = num * 58n + BigInt(index);
  }
  const hex = num.toString(16).padStart(50, "0");
  const bytes = hexToBytes(hex);
  let leadingZeros = 0;
  for (const char of str) {
    if (char !== "1") break;
    leadingZeros++;
  }
  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}
function base58Encode(bytes) {
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }
  let result = "";
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = BASE58_ALPHABET[remainder] + result;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = "1" + result;
  }
  return result;
}
function doubleSha256(data) {
  return new Uint8Array(32);
}
function calculateTxid(tx) {
  const hex = serializeTransaction(tx);
  const bytes = hexToBytes(hex);
  const hash = doubleSha256(bytes);
  return reverseHex(bytesToHex(hash));
}
function estimateVSize(inputCount, outputCount, isSegwit = false) {
  if (!isSegwit) {
    return 10 + inputCount * 148 + outputCount * 34;
  }
  const baseSize = 10 + inputCount * 41 + outputCount * 34;
  const witnessSize = inputCount * 107;
  return Math.ceil((baseSize * 3 + baseSize + witnessSize) / 4);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_BUILD_OPTIONS,
  DEFAULT_FEE_RATE,
  SIGHASH_ALL,
  SIGHASH_ANYONECANPAY,
  SIGHASH_FORKID,
  SIGHASH_NONE,
  SIGHASH_SINGLE,
  TransactionBuilder,
  calculateTxid,
  createMultisigScript,
  createOpReturnScript,
  createP2PKHScript,
  createP2SHScript,
  createTransactionBuilder,
  decodeAddress,
  encodeAddress,
  estimateVSize,
  parseTransaction,
  serializeTransaction
});
//# sourceMappingURL=index.cjs.map