// src/index.ts
var BLOCKCHAIN_TLDS = [
  {
    name: ".bit",
    registrationFee: 1e4,
    // satoshis
    renewalFee: 5e3,
    minLength: 3,
    maxLength: 63,
    allowedChars: "a-z0-9-",
    reserved: ["www", "mail", "ftp", "api"]
  },
  {
    name: ".bsv",
    registrationFee: 5e4,
    renewalFee: 25e3,
    minLength: 3,
    maxLength: 63,
    allowedChars: "a-z0-9-",
    reserved: ["satoshi", "bitcoin", "bsv"]
  },
  {
    name: ".sats",
    registrationFee: 21e3,
    renewalFee: 1e4,
    minLength: 1,
    maxLength: 63,
    allowedChars: "a-z0-9-",
    reserved: []
  }
];
var DEFAULT_OPTIONS = {
  cacheEnabled: true,
  cacheTtl: 36e5,
  // 1 hour
  fallbackEnabled: true,
  traditionalDns: "8.8.8.8",
  timeout: 1e4
};
var DNSCache = class {
  constructor(defaultTtl = 36e5) {
    this.cache = /* @__PURE__ */ new Map();
    this.defaultTtl = defaultTtl;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.result;
  }
  set(key, result, ttl) {
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + (ttl || this.defaultTtl)
    });
  }
  delete(key) {
    this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
  }
  prune() {
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
};
var BlockchainDNS = class {
  constructor(options = {}) {
    this.domains = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cache = new DNSCache(this.options.cacheTtl);
  }
  // ==========================================================================
  // Resolution
  // ==========================================================================
  async resolve(name, type) {
    const normalizedName = this.normalizeName(name);
    const cacheKey = `${normalizedName}:${type || "ALL"}`;
    if (this.options.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, source: "cache" };
      }
    }
    const domain = await this.lookupBlockchain(normalizedName);
    if (domain) {
      const records = type ? domain.records.filter((r) => r.type === type) : domain.records;
      const result = {
        domain: normalizedName,
        records,
        resolved: records.length > 0,
        source: "blockchain",
        ttl: Math.min(...records.map((r) => r.ttl), 3600),
        timestamp: Date.now()
      };
      if (this.options.cacheEnabled) {
        this.cache.set(cacheKey, result, result.ttl * 1e3);
      }
      return result;
    }
    if (this.options.fallbackEnabled && !this.isBlockchainTld(normalizedName)) {
      return this.resolveTraditional(normalizedName, type);
    }
    return {
      domain: normalizedName,
      records: [],
      resolved: false,
      source: "blockchain",
      ttl: 0,
      timestamp: Date.now()
    };
  }
  async resolveIP(name) {
    const result = await this.resolve(name, "A");
    return result.records[0]?.value || null;
  }
  async resolveTXT(name) {
    const result = await this.resolve(name, "TXT");
    return result.records.map((r) => r.value);
  }
  async resolveBSVAlias(name) {
    const result = await this.resolve(name, "BSVALIAS");
    return result.records[0]?.value || null;
  }
  async lookupBlockchain(name) {
    return this.domains.get(name) || null;
  }
  async resolveTraditional(name, type) {
    try {
      const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}${type ? `&type=${type}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      const records = (data.Answer || []).map((answer) => ({
        type: this.numericToRecordType(answer.type),
        name: answer.name,
        value: answer.data,
        ttl: answer.TTL
      }));
      return {
        domain: name,
        records,
        resolved: records.length > 0,
        source: "traditional",
        ttl: Math.min(...records.map((r) => r.ttl), 3600),
        timestamp: Date.now()
      };
    } catch {
      return {
        domain: name,
        records: [],
        resolved: false,
        source: "traditional",
        ttl: 0,
        timestamp: Date.now()
      };
    }
  }
  // ==========================================================================
  // Domain Registration
  // ==========================================================================
  async register(params) {
    const name = this.normalizeName(params.name);
    if (this.domains.has(name)) {
      throw new Error("Domain already registered");
    }
    this.validateDomainName(name);
    const domain = {
      name,
      owner: params.owner,
      registeredAt: Date.now(),
      expiresAt: Date.now() + (params.years || 1) * 365 * 24 * 60 * 60 * 1e3,
      records: params.records || [],
      metadata: params.metadata
    };
    this.domains.set(name, domain);
    this.emit(name, domain);
    return domain;
  }
  async renew(name, years = 1) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) {
      throw new Error("Domain not found");
    }
    domain.expiresAt += years * 365 * 24 * 60 * 60 * 1e3;
    this.emit(normalizedName, domain);
    return domain;
  }
  async transfer(name, newOwner) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) {
      throw new Error("Domain not found");
    }
    domain.owner = newOwner;
    this.emit(normalizedName, domain);
    return domain;
  }
  // ==========================================================================
  // Record Management
  // ==========================================================================
  async addRecord(name, record) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) {
      throw new Error("Domain not found");
    }
    domain.records.push(record);
    this.cache.delete(`${normalizedName}:${record.type}`);
    this.cache.delete(`${normalizedName}:ALL`);
    this.emit(normalizedName, domain);
    return domain;
  }
  async removeRecord(name, recordType, value) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) {
      throw new Error("Domain not found");
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
  async updateMetadata(name, metadata) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) {
      throw new Error("Domain not found");
    }
    domain.metadata = { ...domain.metadata, ...metadata };
    this.emit(normalizedName, domain);
    return domain;
  }
  // ==========================================================================
  // Queries
  // ==========================================================================
  getDomain(name) {
    return this.domains.get(this.normalizeName(name));
  }
  getDomainsByOwner(owner) {
    return Array.from(this.domains.values()).filter((d) => d.owner === owner);
  }
  isAvailable(name) {
    const normalizedName = this.normalizeName(name);
    const domain = this.domains.get(normalizedName);
    if (!domain) return true;
    return Date.now() > domain.expiresAt;
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(name, callback) {
    const normalizedName = this.normalizeName(name);
    if (!this.listeners.has(normalizedName)) {
      this.listeners.set(normalizedName, /* @__PURE__ */ new Set());
    }
    this.listeners.get(normalizedName).add(callback);
    return () => this.off(normalizedName, callback);
  }
  off(name, callback) {
    this.listeners.get(name)?.delete(callback);
  }
  emit(name, domain) {
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
  normalizeName(name) {
    return name.toLowerCase().trim();
  }
  isBlockchainTld(name) {
    return BLOCKCHAIN_TLDS.some((tld) => name.endsWith(tld.name));
  }
  validateDomainName(name) {
    const tld = BLOCKCHAIN_TLDS.find((t) => name.endsWith(t.name));
    if (!tld) {
      throw new Error("Unsupported TLD");
    }
    const label = name.replace(tld.name, "");
    if (label.length < tld.minLength || label.length > tld.maxLength) {
      throw new Error(`Domain name must be ${tld.minLength}-${tld.maxLength} characters`);
    }
    if (tld.reserved.includes(label)) {
      throw new Error("Domain name is reserved");
    }
    const allowedRegex = new RegExp(`^[${tld.allowedChars}]+$`);
    if (!allowedRegex.test(label)) {
      throw new Error("Domain name contains invalid characters");
    }
  }
  numericToRecordType(num) {
    const types = {
      1: "A",
      5: "CNAME",
      15: "MX",
      16: "TXT",
      28: "AAAA",
      33: "SRV"
    };
    return types[num] || "TXT";
  }
  clearCache() {
    this.cache.clear();
  }
};
function createBlockchainDNS(options) {
  return new BlockchainDNS(options);
}
function parseDomain(domain) {
  const parts = domain.split(".");
  const tld = "." + parts.pop();
  return { labels: parts, tld };
}
function isValidDomain(domain) {
  const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i;
  return regex.test(domain);
}
function createARecord(name, ip, ttl = 3600) {
  return { type: "A", name, value: ip, ttl };
}
function createTXTRecord(name, text, ttl = 3600) {
  return { type: "TXT", name, value: text, ttl };
}
function createBSVAliasRecord(name, paymail, ttl = 3600) {
  return { type: "BSVALIAS", name, value: paymail, ttl };
}
export {
  BLOCKCHAIN_TLDS,
  BlockchainDNS,
  DEFAULT_OPTIONS,
  DNSCache,
  createARecord,
  createBSVAliasRecord,
  createBlockchainDNS,
  createTXTRecord,
  isValidDomain,
  parseDomain
};
//# sourceMappingURL=index.js.map