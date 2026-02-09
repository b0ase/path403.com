/**
 * @b0ase/promise-utils
 *
 * Promise utilities: debounce, throttle, batch, pool, and more.
 *
 * @packageDocumentation
 */
/** Async function type */
type AsyncFn<T, A extends unknown[] = unknown[]> = (...args: A) => Promise<T>;
/** Deferred promise */
interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
}
/** Pool task */
interface PoolTask<T> {
    fn: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
}
/** Batch result */
type BatchResult<T> = {
    status: 'fulfilled';
    value: T;
} | {
    status: 'rejected';
    reason: unknown;
};
/**
 * Create a deferred promise
 */
declare function deferred<T>(): Deferred<T>;
/**
 * Sleep for a given duration
 */
declare function sleep(ms: number): Promise<void>;
/**
 * Create a cancellable promise
 */
declare function cancellable<T>(promise: Promise<T>): {
    promise: Promise<T>;
    cancel: () => void;
};
/**
 * Debounce an async function
 */
declare function debounce<T, A extends unknown[]>(fn: (...args: A) => Promise<T>, wait: number): (...args: A) => Promise<T>;
/**
 * Throttle an async function
 */
declare function throttle<T, A extends unknown[]>(fn: (...args: A) => Promise<T>, limit: number): (...args: A) => Promise<T>;
/**
 * Promise pool for concurrent execution with limit
 */
declare class PromisePool<T = unknown> {
    private concurrency;
    private running;
    private queue;
    constructor(concurrency?: number);
    add(fn: () => Promise<T>): Promise<T>;
    private runNext;
    getStats(): {
        running: number;
        queued: number;
        concurrency: number;
    };
    setConcurrency(n: number): void;
}
/**
 * Execute promises with concurrency limit
 */
declare function pool<T>(tasks: Array<() => Promise<T>>, concurrency?: number): Promise<T[]>;
/**
 * Execute promises in parallel with settled results
 */
declare function allSettled<T>(tasks: Array<() => Promise<T>>, concurrency?: number): Promise<Array<BatchResult<T>>>;
/**
 * Batch multiple calls into a single execution
 */
declare function batch<K, V>(fn: (keys: K[]) => Promise<Map<K, V>>, options?: {
    maxSize?: number;
    maxWait?: number;
}): (key: K) => Promise<V>;
/**
 * Memoize an async function
 */
declare function memoize<T, A extends unknown[]>(fn: (...args: A) => Promise<T>, options?: {
    keyFn?: (...args: A) => string;
    ttl?: number;
    maxSize?: number;
}): (...args: A) => Promise<T>;
/**
 * Race promises with proper cleanup
 */
declare function race<T>(tasks: Array<() => Promise<T>>, onCancel?: (index: number) => void): Promise<T>;
/**
 * Get the first successfully settled promise
 */
declare function firstFulfilled<T>(tasks: Array<() => Promise<T>>): Promise<T>;
/**
 * Wait for a condition to be true
 */
declare function waitFor(condition: () => boolean | Promise<boolean>, options?: {
    interval?: number;
    timeout?: number;
}): Promise<void>;
/**
 * Retry a promise until it succeeds or reaches max attempts
 */
declare function retryUntil<T>(fn: () => Promise<T>, predicate: (result: T) => boolean, options?: {
    maxAttempts?: number;
    delay?: number;
}): Promise<T>;
/**
 * Map with concurrency limit
 */
declare function mapAsync<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, concurrency?: number): Promise<R[]>;
/**
 * Filter with async predicate
 */
declare function filterAsync<T>(items: T[], predicate: (item: T, index: number) => Promise<boolean>, concurrency?: number): Promise<T[]>;
declare function createPool<T>(concurrency?: number): PromisePool<T>;

export { type AsyncFn, type BatchResult, type Deferred, type PoolTask, PromisePool, allSettled, batch, cancellable, createPool, debounce, deferred, filterAsync, firstFulfilled, mapAsync, memoize, pool, race, retryUntil, sleep, throttle, waitFor };
