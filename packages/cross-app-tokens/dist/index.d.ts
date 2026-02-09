/**
 * @b0ase/cross-app-tokens
 *
 * Cross-app token recognition, portability, and verification.
 *
 * @packageDocumentation
 */
/** Token standard */
type TokenStandard = 'bsv-20' | 'bsv-21' | 'brc-20' | 'erc-20' | 'erc-721' | 'erc-1155' | 'spl' | 'metaplex' | 'ordinals' | 'custom';
/** Token type */
type TokenType = 'fungible' | 'non-fungible' | 'semi-fungible';
/** Blockchain */
type Blockchain = 'bsv' | 'bitcoin' | 'ethereum' | 'solana' | 'polygon' | 'base';
/** Verification status */
type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'trusted' | 'revoked';
/** Cross-app token */
interface CrossAppToken {
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
interface TokenIssuer {
    id: string;
    name: string;
    domain?: string;
    publicKey?: string;
    verified: boolean;
}
/** Token metadata */
interface TokenMetadata {
    description?: string;
    image?: string;
    externalUrl?: string;
    attributes?: TokenAttribute[];
    properties?: Record<string, unknown>;
}
/** Token attribute */
interface TokenAttribute {
    trait_type: string;
    value: string | number;
    display_type?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage';
}
/** Token verification */
interface TokenVerification {
    status: VerificationStatus;
    verifiedAt?: Date;
    verifiedBy?: string;
    signature?: string;
    proofUrl?: string;
    expiresAt?: Date;
}
/** App registration */
interface AppRegistration {
    appId: string;
    appName: string;
    domain: string;
    registeredAt: Date;
    permissions: AppPermission[];
    status: 'active' | 'suspended' | 'revoked';
    callbackUrl?: string;
}
/** App permission */
type AppPermission = 'read' | 'transfer' | 'burn' | 'mint' | 'metadata' | 'admin';
/** Token balance */
interface TokenBalance {
    token: CrossAppToken;
    balance: bigint;
    locked?: bigint;
    pending?: bigint;
    lastUpdated: Date;
}
/** Transfer request */
interface TransferRequest {
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
type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
/** Portable token format (for cross-app transfers) */
interface PortableToken {
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
declare class TokenRegistry {
    private tokens;
    private appTokens;
    private verificationCallbacks;
    registerToken(token: CrossAppToken): void;
    getToken(id: string): CrossAppToken | undefined;
    getTokenBySymbol(symbol: string, blockchain?: Blockchain): CrossAppToken | undefined;
    getTokenByContract(address: string, blockchain: Blockchain): CrossAppToken | undefined;
    getTokensForApp(appId: string): CrossAppToken[];
    getTokensByBlockchain(blockchain: Blockchain): CrossAppToken[];
    getVerifiedTokens(): CrossAppToken[];
    registerApp(tokenId: string, app: AppRegistration): void;
    revokeApp(tokenId: string, appId: string): void;
    setVerificationCallback(standard: TokenStandard, callback: (token: CrossAppToken) => Promise<boolean>): void;
    verifyToken(tokenId: string): Promise<boolean>;
    getAllTokens(): CrossAppToken[];
    getStats(): {
        total: number;
        byBlockchain: Record<Blockchain, number>;
        byStandard: Record<TokenStandard, number>;
        verified: number;
    };
}
declare class PortableTokenManager {
    private registry;
    constructor(registry: TokenRegistry);
    createPortableToken(tokenId: string, holderAddress: string, amount: bigint, sourceApp: string, signCallback: (message: string) => Promise<string>): Promise<PortableToken>;
    verifyPortableToken(portable: PortableToken): boolean;
    importPortableToken(portable: PortableToken, targetApp: string): CrossAppToken | null;
    private generateNonce;
    private createSignatureMessage;
    private createProof;
}
declare function createTokenRegistry(): TokenRegistry;
declare function createPortableTokenManager(registry: TokenRegistry): PortableTokenManager;
declare function createToken(input: {
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
}): CrossAppToken;
declare function getStandardForBlockchain(blockchain: Blockchain): TokenStandard[];
declare function isNFTStandard(standard: TokenStandard): boolean;
declare function isFungibleStandard(standard: TokenStandard): boolean;
declare function formatTokenAmount(amount: bigint, decimals: number): string;
declare function parseTokenAmount(amount: string, decimals: number): bigint;
declare function getBlockchainExplorer(blockchain: Blockchain): string;
declare function getTokenUrl(token: CrossAppToken): string | undefined;

export { type AppPermission, type AppRegistration, type Blockchain, type CrossAppToken, type PortableToken, PortableTokenManager, type TokenAttribute, type TokenBalance, type TokenIssuer, type TokenMetadata, TokenRegistry, type TokenStandard, type TokenType, type TokenVerification, type TransferRequest, type TransferStatus, type VerificationStatus, createPortableTokenManager, createToken, createTokenRegistry, formatTokenAmount, getBlockchainExplorer, getStandardForBlockchain, getTokenUrl, isFungibleStandard, isNFTStandard, parseTokenAmount };
