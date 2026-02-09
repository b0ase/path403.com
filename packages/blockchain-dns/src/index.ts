/**
 * @b0ase/blockchain-dns
 *
 * Decentralized domain resolver with blockchain-based DNS records.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** DNS record types */
export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SOA' | 'SRV' | 'CAA' | 'ALIAS' | 'BSVALIAS';

/** DNS record */
export interface DNSRecord {
  type: RecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
}

/** Domain info */
export interface Domain {
  name: string;
  owner: string;
  registeredAt: number;
  expiresAt: number;
  records: DNSRecord[];
  metadata?: DomainMetadata;
  txid?: string;
}

/** Domain metadata */
export interface DomainMetadata {
  title?: string;
  description?: string;
  avatar?: string;
  website?: string;
  social?: Record<string, string>;
  custom?: Record<string, string>;
}

/** Resolution result */
export interface ResolutionResult {
  domain: string;
  records: DNSRecord[];
  resolved: boolean;
  source: 'blockchain' | 'cache' | 'traditional';
  ttl: number;
  timestamp: number;
}

/** Resolver options */
export interface ResolverOptions {
  cacheEnabled?: boolean;
  cacheTtl?: number;
  fallbackEnabled?: boolean;
  traditionalDns?: string;
  timeout?: number;
}

/** Registration params */
export interface RegisterParams {
  name: string;
  owner: string;
  years?: number;
  records?: DNSRecord[];
  metadata?: DomainMetadata;
}

/** TLD info */
export interface TLD {
  name: string;
  registrationFee: number;
  renewalFee: number;
  minLength: number;
  maxLength: number;
  allowedChars: string;
  reserved: string[];
}

// ============================================================================
// Constants
// ============================================================================

/** Supported blockchain TLDs */
export const BLOCKCHAIN_TLDS: TLD[] = [
  {
    name: '.bit',
    registrationFee: 10000, // satoshis
    renewalFee: 5000,
    minLength: 3,
    maxLength: 63,
    allowedChars: 'a-z0-9-',
    reserved: ['www', 'mail', 'ftp', 'api'],
  },
  {
    name: '.bsv',
    registrationFee: 50000,
    renewalFee: 25000,
    minLength: 3,
    maxLength: 63,
    allowedChars: 'a-z0-9-',
    reserved: ['satoshi', 'bitcoin', 'bsv'],
  },
  {
    name: '.sats',
    registrationFee: 21000,
    renewalFee: 10000,
    minLength: 1,
    maxLength: 63,
    allowedChars: 'a-z0-9-',
    reserved: [],
  },
];

/** Default resolver options */
export const DEFAULT_OPTIONS: Required<ResolverOptions> = {
  cacheEnabled: true,
  cacheTtl: 3600000, // 1 hour
  fallbackEnabled: true,
  traditionalDns: '8.8.8.8',
  timeout: 10000,
};

// ============================================================================
// DNS Cache
// ============================================================================

interface CacheEntry {
  result: ResolutionResult;
  expiresAt: number;
}

export class DNSCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTtl: number;

  constructor(defaultTtl: number = 3600000) {
    this.defaultTtl = defaultTtl;
  }

  get(key: string): ResolutionResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(key: string, result: ResolutionResult, ttl?: number): void {
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + (ttl || this.defaultTtl),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

// ============================================================================
// Blockchain DNS Resolver
// ============================================================================

export class BlockchainDNS {
  private options: Required<ResolverOptions>;
  private cache: DNSCache;
  private domains: Map<string, Domain> = new Map();
  private listeners: Map<string, Set<(domain: Domain) => void>> = new Map();

  constructor(options: ResolverOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cache = new DNSCache(this.options.cacheTtl);
  }

  // ==========================================================================
  // Resolution
  // ==========================================================================

  async resolve(name: string, type?: RecordType): Promise<ResolutionResult> {
    const normalizedName = this.normalizeName(name);
    const cacheKey = `${normalizedName}:${type || 'ALL'}`;

    // Check cache
    if (this.options.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, source: 'cache' };
      }
    }

    // Try blockchain resolution
    const domain = await this.lookupBlockchain(normalizedName);

    if (domain) {
      const records = type
        ? domain.records.filter((r) => r.type === type)
        : domain.records;

      const result: ResolutionResult = {
        domain: normalizedName,
        records,
        resolved: records.length > 0,
        source: 'blockchain',
        ttl: Math.min(...records.map((r) => r.ttl), 3600),
        timestamp: Date.now(),
      };

      if (this.options.cacheEnabled) {
        this.cache.set(cacheKey, result, result.ttl * 1000);
      }

      return result;
    }

    // Fallback to traditional DNS
    if (this.options.fallbackEnabled && !this.isBlockchainTld(normalizedName)) {
      return this.resolveTraditional(normalizedName, type);
    }

    return {
      domain: normalizedName,
      records: [],
      resolved: false,
      source: 'blockchain',
      ttl: 0,
      timestamp: Date.now(),
    };
  }

  async resolveIP(name: string): Promise<string | null> {
    const result = await this.resolve(name, 'A');
    return result.records[0]?.value || null;
  }

  async resolveTXT(name: string): Promise<string[]> {
    const result = await this.resolve(name, 'TXT');
    return result.records.map((r) => r.value);
  }

  async resolveBSVAlias(name: string): Promise<string | null> {
    const result = await this.resolve(name, 'BSVALIAS');
    return result.records[0]?.value || null;
  }

  private async lookupBlockchain(name: string): Promise<Domain | null> {
    // In production, this would query the blockchain
    // For now, use local registry
    return this.domains.get(name) || null;
  }

  private async resolveTraditional(name: string, type?: RecordType): Promise<ResolutionResult> {
    // In browser, use DNS-over-HTTPS
    try {
      const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}${type ? `&type=${type}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      const records: DNSRecord[] = (data.Answer || []).map((answer: { type: number; name: string; data: string; TTL: number }) => ({
        type: this.numericToRecordType(answer.type),
        name: answer.name,
        value: answer.data,
        ttl: answer.TTL,
      }));

      return {
        domain: name,
        records,
        resolved: records.length > 0,
        source: 'traditional',
        ttl: Math.min(...records.map((r) => r.ttl), 3600),
        timestamp: Date.now(),
      };
    } catch {
      return {
        domain: name,
        records: [],
        resolved: false,
        source: 'traditional',
        ttl: 0,
        timestamp: Date.now(),
      };
    }
  }

  // ==========================================================================
  // Domain Registration
  // ==========================================================================

  async register(params: RegisterParams): Promise<Domain> {
    const name = this.normalizeName(params.name);

    if (this.domains.has(name)) {
      throw new Error('Domain already registered');
    }

    this.validateDomainName(name);

    const domain: Domain = {
      name,
      owner: params.owner,
      registeredAt: Date.now(),
      expiresAt: Date.now() + (params.years || 1) * 365 * 24 * 60 * 60 * 1000,
      records: params.records || [],
      metadata: params.metadata,
    };

    this.domains.set(name, domain);
    this.emit(name, domain);

    return domain;
  }

  async renew(name: string, years: number = 1): Promise<Domain> {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.expiresAt += years * 365 * 24 * 60 * 60 * 1000;
    this.emit(normalizedName, domain);

    return domain;
  }

  async transfer(name: string, newOwner: string): Promise<Domain> {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.owner = newOwner;
    this.emit(normalizedName, domain);

    return domain;
  }

  // ==========================================================================
  // Record Management
  // ==========================================================================

  async addRecord(name: string, record: DNSRecord): Promise<Domain> {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.records.push(record);
    this.cache.delete(`${normalizedName}:${record.type}`);
    this.cache.delete(`${normalizedName}:ALL`);
    this.emit(normalizedName, domain);

    return domain;
  }

  async removeRecord(name: string, recordType: RecordType, value?: string): Promise<Domain> {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.records = domain.records.filter((r) => {
      if (r.type !== recordType) return true;
      if (value && r.value !== value) return true;
      return false;
    });

    this.cache.delete(`${normalizedName}:${recordType}`);
    this.cache.delete(`${normalizedName}:ALL`);
    this.emit(normalizedName, domain);

    return domain;
  }

  async updateMetadata(name: string, metadata: Partial<DomainMetadata>): Promise<Domain> {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) {
      throw new Error('Domain not found');
    }

    domain.metadata = { ...domain.metadata, ...metadata };
    this.emit(normalizedName, domain);

    return domain;
  }

  // ==========================================================================
  // Queries
  // ==========================================================================

  getDomain(name: string): Domain | undefined {
    return this.domains.get(this.normalizeName(name));
  }

  getDomainsByOwner(owner: string): Domain[] {
    return Array.from(this.domains.values()).filter((d) => d.owner === owner);
  }

  isAvailable(name: string): boolean {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);

    if (!domain) return true;
    return Date.now() > domain.expiresAt;
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(name: string, callback: (domain: Domain) => void): () => void {
    const normalizedName = this.normalizeName(name);
    if (!this.listeners.has(normalizedName)) {
      this.listeners.set(normalizedName, new Set());
    }
    this.listeners.get(normalizedName)!.add(callback);
    return () => this.off(normalizedName, callback);
  }

  off(name: string, callback: (domain: Domain) => void): void {
    this.listeners.get(name)?.delete(callback);
  }

  private emit(name: string, domain: Domain): void {
    const callbacks = this.listeners.get(name);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(domain);
      }
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private normalizeName(name: string): string {
    return name.toLowerCase().trim();
  }

  private isBlockchainTld(name: string): boolean {
    return BLOCKCHAIN_TLDS.some((tld) => name.endsWith(tld.name));
  }

  private validateDomainName(name: string): void {
    const tld = BLOCKCHAIN_TLDS.find((t) => name.endsWith(t.name));
    if (!tld) {
      throw new Error('Unsupported TLD');
    }

    const label = name.replace(tld.name, '');
    if (label.length < tld.minLength || label.length > tld.maxLength) {
      throw new Error(`Domain name must be ${tld.minLength}-${tld.maxLength} characters`);
    }

    if (tld.reserved.includes(label)) {
      throw new Error('Domain name is reserved');
    }

    const allowedRegex = new RegExp(`^[${tld.allowedChars}]+$`);
    if (!allowedRegex.test(label)) {
      throw new Error('Domain name contains invalid characters');
    }
  }

  private numericToRecordType(num: number): RecordType {
    const types: Record<number, RecordType> = {
      1: 'A',
      5: 'CNAME',
      15: 'MX',
      16: 'TXT',
      28: 'AAAA',
      33: 'SRV',
    };
    return types[num] || 'TXT';
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createBlockchainDNS(options?: ResolverOptions): BlockchainDNS {
  return new BlockchainDNS(options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse domain into labels
 */
export function parseDomain(domain: string): { labels: string[]; tld: string } {
  const parts = domain.split('.');
  const tld = '.' + parts.pop();
  return { labels: parts, tld };
}

/**
 * Check if domain is valid
 */
export function isValidDomain(domain: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i;
  return regex.test(domain);
}

/**
 * Create A record
 */
export function createARecord(name: string, ip: string, ttl: number = 3600): DNSRecord {
  return { type: 'A', name, value: ip, ttl };
}

/**
 * Create TXT record
 */
export function createTXTRecord(name: string, text: string, ttl: number = 3600): DNSRecord {
  return { type: 'TXT', name, value: text, ttl };
}

/**
 * Create BSVALIAS record (paymail)
 */
export function createBSVAliasRecord(name: string, paymail: string, ttl: number = 3600): DNSRecord {
  return { type: 'BSVALIAS', name, value: paymail, ttl };
}
