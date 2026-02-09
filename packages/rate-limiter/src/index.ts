/**
 * @b0ase/rate-limiter
 *
 * Rate limiting utilities for APIs and services.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Rate limit algorithm */
export type RateLimitAlgorithm =
  | 'fixed-window'
  | 'sliding-window'
  | 'token-bucket'
  | 'leaky-bucket';

/** Rate limit status */
export type RateLimitStatus = 'allowed' | 'limited' | 'blocked';

/** Rate limit config */
export interface RateLimitConfig {
  algorithm?: RateLimitAlgorithm;
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  blockDuration?: number;
  burstLimit?: number;
}

/** Rate limit result */
export interface RateLimitResult {
  allowed: boolean;
  status: RateLimitStatus;
  remaining: number;
  total: number;
  resetAt: Date;
  retryAfter?: number;
}

/** Rate limit entry */
export interface RateLimitEntry {
  count: number;
  startTime: number;
  lastRequest: number;
  blocked?: boolean;
  blockedUntil?: number;
  tokens?: number;
}

/** Rate limit headers */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/** Store interface */
export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;
  delete(key: string): Promise<void>;
  reset(): Promise<void>;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  algorithm: 'sliding-window',
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  keyPrefix: 'rl:',
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  blockDuration: 0,
  burstLimit: 0,
};

// ============================================================================
// In-Memory Store
// ============================================================================

export class MemoryStore implements RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  async get(key: string): Promise<RateLimitEntry | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    this.store.set(key, entry);

    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set cleanup timer
    const timer = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
    }, ttlMs);

    this.timers.set(key, timer);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now - existing.startTime >= windowMs) {
      const entry: RateLimitEntry = {
        count: 1,
        startTime: now,
        lastRequest: now,
      };
      await this.set(key, entry, windowMs);
      return entry;
    }

    existing.count++;
    existing.lastRequest = now;
    return existing;
  }

  async delete(key: string): Promise<void> {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    this.store.delete(key);
  }

  async reset(): Promise<void> {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// ============================================================================
// Rate Limiter
// ============================================================================

export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = store || new MemoryStore();
  }

  // ==========================================================================
  // Core Methods
  // ==========================================================================

  async check(key: string): Promise<RateLimitResult> {
    const fullKey = this.config.keyPrefix + key;

    switch (this.config.algorithm) {
      case 'token-bucket':
        return this.checkTokenBucket(fullKey);
      case 'leaky-bucket':
        return this.checkLeakyBucket(fullKey);
      case 'fixed-window':
        return this.checkFixedWindow(fullKey);
      case 'sliding-window':
      default:
        return this.checkSlidingWindow(fullKey);
    }
  }

  async consume(key: string, tokens: number = 1): Promise<RateLimitResult> {
    const fullKey = this.config.keyPrefix + key;
    const result = await this.check(key);

    if (result.allowed) {
      const entry = await this.store.get(fullKey);
      if (entry) {
        entry.count += tokens - 1; // Already incremented by 1 in check
        await this.store.set(fullKey, entry, this.config.windowMs);
      }
    }

    return result;
  }

  async reset(key: string): Promise<void> {
    const fullKey = this.config.keyPrefix + key;
    await this.store.delete(fullKey);
  }

  async block(key: string, durationMs?: number): Promise<void> {
    const fullKey = this.config.keyPrefix + key;
    const duration = durationMs || this.config.blockDuration || this.config.windowMs;
    const now = Date.now();

    const entry: RateLimitEntry = {
      count: this.config.maxRequests,
      startTime: now,
      lastRequest: now,
      blocked: true,
      blockedUntil: now + duration,
    };

    await this.store.set(fullKey, entry, duration);
  }

  async unblock(key: string): Promise<void> {
    await this.reset(key);
  }

  // ==========================================================================
  // Algorithm Implementations
  // ==========================================================================

  private async checkFixedWindow(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = await this.store.increment(key, this.config.windowMs);

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }

    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const resetAt = new Date(entry.startTime + this.config.windowMs);

    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ''));
    }

    return {
      allowed,
      status: allowed ? 'allowed' : 'limited',
      remaining,
      total: this.config.maxRequests,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil((resetAt.getTime() - now) / 1000),
    };
  }

  private async checkSlidingWindow(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = await this.store.get(key);

    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 1,
        startTime: now,
        lastRequest: now,
      };
      await this.store.set(key, newEntry, this.config.windowMs);

      return {
        allowed: true,
        status: 'allowed',
        remaining: this.config.maxRequests - 1,
        total: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs),
      };
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }

    // Calculate sliding window weight
    const windowStart = now - this.config.windowMs;
    const previousWindowWeight = Math.max(0, (entry.startTime + this.config.windowMs - now) / this.config.windowMs);
    const currentWindowCount = now >= entry.startTime + this.config.windowMs ? 1 : entry.count + 1;
    const previousWindowCount = now >= entry.startTime + this.config.windowMs ? entry.count : 0;

    const weightedCount = previousWindowCount * previousWindowWeight + currentWindowCount;
    const allowed = weightedCount <= this.config.maxRequests;

    // Update entry
    if (now >= entry.startTime + this.config.windowMs) {
      entry.count = 1;
      entry.startTime = now;
    } else {
      entry.count++;
    }
    entry.lastRequest = now;
    await this.store.set(key, entry, this.config.windowMs * 2);

    const remaining = Math.max(0, Math.floor(this.config.maxRequests - weightedCount));
    const resetAt = new Date(entry.startTime + this.config.windowMs);

    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ''));
    }

    return {
      allowed,
      status: allowed ? 'allowed' : 'limited',
      remaining,
      total: this.config.maxRequests,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil((resetAt.getTime() - now) / 1000),
    };
  }

  private async checkTokenBucket(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = await this.store.get(key);

    const refillRate = this.config.maxRequests / this.config.windowMs;
    const maxTokens = this.config.burstLimit || this.config.maxRequests;

    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 0,
        startTime: now,
        lastRequest: now,
        tokens: maxTokens - 1,
      };
      await this.store.set(key, newEntry, this.config.windowMs);

      return {
        allowed: true,
        status: 'allowed',
        remaining: maxTokens - 1,
        total: maxTokens,
        resetAt: new Date(now + this.config.windowMs),
      };
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }

    // Refill tokens based on time elapsed
    const elapsed = now - entry.lastRequest;
    const refilled = Math.min(maxTokens, (entry.tokens || 0) + elapsed * refillRate);
    const tokens = refilled - 1;
    const allowed = refilled >= 1;

    entry.tokens = allowed ? tokens : 0;
    entry.lastRequest = now;
    entry.count++;
    await this.store.set(key, entry, this.config.windowMs);

    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ''));
    }

    return {
      allowed,
      status: allowed ? 'allowed' : 'limited',
      remaining: Math.max(0, Math.floor(entry.tokens)),
      total: maxTokens,
      resetAt: new Date(now + (maxTokens - (entry.tokens || 0)) / refillRate),
      retryAfter: allowed ? undefined : Math.ceil(1 / refillRate / 1000),
    };
  }

  private async checkLeakyBucket(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = await this.store.get(key);

    const leakRate = this.config.maxRequests / this.config.windowMs; // requests per ms
    const bucketSize = this.config.burstLimit || this.config.maxRequests;

    if (!entry) {
      const newEntry: RateLimitEntry = {
        count: 1,
        startTime: now,
        lastRequest: now,
      };
      await this.store.set(key, newEntry, this.config.windowMs);

      return {
        allowed: true,
        status: 'allowed',
        remaining: bucketSize - 1,
        total: bucketSize,
        resetAt: new Date(now + this.config.windowMs),
      };
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }

    // Calculate leaked amount
    const elapsed = now - entry.lastRequest;
    const leaked = elapsed * leakRate;
    const currentLevel = Math.max(0, entry.count - leaked);
    const newLevel = currentLevel + 1;
    const allowed = newLevel <= bucketSize;

    entry.count = allowed ? newLevel : currentLevel;
    entry.lastRequest = now;
    await this.store.set(key, entry, this.config.windowMs);

    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ''));
    }

    return {
      allowed,
      status: allowed ? 'allowed' : 'limited',
      remaining: Math.max(0, Math.floor(bucketSize - entry.count)),
      total: bucketSize,
      resetAt: new Date(now + entry.count / leakRate),
      retryAfter: allowed ? undefined : Math.ceil((newLevel - bucketSize) / leakRate / 1000),
    };
  }

  private createBlockedResult(entry: RateLimitEntry, now: number): RateLimitResult {
    const retryAfter = entry.blockedUntil ? Math.ceil((entry.blockedUntil - now) / 1000) : 0;
    return {
      allowed: false,
      status: 'blocked',
      remaining: 0,
      total: this.config.maxRequests,
      resetAt: new Date(entry.blockedUntil || now + this.config.windowMs),
      retryAfter,
    };
  }

  // ==========================================================================
  // Headers
  // ==========================================================================

  getHeaders(result: RateLimitResult): RateLimitHeaders {
    const headers: RateLimitHeaders = {
      'X-RateLimit-Limit': String(result.total),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt.getTime() / 1000)),
    };

    if (result.retryAfter) {
      headers['Retry-After'] = String(result.retryAfter);
    }

    return headers;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  getConfig(): Required<RateLimitConfig> {
    return { ...this.config };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createRateLimiter(config: RateLimitConfig, store?: RateLimitStore): RateLimiter {
  return new RateLimiter(config, store);
}

export function createMemoryStore(): MemoryStore {
  return new MemoryStore();
}

// ============================================================================
// Preset Configurations
// ============================================================================

export const PRESETS = {
  /** Strict: 10 requests per minute */
  strict: {
    maxRequests: 10,
    windowMs: 60000,
    algorithm: 'sliding-window' as const,
  },

  /** Standard: 100 requests per minute */
  standard: {
    maxRequests: 100,
    windowMs: 60000,
    algorithm: 'sliding-window' as const,
  },

  /** Lenient: 1000 requests per minute */
  lenient: {
    maxRequests: 1000,
    windowMs: 60000,
    algorithm: 'sliding-window' as const,
  },

  /** API: 100 requests per 15 minutes */
  api: {
    maxRequests: 100,
    windowMs: 900000,
    algorithm: 'sliding-window' as const,
  },

  /** Auth: 5 attempts per 15 minutes with blocking */
  auth: {
    maxRequests: 5,
    windowMs: 900000,
    algorithm: 'sliding-window' as const,
    blockDuration: 3600000, // 1 hour
  },

  /** Burst: Token bucket with burst allowance */
  burst: {
    maxRequests: 100,
    windowMs: 60000,
    algorithm: 'token-bucket' as const,
    burstLimit: 20,
  },
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

export function createKeyGenerator(
  ...parts: (string | ((req: unknown) => string))[]
): (req: unknown) => string {
  return (req: unknown) => {
    return parts
      .map(part => (typeof part === 'function' ? part(req) : part))
      .filter(Boolean)
      .join(':');
  };
}

export function extractIP(req: unknown): string {
  const r = req as Record<string, unknown>;
  const headers = r.headers as Record<string, unknown> | undefined;

  // Check common headers
  const forwardedFor = r['x-forwarded-for'] || headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = r['x-real-ip'] || headers?.['x-real-ip'];
  if (typeof realIP === 'string') {
    return realIP;
  }

  // Check socket
  if (r.socket && typeof (r.socket as { remoteAddress?: string }).remoteAddress === 'string') {
    return (r.socket as { remoteAddress: string }).remoteAddress;
  }

  if (typeof r.ip === 'string') {
    return r.ip;
  }

  return 'unknown';
}

export function isRateLimited(result: RateLimitResult): boolean {
  return !result.allowed;
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
