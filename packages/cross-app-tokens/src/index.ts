/**
 * @b0ase/cross-app-tokens
 *
 * Cross-app token recognition, portability, and verification.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Token standard */
export type TokenStandard =
  | 'bsv-20'
  | 'bsv-21'
  | 'brc-20'
  | 'erc-20'
  | 'erc-721'
  | 'erc-1155'
  | 'spl'
  | 'metaplex'
  | 'ordinals'
  | 'custom';

/** Token type */
export type TokenType = 'fungible' | 'non-fungible' | 'semi-fungible';

/** Blockchain */
export type Blockchain = 'bsv' | 'bitcoin' | 'ethereum' | 'solana' | 'polygon' | 'base';

/** Verification status */
export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'trusted'
  | 'revoked';

/** Cross-app token */
export interface CrossAppToken {
  id: string;
  symbol: string;
  name: string;
  standard: TokenStandard;
  type: TokenType;
  blockchain: Blockchain;
  contractAddress?: string;
  inscriptionId?: string;
  decimals: number;
  totalSupply?: bigint;
  issuer: TokenIssuer;
  metadata: TokenMetadata;
  verification: TokenVerification;
  apps: AppRegistration[];
  createdAt: Date;
  updatedAt: Date;
}

/** Token issuer */
export interface TokenIssuer {
  id: string;
  name: string;
  domain?: string;
  publicKey?: string;
  verified: boolean;
}

/** Token metadata */
export interface TokenMetadata {
  description?: string;
  image?: string;
  externalUrl?: string;
  attributes?: TokenAttribute[];
  properties?: Record<string, unknown>;
}

/** Token attribute */
export interface TokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage';
}

/** Token verification */
export interface TokenVerification {
  status: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  signature?: string;
  proofUrl?: string;
  expiresAt?: Date;
}

/** App registration */
export interface AppRegistration {
  appId: string;
  appName: string;
  domain: string;
  registeredAt: Date;
  permissions: AppPermission[];
  status: 'active' | 'suspended' | 'revoked';
  callbackUrl?: string;
}

/** App permission */
export type AppPermission =
  | 'read'
  | 'transfer'
  | 'burn'
  | 'mint'
  | 'metadata'
  | 'admin';

/** Token balance */
export interface TokenBalance {
  token: CrossAppToken;
  balance: bigint;
  locked?: bigint;
  pending?: bigint;
  lastUpdated: Date;
}

/** Transfer request */
export interface TransferRequest {
  id: string;
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  amount: bigint;
  sourceApp: string;
  targetApp?: string;
  status: TransferStatus;
  txid?: string;
  createdAt: Date;
  completedAt?: Date;
}

/** Transfer status */
export type TransferStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Portable token format (for cross-app transfers) */
export interface PortableToken {
  version: '1.0';
  token: {
    id: string;
    symbol: string;
    name: string;
    standard: TokenStandard;
    blockchain: Blockchain;
    contract?: string;
  };
  holder: {
    address: string;
    signature: string;
  };
  amount: string;
  nonce: string;
  timestamp: number;
  sourceApp: string;
  proof: string;
}

// ============================================================================
// Token Registry
// ============================================================================

export class TokenRegistry {
  private tokens: Map<string, CrossAppToken> = new Map();
  private appTokens: Map<string, Set<string>> = new Map();
  private verificationCallbacks: Map<string, (token: CrossAppToken) => Promise<boolean>> = new Map();

  registerToken(token: CrossAppToken): void {
    this.tokens.set(token.id, token);

    // Index by apps
    for (const app of token.apps) {
      if (!this.appTokens.has(app.appId)) {
        this.appTokens.set(app.appId, new Set());
      }
      this.appTokens.get(app.appId)!.add(token.id);
    }
  }

  getToken(id: string): CrossAppToken | undefined {
    return this.tokens.get(id);
  }

  getTokenBySymbol(symbol: string, blockchain?: Blockchain): CrossAppToken | undefined {
    for (const token of this.tokens.values()) {
      if (token.symbol.toLowerCase() === symbol.toLowerCase()) {
        if (!blockchain || token.blockchain === blockchain) {
          return token;
        }
      }
    }
    return undefined;
  }

  getTokenByContract(address: string, blockchain: Blockchain): CrossAppToken | undefined {
    for (const token of this.tokens.values()) {
      if (
        token.blockchain === blockchain &&
        token.contractAddress?.toLowerCase() === address.toLowerCase()
      ) {
        return token;
      }
    }
    return undefined;
  }

  getTokensForApp(appId: string): CrossAppToken[] {
    const tokenIds = this.appTokens.get(appId);
    if (!tokenIds) return [];

    return Array.from(tokenIds)
      .map(id => this.tokens.get(id))
      .filter((t): t is CrossAppToken => !!t);
  }

  getTokensByBlockchain(blockchain: Blockchain): CrossAppToken[] {
    return Array.from(this.tokens.values()).filter(t => t.blockchain === blockchain);
  }

  getVerifiedTokens(): CrossAppToken[] {
    return Array.from(this.tokens.values()).filter(
      t => t.verification.status === 'verified' || t.verification.status === 'trusted'
    );
  }

  registerApp(tokenId: string, app: AppRegistration): void {
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token not found: ${tokenId}`);
    }

    const existingIndex = token.apps.findIndex(a => a.appId === app.appId);
    if (existingIndex >= 0) {
      token.apps[existingIndex] = app;
    } else {
      token.apps.push(app);
    }

    if (!this.appTokens.has(app.appId)) {
      this.appTokens.set(app.appId, new Set());
    }
    this.appTokens.get(app.appId)!.add(tokenId);

    token.updatedAt = new Date();
  }

  revokeApp(tokenId: string, appId: string): void {
    const token = this.tokens.get(tokenId);
    if (!token) return;

    const app = token.apps.find(a => a.appId === appId);
    if (app) {
      app.status = 'revoked';
      token.updatedAt = new Date();
    }
  }

  setVerificationCallback(
    standard: TokenStandard,
    callback: (token: CrossAppToken) => Promise<boolean>
  ): void {
    this.verificationCallbacks.set(standard, callback);
  }

  async verifyToken(tokenId: string): Promise<boolean> {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    const callback = this.verificationCallbacks.get(token.standard);
    if (!callback) {
      // No custom verification, mark as pending
      token.verification.status = 'pending';
      token.updatedAt = new Date();
      return true;
    }

    try {
      const verified = await callback(token);
      token.verification.status = verified ? 'verified' : 'unverified';
      token.verification.verifiedAt = verified ? new Date() : undefined;
      token.updatedAt = new Date();
      return verified;
    } catch {
      token.verification.status = 'unverified';
      token.updatedAt = new Date();
      return false;
    }
  }

  getAllTokens(): CrossAppToken[] {
    return Array.from(this.tokens.values());
  }

  getStats(): {
    total: number;
    byBlockchain: Record<Blockchain, number>;
    byStandard: Record<TokenStandard, number>;
    verified: number;
  } {
    const tokens = this.getAllTokens();
    const byBlockchain: Record<string, number> = {};
    const byStandard: Record<string, number> = {};
    let verified = 0;

    for (const token of tokens) {
      byBlockchain[token.blockchain] = (byBlockchain[token.blockchain] || 0) + 1;
      byStandard[token.standard] = (byStandard[token.standard] || 0) + 1;
      if (token.verification.status === 'verified' || token.verification.status === 'trusted') {
        verified++;
      }
    }

    return {
      total: tokens.length,
      byBlockchain: byBlockchain as Record<Blockchain, number>,
      byStandard: byStandard as Record<TokenStandard, number>,
      verified,
    };
  }
}

// ============================================================================
// Portable Token Manager
// ============================================================================

export class PortableTokenManager {
  private registry: TokenRegistry;

  constructor(registry: TokenRegistry) {
    this.registry = registry;
  }

  createPortableToken(
    tokenId: string,
    holderAddress: string,
    amount: bigint,
    sourceApp: string,
    signCallback: (message: string) => Promise<string>
  ): Promise<PortableToken> {
    const token = this.registry.getToken(tokenId);
    if (!token) {
      throw new Error(`Token not found: ${tokenId}`);
    }

    const nonce = this.generateNonce();
    const timestamp = Date.now();
    const message = this.createSignatureMessage(token, holderAddress, amount, nonce, timestamp);

    return signCallback(message).then(signature => {
      const proof = this.createProof(token, holderAddress, amount, nonce, timestamp, signature);

      return {
        version: '1.0',
        token: {
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          standard: token.standard,
          blockchain: token.blockchain,
          contract: token.contractAddress,
        },
        holder: {
          address: holderAddress,
          signature,
        },
        amount: amount.toString(),
        nonce,
        timestamp,
        sourceApp,
        proof,
      };
    });
  }

  verifyPortableToken(portable: PortableToken): boolean {
    // Check version
    if (portable.version !== '1.0') {
      return false;
    }

    // Check timestamp (not too old - 5 minutes)
    const age = Date.now() - portable.timestamp;
    if (age > 5 * 60 * 1000) {
      return false;
    }

    // Verify token exists in registry
    const token = this.registry.getToken(portable.token.id);
    if (!token) {
      return false;
    }

    // Verify proof
    const expectedProof = this.createProof(
      token,
      portable.holder.address,
      BigInt(portable.amount),
      portable.nonce,
      portable.timestamp,
      portable.holder.signature
    );

    return expectedProof === portable.proof;
  }

  importPortableToken(portable: PortableToken, targetApp: string): CrossAppToken | null {
    if (!this.verifyPortableToken(portable)) {
      return null;
    }

    const token = this.registry.getToken(portable.token.id);
    if (!token) {
      return null;
    }

    // Check if target app is registered
    const appReg = token.apps.find(a => a.appId === targetApp);
    if (!appReg || appReg.status !== 'active') {
      // Register the app with read permission
      this.registry.registerApp(token.id, {
        appId: targetApp,
        appName: targetApp,
        domain: targetApp,
        registeredAt: new Date(),
        permissions: ['read'],
        status: 'active',
      });
    }

    return token;
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private createSignatureMessage(
    token: CrossAppToken,
    address: string,
    amount: bigint,
    nonce: string,
    timestamp: number
  ): string {
    return [
      `Cross-App Token Transfer`,
      `Token: ${token.symbol} (${token.id})`,
      `Amount: ${amount.toString()}`,
      `Holder: ${address}`,
      `Nonce: ${nonce}`,
      `Timestamp: ${timestamp}`,
    ].join('\n');
  }

  private createProof(
    token: CrossAppToken,
    address: string,
    amount: bigint,
    nonce: string,
    timestamp: number,
    signature: string
  ): string {
    // Simple proof hash (real implementation would use crypto)
    const data = `${token.id}:${address}:${amount}:${nonce}:${timestamp}:${signature}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `proof_${Math.abs(hash).toString(16)}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTokenRegistry(): TokenRegistry {
  return new TokenRegistry();
}

export function createPortableTokenManager(registry: TokenRegistry): PortableTokenManager {
  return new PortableTokenManager(registry);
}

export function createToken(input: {
  symbol: string;
  name: string;
  standard: TokenStandard;
  type: TokenType;
  blockchain: Blockchain;
  contractAddress?: string;
  inscriptionId?: string;
  decimals?: number;
  totalSupply?: bigint;
  issuer: Omit<TokenIssuer, 'verified'>;
  metadata?: Partial<TokenMetadata>;
}): CrossAppToken {
  const id = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  return {
    id,
    symbol: input.symbol,
    name: input.name,
    standard: input.standard,
    type: input.type,
    blockchain: input.blockchain,
    contractAddress: input.contractAddress,
    inscriptionId: input.inscriptionId,
    decimals: input.decimals ?? (input.type === 'fungible' ? 8 : 0),
    totalSupply: input.totalSupply,
    issuer: {
      ...input.issuer,
      verified: false,
    },
    metadata: {
      ...input.metadata,
    },
    verification: {
      status: 'unverified',
    },
    apps: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getStandardForBlockchain(blockchain: Blockchain): TokenStandard[] {
  const standards: Record<Blockchain, TokenStandard[]> = {
    bsv: ['bsv-20', 'bsv-21', 'ordinals'],
    bitcoin: ['brc-20', 'ordinals'],
    ethereum: ['erc-20', 'erc-721', 'erc-1155'],
    solana: ['spl', 'metaplex'],
    polygon: ['erc-20', 'erc-721', 'erc-1155'],
    base: ['erc-20', 'erc-721', 'erc-1155'],
  };
  return standards[blockchain] || [];
}

export function isNFTStandard(standard: TokenStandard): boolean {
  return ['erc-721', 'erc-1155', 'metaplex', 'ordinals', 'bsv-21'].includes(standard);
}

export function isFungibleStandard(standard: TokenStandard): boolean {
  return ['bsv-20', 'brc-20', 'erc-20', 'spl'].includes(standard);
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');
  return `${whole}.${trimmedFraction}`;
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function getBlockchainExplorer(blockchain: Blockchain): string {
  const explorers: Record<Blockchain, string> = {
    bsv: 'https://whatsonchain.com',
    bitcoin: 'https://mempool.space',
    ethereum: 'https://etherscan.io',
    solana: 'https://solscan.io',
    polygon: 'https://polygonscan.com',
    base: 'https://basescan.org',
  };
  return explorers[blockchain];
}

export function getTokenUrl(token: CrossAppToken): string | undefined {
  const explorer = getBlockchainExplorer(token.blockchain);

  if (token.contractAddress) {
    if (token.blockchain === 'ethereum' || token.blockchain === 'polygon' || token.blockchain === 'base') {
      return `${explorer}/token/${token.contractAddress}`;
    }
    if (token.blockchain === 'solana') {
      return `${explorer}/token/${token.contractAddress}`;
    }
  }

  if (token.inscriptionId) {
    if (token.blockchain === 'bsv') {
      return `${explorer}/tx/${token.inscriptionId}`;
    }
    if (token.blockchain === 'bitcoin') {
      return `https://ordinals.com/inscription/${token.inscriptionId}`;
    }
  }

  return undefined;
}
