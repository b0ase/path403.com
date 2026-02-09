/**
 * @b0ase/brc100-tokens
 *
 * BRC-100 token standard implementation for programmable tokens on Bitcoin.
 *
 * @packageDocumentation
 */
/** BRC-100 operation type */
type BRC100Operation = 'deploy' | 'mint' | 'transfer' | 'burn' | 'inscribe' | 'swap' | 'stake' | 'unstake';
/** Token state */
type TokenState = 'deploying' | 'active' | 'paused' | 'completed';
/** BRC-100 protocol identifier */
declare const BRC100_PROTOCOL = "brc-100";
/** BRC-100 token deployment */
interface BRC100Deploy {
    p: typeof BRC100_PROTOCOL;
    op: 'deploy';
    tick: string;
    max: string;
    lim?: string;
    dec?: string;
    self?: string;
    desc?: string;
    icon?: string;
    attr?: TokenAttributes;
}
/** BRC-100 mint operation */
interface BRC100Mint {
    p: typeof BRC100_PROTOCOL;
    op: 'mint';
    tick: string;
    amt: string;
}
/** BRC-100 transfer operation */
interface BRC100Transfer {
    p: typeof BRC100_PROTOCOL;
    op: 'transfer';
    tick: string;
    amt: string;
    to?: string;
}
/** BRC-100 burn operation */
interface BRC100Burn {
    p: typeof BRC100_PROTOCOL;
    op: 'burn';
    tick: string;
    amt: string;
}
/** Token attributes */
interface TokenAttributes {
    mintable?: boolean;
    burnable?: boolean;
    transferable?: boolean;
    pausable?: boolean;
    upgradeable?: boolean;
    maxHolders?: number;
    minBalance?: string;
    maxBalance?: string;
    whitelistOnly?: boolean;
    blacklist?: string[];
}
/** BRC-100 token */
interface BRC100Token {
    tick: string;
    name?: string;
    max: bigint;
    lim: bigint;
    dec: number;
    minted: bigint;
    burned: bigint;
    holders: number;
    state: TokenState;
    deployInscription: string;
    deployer: string;
    deployHeight: number;
    selfMint: bigint;
    description?: string;
    icon?: string;
    attributes: TokenAttributes;
    createdAt: Date;
    updatedAt: Date;
}
/** Token balance */
interface BRC100Balance {
    tick: string;
    address: string;
    available: bigint;
    transferable: bigint;
    total: bigint;
    lastUpdated: Date;
}
/** Transfer inscription */
interface TransferInscription {
    inscriptionId: string;
    tick: string;
    amount: bigint;
    from: string;
    to?: string;
    status: 'inscribed' | 'transferred' | 'burned';
    inscribedAt: Date;
    transferredAt?: Date;
}
/** Token event */
interface TokenEvent {
    type: BRC100Operation;
    tick: string;
    amount: bigint;
    from?: string;
    to?: string;
    inscriptionId: string;
    txid: string;
    blockHeight: number;
    timestamp: Date;
}
/** Deployment options */
interface DeployOptions {
    tick: string;
    max: bigint;
    lim?: bigint;
    dec?: number;
    selfMint?: bigint;
    description?: string;
    icon?: string;
    attributes?: Partial<TokenAttributes>;
}
declare class BRC100Builder {
    /**
     * Create a deploy inscription
     */
    static deploy(options: DeployOptions): BRC100Deploy;
    /**
     * Create a mint inscription
     */
    static mint(tick: string, amount: bigint): BRC100Mint;
    /**
     * Create a transfer inscription
     */
    static transfer(tick: string, amount: bigint, to?: string): BRC100Transfer;
    /**
     * Create a burn inscription
     */
    static burn(tick: string, amount: bigint): BRC100Burn;
    /**
     * Serialize inscription to JSON
     */
    static serialize(inscription: BRC100Deploy | BRC100Mint | BRC100Transfer | BRC100Burn): string;
    /**
     * Parse inscription from JSON
     */
    static parse(json: string): BRC100Deploy | BRC100Mint | BRC100Transfer | BRC100Burn | null;
}
declare class BRC100TokenManager {
    private tokens;
    private balances;
    private transfers;
    private events;
    /**
     * Deploy a new token
     */
    deployToken(inscription: BRC100Deploy, inscriptionId: string, deployer: string, blockHeight: number): BRC100Token | null;
    /**
     * Mint tokens
     */
    mint(inscription: BRC100Mint, inscriptionId: string, minter: string, blockHeight: number, txid: string): boolean;
    /**
     * Create a transfer inscription
     */
    inscribeTransfer(inscription: BRC100Transfer, inscriptionId: string, owner: string): TransferInscription | null;
    /**
     * Execute a transfer
     */
    executeTransfer(inscriptionId: string, recipient: string, txid: string, blockHeight: number): boolean;
    /**
     * Burn tokens
     */
    burn(inscription: BRC100Burn, inscriptionId: string, owner: string, txid: string, blockHeight: number): boolean;
    /**
     * Get token info
     */
    getToken(tick: string): BRC100Token | undefined;
    /**
     * Get all tokens
     */
    getAllTokens(): BRC100Token[];
    /**
     * Get balance for an address
     */
    getBalance(tick: string, address: string): BRC100Balance | undefined;
    /**
     * Get all balances for an address
     */
    getBalances(address: string): BRC100Balance[];
    /**
     * Get token events
     */
    getEvents(tick?: string, limit?: number): TokenEvent[];
    /**
     * Get transfer inscription
     */
    getTransfer(inscriptionId: string): TransferInscription | undefined;
    /**
     * Update balance helper
     */
    private updateBalance;
}
declare function createBRC100Manager(): BRC100TokenManager;
declare function validateTick(tick: string): {
    valid: boolean;
    error?: string;
};
declare function formatBRC100Amount(amount: bigint, decimals: number): string;
declare function parseBRC100Amount(amount: string, decimals: number): bigint;
declare function calculateMintProgress(token: BRC100Token): number;
declare function getCirculatingSupply(token: BRC100Token): bigint;

export { type BRC100Balance, BRC100Builder, type BRC100Burn, type BRC100Deploy, type BRC100Mint, type BRC100Operation, type BRC100Token, BRC100TokenManager, type BRC100Transfer, BRC100_PROTOCOL, type DeployOptions, type TokenAttributes, type TokenEvent, type TokenState, type TransferInscription, calculateMintProgress, createBRC100Manager, formatBRC100Amount, getCirculatingSupply, parseBRC100Amount, validateTick };
