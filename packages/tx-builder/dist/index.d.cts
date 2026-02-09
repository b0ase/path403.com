/**
 * @b0ase/tx-builder
 *
 * Transaction building utilities for multi-chain transactions.
 *
 * @packageDocumentation
 */
/** UTXO type */
interface UTXO {
    txid: string;
    vout: number;
    satoshis: bigint;
    script: string;
    scriptType?: ScriptType;
    confirmations?: number;
    height?: number;
}
/** Script type */
type ScriptType = 'p2pkh' | 'p2pk' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'multisig' | 'op-return' | 'custom';
/** Transaction input */
interface TxInput {
    txid: string;
    vout: number;
    satoshis: bigint;
    script?: string;
    unlockingScript?: string;
    sequence?: number;
}
/** Transaction output */
interface TxOutput {
    satoshis: bigint;
    script: string;
    address?: string;
    data?: Uint8Array;
}
/** Transaction */
interface Transaction {
    version: number;
    inputs: TxInput[];
    outputs: TxOutput[];
    locktime: number;
    hash?: string;
    size?: number;
    fee?: bigint;
}
/** Fee rate */
interface FeeRate {
    satoshisPerByte: number;
    priority: 'low' | 'medium' | 'high';
}
/** Coin selection strategy */
type CoinSelectionStrategy = 'largest-first' | 'smallest-first' | 'oldest-first' | 'random' | 'branch-and-bound';
/** Coin selection result */
interface CoinSelectionResult {
    inputs: UTXO[];
    totalInput: bigint;
    totalOutput: bigint;
    fee: bigint;
    change: bigint;
    waste: bigint;
}
/** Build options */
interface BuildOptions {
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
interface ScriptTemplate {
    type: ScriptType;
    data: Record<string, unknown>;
}
/** Multisig config */
interface MultisigConfig {
    threshold: number;
    publicKeys: string[];
    sortedKeys?: boolean;
}
/** OP_RETURN data */
interface OpReturnData {
    protocol?: string;
    data: Uint8Array | string;
    encoding?: 'utf8' | 'hex' | 'base64';
}
declare const DEFAULT_FEE_RATE: FeeRate;
declare const DEFAULT_BUILD_OPTIONS: BuildOptions;
declare const SIGHASH_ALL = 1;
declare const SIGHASH_NONE = 2;
declare const SIGHASH_SINGLE = 3;
declare const SIGHASH_ANYONECANPAY = 128;
declare const SIGHASH_FORKID = 64;
declare class TransactionBuilder {
    private inputs;
    private outputs;
    private utxos;
    private options;
    constructor(options?: Partial<BuildOptions>);
    addInput(input: TxInput): this;
    addUTXO(utxo: UTXO): this;
    addUTXOs(utxos: UTXO[]): this;
    clearInputs(): this;
    addOutput(output: TxOutput): this;
    addP2PKHOutput(address: string, satoshis: bigint): this;
    addOpReturnOutput(data: OpReturnData): this;
    addDataOutput(data: Uint8Array | string): this;
    clearOutputs(): this;
    selectCoins(targetAmount: bigint): CoinSelectionResult;
    private sortUTXOs;
    build(): Transaction;
    estimateSize(inputCount?: number, outputCount?: number): number;
    private calculateSize;
    estimateFee(): bigint;
    private calculateFee;
    toHex(): string;
    toJSON(): object;
    reset(): this;
    static fromHex(hex: string): TransactionBuilder;
}
declare function createTransactionBuilder(options?: Partial<BuildOptions>): TransactionBuilder;
declare function createP2PKHScript(address: string): string;
declare function createP2SHScript(scriptHash: string): string;
declare function createOpReturnScript(data: OpReturnData): string;
declare function createMultisigScript(config: MultisigConfig): string;
interface DecodedAddress {
    version: number;
    hash: string;
    type: 'p2pkh' | 'p2sh';
}
declare function decodeAddress(address: string): DecodedAddress | null;
declare function encodeAddress(hash: string, type: 'p2pkh' | 'p2sh', testnet?: boolean): string;
declare function serializeTransaction(tx: Transaction): string;
declare function parseTransaction(hex: string): Transaction;
declare function calculateTxid(tx: Transaction): string;
declare function estimateVSize(inputCount: number, outputCount: number, isSegwit?: boolean): number;

export { type BuildOptions, type CoinSelectionResult, type CoinSelectionStrategy, DEFAULT_BUILD_OPTIONS, DEFAULT_FEE_RATE, type DecodedAddress, type FeeRate, type MultisigConfig, type OpReturnData, SIGHASH_ALL, SIGHASH_ANYONECANPAY, SIGHASH_FORKID, SIGHASH_NONE, SIGHASH_SINGLE, type ScriptTemplate, type ScriptType, type Transaction, TransactionBuilder, type TxInput, type TxOutput, type UTXO, calculateTxid, createMultisigScript, createOpReturnScript, createP2PKHScript, createP2SHScript, createTransactionBuilder, decodeAddress, encodeAddress, estimateVSize, parseTransaction, serializeTransaction };
