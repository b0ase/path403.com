/**
 * @b0ase/blockchain-dns
 *
 * Decentralized domain resolver with blockchain-based DNS records.
 *
 * @packageDocumentation
 */
/** DNS record types */
type RecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SOA' | 'SRV' | 'CAA' | 'ALIAS' | 'BSVALIAS';
/** DNS record */
interface DNSRecord {
    type: RecordType;
    name: string;
    value: string;
    ttl: number;
    priority?: number;
    weight?: number;
    port?: number;
}
/** Domain info */
interface Domain {
    name: string;
    owner: string;
    registeredAt: number;
    expiresAt: number;
    records: DNSRecord[];
    metadata?: DomainMetadata;
    txid?: string;
}
/** Domain metadata */
interface DomainMetadata {
    title?: string;
    description?: string;
    avatar?: string;
    website?: string;
    social?: Record<string, string>;
    custom?: Record<string, string>;
}
/** Resolution result */
interface ResolutionResult {
    domain: string;
    records: DNSRecord[];
    resolved: boolean;
    source: 'blockchain' | 'cache' | 'traditional';
    ttl: number;
    timestamp: number;
}
/** Resolver options */
interface ResolverOptions {
    cacheEnabled?: boolean;
    cacheTtl?: number;
    fallbackEnabled?: boolean;
    traditionalDns?: string;
    timeout?: number;
}
/** Registration params */
interface RegisterParams {
    name: string;
    owner: string;
    years?: number;
    records?: DNSRecord[];
    metadata?: DomainMetadata;
}
/** TLD info */
interface TLD {
    name: string;
    registrationFee: number;
    renewalFee: number;
    minLength: number;
    maxLength: number;
    allowedChars: string;
    reserved: string[];
}
/** Supported blockchain TLDs */
declare const BLOCKCHAIN_TLDS: TLD[];
/** Default resolver options */
declare const DEFAULT_OPTIONS: Required<ResolverOptions>;
declare class DNSCache {
    private cache;
    private defaultTtl;
    constructor(defaultTtl?: number);
    get(key: string): ResolutionResult | null;
    set(key: string, result: ResolutionResult, ttl?: number): void;
    delete(key: string): void;
    clear(): void;
    prune(): number;
}
declare class BlockchainDNS {
    private options;
    private cache;
    private domains;
    private listeners;
    constructor(options?: ResolverOptions);
    resolve(name: string, type?: RecordType): Promise<ResolutionResult>;
    resolveIP(name: string): Promise<string | null>;
    resolveTXT(name: string): Promise<string[]>;
    resolveBSVAlias(name: string): Promise<string | null>;
    private lookupBlockchain;
    private resolveTraditional;
    register(params: RegisterParams): Promise<Domain>;
    renew(name: string, years?: number): Promise<Domain>;
    transfer(name: string, newOwner: string): Promise<Domain>;
    addRecord(name: string, record: DNSRecord): Promise<Domain>;
    removeRecord(name: string, recordType: RecordType, value?: string): Promise<Domain>;
    updateMetadata(name: string, metadata: Partial<DomainMetadata>): Promise<Domain>;
    getDomain(name: string): Domain | undefined;
    getDomainsByOwner(owner: string): Domain[];
    isAvailable(name: string): boolean;
    on(name: string, callback: (domain: Domain) => void): () => void;
    off(name: string, callback: (domain: Domain) => void): void;
    private emit;
    private normalizeName;
    private isBlockchainTld;
    private validateDomainName;
    private numericToRecordType;
    clearCache(): void;
}
declare function createBlockchainDNS(options?: ResolverOptions): BlockchainDNS;
/**
 * Parse domain into labels
 */
declare function parseDomain(domain: string): {
    labels: string[];
    tld: string;
};
/**
 * Check if domain is valid
 */
declare function isValidDomain(domain: string): boolean;
/**
 * Create A record
 */
declare function createARecord(name: string, ip: string, ttl?: number): DNSRecord;
/**
 * Create TXT record
 */
declare function createTXTRecord(name: string, text: string, ttl?: number): DNSRecord;
/**
 * Create BSVALIAS record (paymail)
 */
declare function createBSVAliasRecord(name: string, paymail: string, ttl?: number): DNSRecord;

export { BLOCKCHAIN_TLDS, BlockchainDNS, DEFAULT_OPTIONS, DNSCache, type DNSRecord, type Domain, type DomainMetadata, type RecordType, type RegisterParams, type ResolutionResult, type ResolverOptions, type TLD, createARecord, createBSVAliasRecord, createBlockchainDNS, createTXTRecord, isValidDomain, parseDomain };
