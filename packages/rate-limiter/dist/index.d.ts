/**
 * @b0ase/rate-limiter
 *
 * Rate limiting utilities for APIs and services.
 *
 * @packageDocumentation
 */
/** Rate limit algorithm */
type RateLimitAlgorithm = 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket';
/** Rate limit status */
type RateLimitStatus = 'allowed' | 'limited' | 'blocked';
/** Rate limit config */
interface RateLimitConfig {
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
interface RateLimitResult {
    allowed: boolean;
    status: RateLimitStatus;
    remaining: number;
    total: number;
    resetAt: Date;
    retryAfter?: number;
}
/** Rate limit entry */
interface RateLimitEntry {
    count: number;
    startTime: number;
    lastRequest: number;
    blocked?: boolean;
    blockedUntil?: number;
    tokens?: number;
}
/** Rate limit headers */
interface RateLimitHeaders {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'Retry-After'?: string;
}
/** Store interface */
interface RateLimitStore {
    get(key: string): Promise<RateLimitEntry | null>;
    set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
    increment(key: string, windowMs: number): Promise<RateLimitEntry>;
    delete(key: string): Promise<void>;
    reset(): Promise<void>;
}
declare const DEFAULT_CONFIG: Required<RateLimitConfig>;
declare class MemoryStore implements RateLimitStore {
    private store;
    private timers;
    get(key: string): Promise<RateLimitEntry | null>;
    set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
    increment(key: string, windowMs: number): Promise<RateLimitEntry>;
    delete(key: string): Promise<void>;
    reset(): Promise<void>;
    size(): number;
}
declare class RateLimiter {
    private config;
    private store;
    constructor(config: RateLimitConfig, store?: RateLimitStore);
    check(key: string): Promise<RateLimitResult>;
    consume(key: string, tokens?: number): Promise<RateLimitResult>;
    reset(key: string): Promise<void>;
    block(key: string, durationMs?: number): Promise<void>;
    unblock(key: string): Promise<void>;
    private checkFixedWindow;
    private checkSlidingWindow;
    private checkTokenBucket;
    private checkLeakyBucket;
    private createBlockedResult;
    getHeaders(result: RateLimitResult): RateLimitHeaders;
    getConfig(): Required<RateLimitConfig>;
}
declare function createRateLimiter(config: RateLimitConfig, store?: RateLimitStore): RateLimiter;
declare function createMemoryStore(): MemoryStore;
declare const PRESETS: {
    /** Strict: 10 requests per minute */
    readonly strict: {
        readonly maxRequests: 10;
        readonly windowMs: 60000;
        readonly algorithm: "sliding-window";
    };
    /** Standard: 100 requests per minute */
    readonly standard: {
        readonly maxRequests: 100;
        readonly windowMs: 60000;
        readonly algorithm: "sliding-window";
    };
    /** Lenient: 1000 requests per minute */
    readonly lenient: {
        readonly maxRequests: 1000;
        readonly windowMs: 60000;
        readonly algorithm: "sliding-window";
    };
    /** API: 100 requests per 15 minutes */
    readonly api: {
        readonly maxRequests: 100;
        readonly windowMs: 900000;
        readonly algorithm: "sliding-window";
    };
    /** Auth: 5 attempts per 15 minutes with blocking */
    readonly auth: {
        readonly maxRequests: 5;
        readonly windowMs: 900000;
        readonly algorithm: "sliding-window";
        readonly blockDuration: 3600000;
    };
    /** Burst: Token bucket with burst allowance */
    readonly burst: {
        readonly maxRequests: 100;
        readonly windowMs: 60000;
        readonly algorithm: "token-bucket";
        readonly burstLimit: 20;
    };
};
declare function createKeyGenerator(...parts: (string | ((req: unknown) => string))[]): (req: unknown) => string;
declare function extractIP(req: unknown): string;
declare function isRateLimited(result: RateLimitResult): boolean;
declare function formatRetryAfter(seconds: number): string;

export { DEFAULT_CONFIG, MemoryStore, PRESETS, type RateLimitAlgorithm, type RateLimitConfig, type RateLimitEntry, type RateLimitHeaders, type RateLimitResult, type RateLimitStatus, type RateLimitStore, RateLimiter, createKeyGenerator, createMemoryStore, createRateLimiter, extractIP, formatRetryAfter, isRateLimited };
