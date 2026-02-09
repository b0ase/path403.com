/**
 * @b0ase/tx-builder
 *
 * Transaction building utilities for multi-chain transactions.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** UTXO type */
export interface UTXO {
  txid: string;
  vout: number;
  satoshis: bigint;
  script: string;
  scriptType?: ScriptType;
  confirmations?: number;
  height?: number;
}

/** Script type */
export type ScriptType =
  | 'p2pkh'
  | 'p2pk'
  | 'p2sh'
  | 'p2wpkh'
  | 'p2wsh'
  | 'p2tr'
  | 'multisig'
  | 'op-return'
  | 'custom';

/** Transaction input */
export interface TxInput {
  txid: string;
  vout: number;
  satoshis: bigint;
  script?: string;
  unlockingScript?: string;
  sequence?: number;
}

/** Transaction output */
export interface TxOutput {
  satoshis: bigint;
  script: string;
  address?: string;
  data?: Uint8Array;
}

/** Transaction */
export interface Transaction {
  version: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  locktime: number;
  hash?: string;
  size?: number;
  fee?: bigint;
}

/** Fee rate */
export interface FeeRate {
  satoshisPerByte: number;
  priority: 'low' | 'medium' | 'high';
}

/** Coin selection strategy */
export type CoinSelectionStrategy =
  | 'largest-first'
  | 'smallest-first'
  | 'oldest-first'
  | 'random'
  | 'branch-and-bound';

/** Coin selection result */
export interface CoinSelectionResult {
  inputs: UTXO[];
  totalInput: bigint;
  totalOutput: bigint;
  fee: bigint;
  change: bigint;
  waste: bigint;
}

/** Build options */
export interface BuildOptions {
  feeRate?: FeeRate;
  changeAddress?: string;
  minChange?: bigint;
  dustThreshold?: bigint;
  coinSelection?: CoinSelectionStrategy;
  locktime?: number;
  version?: number;
  rbf?: boolean;
}

/** Script template */
export interface ScriptTemplate {
  type: ScriptType;
  data: Record<string, unknown>;
}

/** Multisig config */
export interface MultisigConfig {
  threshold: number;
  publicKeys: string[];
  sortedKeys?: boolean;
}

/** OP_RETURN data */
export interface OpReturnData {
  protocol?: string;
  data: Uint8Array | string;
  encoding?: 'utf8' | 'hex' | 'base64';
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_FEE_RATE: FeeRate = {
  satoshisPerByte: 1,
  priority: 'medium',
};

export const DEFAULT_BUILD_OPTIONS: BuildOptions = {
  feeRate: DEFAULT_FEE_RATE,
  minChange: 546n,
  dustThreshold: 546n,
  coinSelection: 'largest-first',
  locktime: 0,
  version: 2,
  rbf: false,
};

export const SIGHASH_ALL = 0x01;
export const SIGHASH_NONE = 0x02;
export const SIGHASH_SINGLE = 0x03;
export const SIGHASH_ANYONECANPAY = 0x80;
export const SIGHASH_FORKID = 0x40;

// ============================================================================
// Transaction Builder
// ============================================================================

export class TransactionBuilder {
  private inputs: TxInput[] = [];
  private outputs: TxOutput[] = [];
  private utxos: UTXO[] = [];
  private options: BuildOptions;

  constructor(options?: Partial<BuildOptions>) {
    this.options = { ...DEFAULT_BUILD_OPTIONS, ...options };
  }

  // ==========================================================================
  // Input Management
  // ==========================================================================

  addInput(input: TxInput): this {
    this.inputs.push({
      sequence: this.options.rbf ? 0xfffffffd : 0xffffffff,
      ...input,
    });
    return this;
  }

  addUTXO(utxo: UTXO): this {
    this.utxos.push(utxo);
    return this;
  }

  addUTXOs(utxos: UTXO[]): this {
    this.utxos.push(...utxos);
    return this;
  }

  clearInputs(): this {
    this.inputs = [];
    return this;
  }

  // ==========================================================================
  // Output Management
  // ==========================================================================

  addOutput(output: TxOutput): this {
    this.outputs.push(output);
    return this;
  }

  addP2PKHOutput(address: string, satoshis: bigint): this {
    const script = createP2PKHScript(address);
    this.outputs.push({ satoshis, script, address });
    return this;
  }

  addOpReturnOutput(data: OpReturnData): this {
    const script = createOpReturnScript(data);
    this.outputs.push({ satoshis: 0n, script });
    return this;
  }

  addDataOutput(data: Uint8Array | string): this {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const script = createOpReturnScript({ data: bytes });
    this.outputs.push({ satoshis: 0n, script, data: bytes });
    return this;
  }

  clearOutputs(): this {
    this.outputs = [];
    return this;
  }

  // ==========================================================================
  // Building
  // ==========================================================================

  selectCoins(targetAmount: bigint): CoinSelectionResult {
    const strategy = this.options.coinSelection || 'largest-first';
    const sortedUTXOs = this.sortUTXOs(this.utxos, strategy);

    const selected: UTXO[] = [];
    let totalInput = 0n;

    // Estimate fee
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
      waste,
    };
  }

  private sortUTXOs(utxos: UTXO[], strategy: CoinSelectionStrategy): UTXO[] {
    const sorted = [...utxos];

    switch (strategy) {
      case 'largest-first':
        return sorted.sort((a, b) => (b.satoshis > a.satoshis ? 1 : -1));
      case 'smallest-first':
        return sorted.sort((a, b) => (a.satoshis > b.satoshis ? 1 : -1));
      case 'oldest-first':
        return sorted.sort((a, b) => (b.confirmations || 0) - (a.confirmations || 0));
      case 'random':
        return sorted.sort(() => Math.random() - 0.5);
      default:
        return sorted;
    }
  }

  build(): Transaction {
    // Calculate total output
    const totalOutput = this.outputs.reduce((sum, o) => sum + o.satoshis, 0n);

    // Select coins if we have UTXOs
    if (this.utxos.length > 0 && this.inputs.length === 0) {
      const selection = this.selectCoins(totalOutput);

      // Add selected UTXOs as inputs
      for (const utxo of selection.inputs) {
        this.addInput({
          txid: utxo.txid,
          vout: utxo.vout,
          satoshis: utxo.satoshis,
          script: utxo.script,
        });
      }

      // Add change output if needed
      if (selection.change > 0n && this.options.changeAddress) {
        this.addP2PKHOutput(this.options.changeAddress, selection.change);
      }
    }

    const tx: Transaction = {
      version: this.options.version || 2,
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      locktime: this.options.locktime || 0,
    };

    // Calculate size and fee
    tx.size = this.calculateSize(tx);
    tx.fee = this.calculateFee(tx);

    return tx;
  }

  // ==========================================================================
  // Estimation
  // ==========================================================================

  estimateSize(inputCount?: number, outputCount?: number): number {
    const numInputs = inputCount ?? this.inputs.length;
    const numOutputs = outputCount ?? this.outputs.length;

    // Base transaction overhead
    let size = 10; // version (4) + locktime (4) + varint overhead (~2)

    // Inputs: ~148 bytes each for P2PKH
    size += numInputs * 148;

    // Outputs: ~34 bytes each for P2PKH
    size += numOutputs * 34;

    return size;
  }

  private calculateSize(tx: Transaction): number {
    let size = 10;
    size += tx.inputs.length * 148;
    size += tx.outputs.reduce((sum, o) => {
      return sum + 8 + 1 + (o.script.length / 2);
    }, 0);
    return size;
  }

  estimateFee(): bigint {
    const size = this.estimateSize();
    return BigInt(Math.ceil(size * (this.options.feeRate?.satoshisPerByte || 1)));
  }

  private calculateFee(tx: Transaction): bigint {
    const size = tx.size || this.calculateSize(tx);
    return BigInt(Math.ceil(size * (this.options.feeRate?.satoshisPerByte || 1)));
  }

  // ==========================================================================
  // Serialization
  // ==========================================================================

  toHex(): string {
    const tx = this.build();
    return serializeTransaction(tx);
  }

  toJSON(): object {
    return this.build();
  }

  // ==========================================================================
  // Reset
  // ==========================================================================

  reset(): this {
    this.inputs = [];
    this.outputs = [];
    this.utxos = [];
    return this;
  }

  // ==========================================================================
  // Static Helpers
  // ==========================================================================

  static fromHex(hex: string): TransactionBuilder {
    const tx = parseTransaction(hex);
    const builder = new TransactionBuilder();
    builder.inputs = tx.inputs;
    builder.outputs = tx.outputs;
    return builder;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTransactionBuilder(options?: Partial<BuildOptions>): TransactionBuilder {
  return new TransactionBuilder(options);
}

// ============================================================================
// Script Utilities
// ============================================================================

export function createP2PKHScript(address: string): string {
  // Decode address to get pubkey hash
  const decoded = decodeAddress(address);
  if (!decoded) throw new Error('Invalid address');

  // OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
  return `76a914${decoded.hash}88ac`;
}

export function createP2SHScript(scriptHash: string): string {
  // OP_HASH160 <20 bytes> OP_EQUAL
  return `a914${scriptHash}87`;
}

export function createOpReturnScript(data: OpReturnData): string {
  let bytes: Uint8Array;

  if (typeof data.data === 'string') {
    switch (data.encoding) {
      case 'hex':
        bytes = hexToBytes(data.data);
        break;
      case 'base64':
        bytes = base64ToBytes(data.data);
        break;
      default:
        bytes = new TextEncoder().encode(data.data);
    }
  } else {
    bytes = data.data;
  }

  const pushData = createPushData(bytes);
  const protocolPush = data.protocol
    ? createPushData(new TextEncoder().encode(data.protocol))
    : '';

  // OP_FALSE OP_RETURN [protocol] <data>
  return `006a${protocolPush}${pushData}`;
}

export function createMultisigScript(config: MultisigConfig): string {
  const { threshold, publicKeys, sortedKeys } = config;

  if (threshold > publicKeys.length) {
    throw new Error('Threshold cannot exceed number of public keys');
  }

  const keys = sortedKeys ? [...publicKeys].sort() : publicKeys;
  const m = threshold + 0x50; // OP_1 = 0x51, OP_2 = 0x52, etc.
  const n = keys.length + 0x50;

  let script = m.toString(16).padStart(2, '0');

  for (const key of keys) {
    script += createPushData(hexToBytes(key));
  }

  script += n.toString(16).padStart(2, '0');
  script += 'ae'; // OP_CHECKMULTISIG

  return script;
}

function createPushData(data: Uint8Array): string {
  const len = data.length;
  let prefix: string;

  if (len <= 75) {
    prefix = len.toString(16).padStart(2, '0');
  } else if (len <= 255) {
    prefix = '4c' + len.toString(16).padStart(2, '0');
  } else if (len <= 65535) {
    prefix = '4d' + len.toString(16).padStart(4, '0');
  } else {
    prefix = '4e' + len.toString(16).padStart(8, '0');
  }

  return prefix + bytesToHex(data);
}

// ============================================================================
// Address Utilities
// ============================================================================

export interface DecodedAddress {
  version: number;
  hash: string;
  type: 'p2pkh' | 'p2sh';
}

export function decodeAddress(address: string): DecodedAddress | null {
  try {
    const decoded = base58Decode(address);
    if (!decoded || decoded.length !== 25) return null;

    const version = decoded[0];
    const hash = bytesToHex(decoded.slice(1, 21));
    const checksum = decoded.slice(21);

    // Verify checksum
    const payload = decoded.slice(0, 21);
    const expectedChecksum = doubleSha256(payload).slice(0, 4);

    for (let i = 0; i < 4; i++) {
      if (checksum[i] !== expectedChecksum[i]) return null;
    }

    // Determine type based on version byte
    const type = version === 0x00 || version === 0x6f ? 'p2pkh' : 'p2sh';

    return { version, hash, type };
  } catch {
    return null;
  }
}

export function encodeAddress(hash: string, type: 'p2pkh' | 'p2sh', testnet: boolean = false): string {
  const version = type === 'p2pkh'
    ? (testnet ? 0x6f : 0x00)
    : (testnet ? 0xc4 : 0x05);

  const payload = new Uint8Array(21);
  payload[0] = version;
  payload.set(hexToBytes(hash), 1);

  const checksum = doubleSha256(payload).slice(0, 4);
  const full = new Uint8Array(25);
  full.set(payload);
  full.set(checksum, 21);

  return base58Encode(full);
}

// ============================================================================
// Serialization
// ============================================================================

export function serializeTransaction(tx: Transaction): string {
  let hex = '';

  // Version (4 bytes, little endian)
  hex += int32ToHex(tx.version);

  // Input count
  hex += varIntToHex(tx.inputs.length);

  // Inputs
  for (const input of tx.inputs) {
    hex += reverseHex(input.txid);
    hex += int32ToHex(input.vout);
    const script = input.unlockingScript || '';
    hex += varIntToHex(script.length / 2);
    hex += script;
    hex += int32ToHex(input.sequence ?? 0xffffffff);
  }

  // Output count
  hex += varIntToHex(tx.outputs.length);

  // Outputs
  for (const output of tx.outputs) {
    hex += int64ToHex(output.satoshis);
    hex += varIntToHex(output.script.length / 2);
    hex += output.script;
  }

  // Locktime (4 bytes, little endian)
  hex += int32ToHex(tx.locktime);

  return hex;
}

export function parseTransaction(hex: string): Transaction {
  let offset = 0;

  const readBytes = (count: number): string => {
    const result = hex.slice(offset, offset + count * 2);
    offset += count * 2;
    return result;
  };

  const readInt32 = (): number => {
    const bytes = readBytes(4);
    return hexToInt32(bytes);
  };

  const readInt64 = (): bigint => {
    const bytes = readBytes(8);
    return hexToInt64(bytes);
  };

  const readVarInt = (): number => {
    const first = parseInt(readBytes(1), 16);
    if (first < 0xfd) return first;
    if (first === 0xfd) return parseInt(reverseHex(readBytes(2)), 16);
    if (first === 0xfe) return parseInt(reverseHex(readBytes(4)), 16);
    return parseInt(reverseHex(readBytes(8)), 16);
  };

  const version = readInt32();

  const inputCount = readVarInt();
  const inputs: TxInput[] = [];

  for (let i = 0; i < inputCount; i++) {
    const txid = reverseHex(readBytes(32));
    const vout = readInt32();
    const scriptLen = readVarInt();
    const unlockingScript = readBytes(scriptLen);
    const sequence = readInt32();

    inputs.push({
      txid,
      vout,
      satoshis: 0n, // Not in raw tx
      unlockingScript,
      sequence,
    });
  }

  const outputCount = readVarInt();
  const outputs: TxOutput[] = [];

  for (let i = 0; i < outputCount; i++) {
    const satoshis = readInt64();
    const scriptLen = readVarInt();
    const script = readBytes(scriptLen);

    outputs.push({ satoshis, script });
  }

  const locktime = readInt32();

  return { version, inputs, outputs, locktime };
}

// ============================================================================
// Utility Functions
// ============================================================================

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

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g) || [];
  return bytes.reverse().join('');
}

function int32ToHex(n: number): string {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, n, true);
  return bytesToHex(new Uint8Array(buf));
}

function int64ToHex(n: bigint): string {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, n, true);
  return bytesToHex(new Uint8Array(buf));
}

function hexToInt32(hex: string): number {
  const bytes = hexToBytes(hex);
  return new DataView(bytes.buffer).getUint32(0, true);
}

function hexToInt64(hex: string): bigint {
  const bytes = hexToBytes(hex);
  return new DataView(bytes.buffer).getBigUint64(0, true);
}

function varIntToHex(n: number): string {
  if (n < 0xfd) {
    return n.toString(16).padStart(2, '0');
  } else if (n <= 0xffff) {
    return 'fd' + reverseHex(n.toString(16).padStart(4, '0'));
  } else if (n <= 0xffffffff) {
    return 'fe' + reverseHex(n.toString(16).padStart(8, '0'));
  } else {
    return 'ff' + reverseHex(n.toString(16).padStart(16, '0'));
  }
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str: string): Uint8Array | null {
  let num = 0n;
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) return null;
    num = num * 58n + BigInt(index);
  }

  const hex = num.toString(16).padStart(50, '0');
  const bytes = hexToBytes(hex);

  // Count leading zeros
  let leadingZeros = 0;
  for (const char of str) {
    if (char !== '1') break;
    leadingZeros++;
  }

  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}

function base58Encode(bytes: Uint8Array): string {
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }

  let result = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = BASE58_ALPHABET[remainder] + result;
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }

  return result;
}

function doubleSha256(data: Uint8Array): Uint8Array {
  // Placeholder - in real implementation would use crypto
  // For now return zeros (this would need a real SHA256 implementation)
  return new Uint8Array(32);
}

export function calculateTxid(tx: Transaction): string {
  const hex = serializeTransaction(tx);
  const bytes = hexToBytes(hex);
  const hash = doubleSha256(bytes);
  return reverseHex(bytesToHex(hash));
}

export function estimateVSize(inputCount: number, outputCount: number, isSegwit: boolean = false): number {
  if (!isSegwit) {
    return 10 + inputCount * 148 + outputCount * 34;
  }
  // SegWit: witness data is discounted
  const baseSize = 10 + inputCount * 41 + outputCount * 34;
  const witnessSize = inputCount * 107;
  return Math.ceil((baseSize * 3 + baseSize + witnessSize) / 4);
}
