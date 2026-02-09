// src/index.ts
var DEFAULT_CONFIG = {
  algorithm: "sliding-window",
  maxRequests: 100,
  windowMs: 6e4,
  // 1 minute
  keyPrefix: "rl:",
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  blockDuration: 0,
  burstLimit: 0
};
var MemoryStore = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
    this.timers = /* @__PURE__ */ new Map();
  }
  async get(key) {
    return this.store.get(key) || null;
  }
  async set(key, entry, ttlMs) {
    this.store.set(key, entry);
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
    }, ttlMs);
    this.timers.set(key, timer);
  }
  async increment(key, windowMs) {
    const now = Date.now();
    const existing = this.store.get(key);
    if (!existing || now - existing.startTime >= windowMs) {
      const entry = {
        count: 1,
        startTime: now,
        lastRequest: now
      };
      await this.set(key, entry, windowMs);
      return entry;
    }
    existing.count++;
    existing.lastRequest = now;
    return existing;
  }
  async delete(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    this.store.delete(key);
  }
  async reset() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
  }
  size() {
    return this.store.size;
  }
};
var RateLimiter = class {
  constructor(config, store) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = store || new MemoryStore();
  }
  // ==========================================================================
  // Core Methods
  // ==========================================================================
  async check(key) {
    const fullKey = this.config.keyPrefix + key;
    switch (this.config.algorithm) {
      case "token-bucket":
        return this.checkTokenBucket(fullKey);
      case "leaky-bucket":
        return this.checkLeakyBucket(fullKey);
      case "fixed-window":
        return this.checkFixedWindow(fullKey);
      case "sliding-window":
      default:
        return this.checkSlidingWindow(fullKey);
    }
  }
  async consume(key, tokens = 1) {
    const fullKey = this.config.keyPrefix + key;
    const result = await this.check(key);
    if (result.allowed) {
      const entry = await this.store.get(fullKey);
      if (entry) {
        entry.count += tokens - 1;
        await this.store.set(fullKey, entry, this.config.windowMs);
      }
    }
    return result;
  }
  async reset(key) {
    const fullKey = this.config.keyPrefix + key;
    await this.store.delete(fullKey);
  }
  async block(key, durationMs) {
    const fullKey = this.config.keyPrefix + key;
    const duration = durationMs || this.config.blockDuration || this.config.windowMs;
    const now = Date.now();
    const entry = {
      count: this.config.maxRequests,
      startTime: now,
      lastRequest: now,
      blocked: true,
      blockedUntil: now + duration
    };
    await this.store.set(fullKey, entry, duration);
  }
  async unblock(key) {
    await this.reset(key);
  }
  // ==========================================================================
  // Algorithm Implementations
  // ==========================================================================
  async checkFixedWindow(key) {
    const now = Date.now();
    const entry = await this.store.increment(key, this.config.windowMs);
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }
    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const resetAt = new Date(entry.startTime + this.config.windowMs);
    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ""));
    }
    return {
      allowed,
      status: allowed ? "allowed" : "limited",
      remaining,
      total: this.config.maxRequests,
      resetAt,
      retryAfter: allowed ? void 0 : Math.ceil((resetAt.getTime() - now) / 1e3)
    };
  }
  async checkSlidingWindow(key) {
    const now = Date.now();
    const entry = await this.store.get(key);
    if (!entry) {
      const newEntry = {
        count: 1,
        startTime: now,
        lastRequest: now
      };
      await this.store.set(key, newEntry, this.config.windowMs);
      return {
        allowed: true,
        status: "allowed",
        remaining: this.config.maxRequests - 1,
        total: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs)
      };
    }
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }
    const windowStart = now - this.config.windowMs;
    const previousWindowWeight = Math.max(0, (entry.startTime + this.config.windowMs - now) / this.config.windowMs);
    const currentWindowCount = now >= entry.startTime + this.config.windowMs ? 1 : entry.count + 1;
    const previousWindowCount = now >= entry.startTime + this.config.windowMs ? entry.count : 0;
    const weightedCount = previousWindowCount * previousWindowWeight + currentWindowCount;
    const allowed = weightedCount <= this.config.maxRequests;
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
      await this.block(key.replace(this.config.keyPrefix, ""));
    }
    return {
      allowed,
      status: allowed ? "allowed" : "limited",
      remaining,
      total: this.config.maxRequests,
      resetAt,
      retryAfter: allowed ? void 0 : Math.ceil((resetAt.getTime() - now) / 1e3)
    };
  }
  async checkTokenBucket(key) {
    const now = Date.now();
    const entry = await this.store.get(key);
    const refillRate = this.config.maxRequests / this.config.windowMs;
    const maxTokens = this.config.burstLimit || this.config.maxRequests;
    if (!entry) {
      const newEntry = {
        count: 0,
        startTime: now,
        lastRequest: now,
        tokens: maxTokens - 1
      };
      await this.store.set(key, newEntry, this.config.windowMs);
      return {
        allowed: true,
        status: "allowed",
        remaining: maxTokens - 1,
        total: maxTokens,
        resetAt: new Date(now + this.config.windowMs)
      };
    }
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }
    const elapsed = now - entry.lastRequest;
    const refilled = Math.min(maxTokens, (entry.tokens || 0) + elapsed * refillRate);
    const tokens = refilled - 1;
    const allowed = refilled >= 1;
    entry.tokens = allowed ? tokens : 0;
    entry.lastRequest = now;
    entry.count++;
    await this.store.set(key, entry, this.config.windowMs);
    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ""));
    }
    return {
      allowed,
      status: allowed ? "allowed" : "limited",
      remaining: Math.max(0, Math.floor(entry.tokens)),
      total: maxTokens,
      resetAt: new Date(now + (maxTokens - (entry.tokens || 0)) / refillRate),
      retryAfter: allowed ? void 0 : Math.ceil(1 / refillRate / 1e3)
    };
  }
  async checkLeakyBucket(key) {
    const now = Date.now();
    const entry = await this.store.get(key);
    const leakRate = this.config.maxRequests / this.config.windowMs;
    const bucketSize = this.config.burstLimit || this.config.maxRequests;
    if (!entry) {
      const newEntry = {
        count: 1,
        startTime: now,
        lastRequest: now
      };
      await this.store.set(key, newEntry, this.config.windowMs);
      return {
        allowed: true,
        status: "allowed",
        remaining: bucketSize - 1,
        total: bucketSize,
        resetAt: new Date(now + this.config.windowMs)
      };
    }
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return this.createBlockedResult(entry, now);
    }
    const elapsed = now - entry.lastRequest;
    const leaked = elapsed * leakRate;
    const currentLevel = Math.max(0, entry.count - leaked);
    const newLevel = currentLevel + 1;
    const allowed = newLevel <= bucketSize;
    entry.count = allowed ? newLevel : currentLevel;
    entry.lastRequest = now;
    await this.store.set(key, entry, this.config.windowMs);
    if (!allowed && this.config.blockDuration > 0) {
      await this.block(key.replace(this.config.keyPrefix, ""));
    }
    return {
      allowed,
      status: allowed ? "allowed" : "limited",
      remaining: Math.max(0, Math.floor(bucketSize - entry.count)),
      total: bucketSize,
      resetAt: new Date(now + entry.count / leakRate),
      retryAfter: allowed ? void 0 : Math.ceil((newLevel - bucketSize) / leakRate / 1e3)
    };
  }
  createBlockedResult(entry, now) {
    const retryAfter = entry.blockedUntil ? Math.ceil((entry.blockedUntil - now) / 1e3) : 0;
    return {
      allowed: false,
      status: "blocked",
      remaining: 0,
      total: this.config.maxRequests,
      resetAt: new Date(entry.blockedUntil || now + this.config.windowMs),
      retryAfter
    };
  }
  // ==========================================================================
  // Headers
  // ==========================================================================
  getHeaders(result) {
    const headers = {
      "X-RateLimit-Limit": String(result.total),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1e3))
    };
    if (result.retryAfter) {
      headers["Retry-After"] = String(result.retryAfter);
    }
    return headers;
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  getConfig() {
    return { ...this.config };
  }
};
function createRateLimiter(config, store) {
  return new RateLimiter(config, store);
}
function createMemoryStore() {
  return new MemoryStore();
}
var PRESETS = {
  /** Strict: 10 requests per minute */
  strict: {
    maxRequests: 10,
    windowMs: 6e4,
    algorithm: "sliding-window"
  },
  /** Standard: 100 requests per minute */
  standard: {
    maxRequests: 100,
    windowMs: 6e4,
    algorithm: "sliding-window"
  },
  /** Lenient: 1000 requests per minute */
  lenient: {
    maxRequests: 1e3,
    windowMs: 6e4,
    algorithm: "sliding-window"
  },
  /** API: 100 requests per 15 minutes */
  api: {
    maxRequests: 100,
    windowMs: 9e5,
    algorithm: "sliding-window"
  },
  /** Auth: 5 attempts per 15 minutes with blocking */
  auth: {
    maxRequests: 5,
    windowMs: 9e5,
    algorithm: "sliding-window",
    blockDuration: 36e5
    // 1 hour
  },
  /** Burst: Token bucket with burst allowance */
  burst: {
    maxRequests: 100,
    windowMs: 6e4,
    algorithm: "token-bucket",
    burstLimit: 20
  }
};
function createKeyGenerator(...parts) {
  return (req) => {
    return parts.map((part) => typeof part === "function" ? part(req) : part).filter(Boolean).join(":");
  };
}
function extractIP(req) {
  const r = req;
  const headers = r.headers;
  const forwardedFor = r["x-forwarded-for"] || headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = r["x-real-ip"] || headers?.["x-real-ip"];
  if (typeof realIP === "string") {
    return realIP;
  }
  if (r.socket && typeof r.socket.remoteAddress === "string") {
    return r.socket.remoteAddress;
  }
  if (typeof r.ip === "string") {
    return r.ip;
  }
  return "unknown";
}
function isRateLimited(result) {
  return !result.allowed;
}
function formatRetryAfter(seconds) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
export {
  DEFAULT_CONFIG,
  MemoryStore,
  PRESETS,
  RateLimiter,
  createKeyGenerator,
  createMemoryStore,
  createRateLimiter,
  extractIP,
  formatRetryAfter,
  isRateLimited
};
//# sourceMappingURL=index.js.map