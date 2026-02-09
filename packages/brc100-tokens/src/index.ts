/**
 * @b0ase/brc100-tokens
 *
 * BRC-100 token standard implementation for programmable tokens on Bitcoin.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** BRC-100 operation type */
export type BRC100Operation =
  | 'deploy'
  | 'mint'
  | 'transfer'
  | 'burn'
  | 'inscribe'
  | 'swap'
  | 'stake'
  | 'unstake';

/** Token state */
export type TokenState = 'deploying' | 'active' | 'paused' | 'completed';

/** BRC-100 protocol identifier */
export const BRC100_PROTOCOL = 'brc-100';

/** BRC-100 token deployment */
export interface BRC100Deploy {
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
export interface BRC100Mint {
  p: typeof BRC100_PROTOCOL;
  op: 'mint';
  tick: string;
  amt: string;
}

/** BRC-100 transfer operation */
export interface BRC100Transfer {
  p: typeof BRC100_PROTOCOL;
  op: 'transfer';
  tick: string;
  amt: string;
  to?: string;
}

/** BRC-100 burn operation */
export interface BRC100Burn {
  p: typeof BRC100_PROTOCOL;
  op: 'burn';
  tick: string;
  amt: string;
}

/** Token attributes */
export interface TokenAttributes {
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
export interface BRC100Token {
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
export interface BRC100Balance {
  tick: string;
  address: string;
  available: bigint;
  transferable: bigint;
  total: bigint;
  lastUpdated: Date;
}

/** Transfer inscription */
export interface TransferInscription {
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
export interface TokenEvent {
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
export interface DeployOptions {
  tick: string;
  max: bigint;
  lim?: bigint;
  dec?: number;
  selfMint?: bigint;
  description?: string;
  icon?: string;
  attributes?: Partial<TokenAttributes>;
}

// ============================================================================
// BRC-100 Builder
// ============================================================================

export class BRC100Builder {
  /**
   * Create a deploy inscription
   */
  static deploy(options: DeployOptions): BRC100Deploy {
    const inscription: BRC100Deploy = {
      p: BRC100_PROTOCOL,
      op: 'deploy',
      tick: options.tick.toLowerCase(),
      max: options.max.toString(),
    };

    if (options.lim !== undefined) {
      inscription.lim = options.lim.toString();
    }

    if (options.dec !== undefined) {
      inscription.dec = options.dec.toString();
    }

    if (options.selfMint !== undefined && options.selfMint > BigInt(0)) {
      inscription.self = options.selfMint.toString();
    }

    if (options.description) {
      inscription.desc = options.description;
    }

    if (options.icon) {
      inscription.icon = options.icon;
    }

    if (options.attributes) {
      inscription.attr = options.attributes as TokenAttributes;
    }

    return inscription;
  }

  /**
   * Create a mint inscription
   */
  static mint(tick: string, amount: bigint): BRC100Mint {
    return {
      p: BRC100_PROTOCOL,
      op: 'mint',
      tick: tick.toLowerCase(),
      amt: amount.toString(),
    };
  }

  /**
   * Create a transfer inscription
   */
  static transfer(tick: string, amount: bigint, to?: string): BRC100Transfer {
    const inscription: BRC100Transfer = {
      p: BRC100_PROTOCOL,
      op: 'transfer',
      tick: tick.toLowerCase(),
      amt: amount.toString(),
    };

    if (to) {
      inscription.to = to;
    }

    return inscription;
  }

  /**
   * Create a burn inscription
   */
  static burn(tick: string, amount: bigint): BRC100Burn {
    return {
      p: BRC100_PROTOCOL,
      op: 'burn',
      tick: tick.toLowerCase(),
      amt: amount.toString(),
    };
  }

  /**
   * Serialize inscription to JSON
   */
  static serialize(inscription: BRC100Deploy | BRC100Mint | BRC100Transfer | BRC100Burn): string {
    return JSON.stringify(inscription);
  }

  /**
   * Parse inscription from JSON
   */
  static parse(json: string): BRC100Deploy | BRC100Mint | BRC100Transfer | BRC100Burn | null {
    try {
      const data = JSON.parse(json);
      if (data.p !== BRC100_PROTOCOL) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// BRC-100 Token Manager
// ============================================================================

export class BRC100TokenManager {
  private tokens: Map<string, BRC100Token> = new Map();
  private balances: Map<string, Map<string, BRC100Balance>> = new Map();
  private transfers: Map<string, TransferInscription> = new Map();
  private events: TokenEvent[] = [];

  /**
   * Deploy a new token
   */
  deployToken(
    inscription: BRC100Deploy,
    inscriptionId: string,
    deployer: string,
    blockHeight: number
  ): BRC100Token | null {
    const tick = inscription.tick.toLowerCase();

    // Check if token already exists
    if (this.tokens.has(tick)) {
      return null;
    }

    // Validate tick length (4-5 characters for BRC-100)
    if (tick.length < 4 || tick.length > 5) {
      return null;
    }

    const max = BigInt(inscription.max);
    const lim = inscription.lim ? BigInt(inscription.lim) : max;
    const dec = inscription.dec ? parseInt(inscription.dec) : 18;
    const selfMint = inscription.self ? BigInt(inscription.self) : BigInt(0);

    if (selfMint > max) {
      return null;
    }

    const token: BRC100Token = {
      tick,
      max,
      lim,
      dec,
      minted: selfMint,
      burned: BigInt(0),
      holders: selfMint > BigInt(0) ? 1 : 0,
      state: 'active',
      deployInscription: inscriptionId,
      deployer,
      deployHeight: blockHeight,
      selfMint,
      description: inscription.desc,
      icon: inscription.icon,
      attributes: inscription.attr || {
        mintable: true,
        burnable: true,
        transferable: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tokens.set(tick, token);

    // Handle self-mint
    if (selfMint > BigInt(0)) {
      this.updateBalance(tick, deployer, selfMint, BigInt(0));
    }

    return token;
  }

  /**
   * Mint tokens
   */
  mint(
    inscription: BRC100Mint,
    inscriptionId: string,
    minter: string,
    blockHeight: number,
    txid: string
  ): boolean {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);

    if (!token) return false;
    if (token.state !== 'active') return false;
    if (!token.attributes.mintable) return false;

    const amount = BigInt(inscription.amt);

    // Check mint limit
    if (amount > token.lim) return false;

    // Check max supply
    if (token.minted + amount > token.max) return false;

    // Update token state
    token.minted += amount;
    token.updatedAt = new Date();

    // Check if minting is complete
    if (token.minted >= token.max) {
      token.state = 'completed';
    }

    // Update balance
    this.updateBalance(tick, minter, amount, BigInt(0));

    // Record event
    this.events.push({
      type: 'mint',
      tick,
      amount,
      to: minter,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Create a transfer inscription
   */
  inscribeTransfer(
    inscription: BRC100Transfer,
    inscriptionId: string,
    owner: string
  ): TransferInscription | null {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);

    if (!token) return null;
    if (!token.attributes.transferable) return null;

    const amount = BigInt(inscription.amt);
    const balance = this.getBalance(tick, owner);

    if (!balance || balance.available < amount) return null;

    // Move from available to transferable
    balance.available -= amount;
    balance.transferable += amount;
    balance.lastUpdated = new Date();

    const transfer: TransferInscription = {
      inscriptionId,
      tick,
      amount,
      from: owner,
      to: inscription.to,
      status: 'inscribed',
      inscribedAt: new Date(),
    };

    this.transfers.set(inscriptionId, transfer);
    return transfer;
  }

  /**
   * Execute a transfer
   */
  executeTransfer(inscriptionId: string, recipient: string, txid: string, blockHeight: number): boolean {
    const transfer = this.transfers.get(inscriptionId);
    if (!transfer) return false;
    if (transfer.status !== 'inscribed') return false;

    const finalRecipient = transfer.to || recipient;

    // Update sender balance
    const senderBalance = this.getBalance(transfer.tick, transfer.from);
    if (senderBalance) {
      senderBalance.transferable -= transfer.amount;
      senderBalance.total -= transfer.amount;
      senderBalance.lastUpdated = new Date();
    }

    // Update recipient balance
    this.updateBalance(transfer.tick, finalRecipient, transfer.amount, BigInt(0));

    // Update transfer status
    transfer.status = 'transferred';
    transfer.to = finalRecipient;
    transfer.transferredAt = new Date();

    // Record event
    this.events.push({
      type: 'transfer',
      tick: transfer.tick,
      amount: transfer.amount,
      from: transfer.from,
      to: finalRecipient,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Burn tokens
   */
  burn(
    inscription: BRC100Burn,
    inscriptionId: string,
    owner: string,
    txid: string,
    blockHeight: number
  ): boolean {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);

    if (!token) return false;
    if (!token.attributes.burnable) return false;

    const amount = BigInt(inscription.amt);
    const balance = this.getBalance(tick, owner);

    if (!balance || balance.available < amount) return false;

    // Update balance
    balance.available -= amount;
    balance.total -= amount;
    balance.lastUpdated = new Date();

    // Update token state
    token.burned += amount;
    token.updatedAt = new Date();

    // Record event
    this.events.push({
      type: 'burn',
      tick,
      amount,
      from: owner,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Get token info
   */
  getToken(tick: string): BRC100Token | undefined {
    return this.tokens.get(tick.toLowerCase());
  }

  /**
   * Get all tokens
   */
  getAllTokens(): BRC100Token[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Get balance for an address
   */
  getBalance(tick: string, address: string): BRC100Balance | undefined {
    return this.balances.get(tick.toLowerCase())?.get(address);
  }

  /**
   * Get all balances for an address
   */
  getBalances(address: string): BRC100Balance[] {
    const balances: BRC100Balance[] = [];
    for (const tickBalances of this.balances.values()) {
      const balance = tickBalances.get(address);
      if (balance && balance.total > BigInt(0)) {
        balances.push(balance);
      }
    }
    return balances;
  }

  /**
   * Get token events
   */
  getEvents(tick?: string, limit?: number): TokenEvent[] {
    let events = this.events;
    if (tick) {
      events = events.filter(e => e.tick === tick.toLowerCase());
    }
    events = events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (limit) {
      events = events.slice(0, limit);
    }
    return events;
  }

  /**
   * Get transfer inscription
   */
  getTransfer(inscriptionId: string): TransferInscription | undefined {
    return this.transfers.get(inscriptionId);
  }

  /**
   * Update balance helper
   */
  private updateBalance(tick: string, address: string, available: bigint, transferable: bigint): void {
    if (!this.balances.has(tick)) {
      this.balances.set(tick, new Map());
    }

    const tickBalances = this.balances.get(tick)!;
    const existing = tickBalances.get(address);

    if (existing) {
      existing.available += available;
      existing.transferable += transferable;
      existing.total = existing.available + existing.transferable;
      existing.lastUpdated = new Date();
    } else {
      tickBalances.set(address, {
        tick,
        address,
        available,
        transferable,
        total: available + transferable,
        lastUpdated: new Date(),
      });

      // Update holder count
      const token = this.tokens.get(tick);
      if (token) {
        token.holders++;
      }
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createBRC100Manager(): BRC100TokenManager {
  return new BRC100TokenManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

export function validateTick(tick: string): { valid: boolean; error?: string } {
  if (tick.length < 4) {
    return { valid: false, error: 'Tick must be at least 4 characters' };
  }
  if (tick.length > 5) {
    return { valid: false, error: 'Tick must be at most 5 characters' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(tick)) {
    return { valid: false, error: 'Tick must be alphanumeric' };
  }
  return { valid: true };
}

export function formatBRC100Amount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  return `${whole}.${fractionStr.replace(/0+$/, '')}`;
}

export function parseBRC100Amount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function calculateMintProgress(token: BRC100Token): number {
  if (token.max === BigInt(0)) return 100;
  return Number((token.minted * BigInt(10000)) / token.max) / 100;
}

export function getCirculatingSupply(token: BRC100Token): bigint {
  return token.minted - token.burned;
}
