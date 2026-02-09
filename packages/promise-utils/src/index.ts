/**
 * @b0ase/promise-utils
 *
 * Promise utilities: debounce, throttle, batch, pool, and more.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Async function type */
export type AsyncFn<T, A extends unknown[] = unknown[]> = (...args: A) => Promise<T>;

/** Deferred promise */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

/** Pool task */
export interface PoolTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

/** Batch result */
export type BatchResult<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

// ============================================================================
// Basic Utilities
// ============================================================================

/**
 * Create a deferred promise
 */
export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Sleep for a given duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a cancellable promise
 */
export function cancellable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let cancelled = false;
  let rejectFn: (reason: Error) => void;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    rejectFn = reject;
    promise
      .then((value) => {
        if (!cancelled) resolve(value);
      })
      .catch((error) => {
        if (!cancelled) reject(error);
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      cancelled = true;
      rejectFn(new Error('Cancelled'));
    },
  };
}

// ============================================================================
// Debounce & Throttle
// ============================================================================

/**
 * Debounce an async function
 */
export function debounce<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  wait: number
): (...args: A) => Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pending: Deferred<T> | null = null;

  return (...args: A): Promise<T> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!pending) {
      pending = deferred<T>();
    }

    const currentPending = pending;

    timeout = setTimeout(async () => {
      timeout = null;
      pending = null;

      try {
        const result = await fn(...args);
        currentPending.resolve(result);
      } catch (error) {
        currentPending.reject(error);
      }
    }, wait);

    return currentPending.promise;
  };
}

/**
 * Throttle an async function
 */
export function throttle<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  limit: number
): (...args: A) => Promise<T> {
  let lastRun = 0;
  let pending: Promise<T> | null = null;

  return async (...args: A): Promise<T> => {
    const now = Date.now();

    if (pending) {
      return pending;
    }

    if (now - lastRun >= limit) {
      lastRun = now;
      return fn(...args);
    }

    const delay = limit - (now - lastRun);
    pending = sleep(delay).then(() => {
      pending = null;
      lastRun = Date.now();
      return fn(...args);
    });

    return pending;
  };
}

// ============================================================================
// Concurrency Control
// ============================================================================

/**
 * Promise pool for concurrent execution with limit
 */
export class PromisePool<T = unknown> {
  private concurrency: number;
  private running = 0;
  private queue: PoolTask<T>[] = [];

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  async add(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.runNext();
    });
  }

  private async runNext(): Promise<void> {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running++;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running--;
      this.runNext();
    }
  }

  getStats(): { running: number; queued: number; concurrency: number } {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.concurrency,
    };
  }

  setConcurrency(n: number): void {
    this.concurrency = n;
    // Trigger queued tasks if concurrency increased
    for (let i = 0; i < n - this.running; i++) {
      this.runNext();
    }
  }
}

/**
 * Execute promises with concurrency limit
 */
export async function pool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const promisePool = new PromisePool<T>(concurrency);
  return Promise.all(tasks.map((task) => promisePool.add(task)));
}

/**
 * Execute promises in parallel with settled results
 */
export async function allSettled<T>(
  tasks: Array<() => Promise<T>>,
  concurrency?: number
): Promise<Array<BatchResult<T>>> {
  const wrapped = tasks.map(
    (task) => () =>
      task()
        .then((value): BatchResult<T> => ({ status: 'fulfilled', value }))
        .catch((reason): BatchResult<T> => ({ status: 'rejected', reason }))
  );

  if (concurrency) {
    return pool(wrapped, concurrency);
  }

  return Promise.all(wrapped.map((fn) => fn()));
}

// ============================================================================
// Batching
// ============================================================================

/**
 * Batch multiple calls into a single execution
 */
export function batch<K, V>(
  fn: (keys: K[]) => Promise<Map<K, V>>,
  options: { maxSize?: number; maxWait?: number } = {}
): (key: K) => Promise<V> {
  const { maxSize = 100, maxWait = 10 } = options;

  let queue: Array<{ key: K; deferred: Deferred<V> }> = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    const currentQueue = queue;
    queue = [];
    timeout = null;

    if (currentQueue.length === 0) return;

    const keys = currentQueue.map((item) => item.key);

    try {
      const results = await fn(keys);
      for (const item of currentQueue) {
        const value = results.get(item.key);
        if (value !== undefined) {
          item.deferred.resolve(value);
        } else {
          item.deferred.reject(new Error(`No result for key: ${String(item.key)}`));
        }
      }
    } catch (error) {
      for (const item of currentQueue) {
        item.deferred.reject(error);
      }
    }
  };

  return (key: K): Promise<V> => {
    const d = deferred<V>();
    queue.push({ key, deferred: d });

    if (queue.length >= maxSize) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      flush();
    } else if (!timeout) {
      timeout = setTimeout(flush, maxWait);
    }

    return d.promise;
  };
}

// ============================================================================
// Memoization
// ============================================================================

/**
 * Memoize an async function
 */
export function memoize<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  options: {
    keyFn?: (...args: A) => string;
    ttl?: number;
    maxSize?: number;
  } = {}
): (...args: A) => Promise<T> {
  const { keyFn = (...args) => JSON.stringify(args), ttl, maxSize = 1000 } = options;

  const cache = new Map<string, { value: T; expires?: number }>();

  return async (...args: A): Promise<T> => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!cached.expires || cached.expires > Date.now()) {
        return cached.value;
      }
      cache.delete(key);
    }

    const value = await fn(...args);

    // Evict oldest if at capacity
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl : undefined,
    });

    return value;
  };
}

// ============================================================================
// Race & First Settled
// ============================================================================

/**
 * Race promises with proper cleanup
 */
export async function race<T>(
  tasks: Array<() => Promise<T>>,
  onCancel?: (index: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;

    tasks.forEach((task, index) => {
      task()
        .then((value) => {
          if (!settled) {
            settled = true;
            resolve(value);
            // Notify other tasks they can cancel
            tasks.forEach((_, i) => {
              if (i !== index && onCancel) {
                onCancel(i);
              }
            });
          }
        })
        .catch((error) => {
          if (!settled) {
            settled = true;
            reject(error);
          }
        });
    });
  });
}

/**
 * Get the first successfully settled promise
 */
export async function firstFulfilled<T>(
  tasks: Array<() => Promise<T>>
): Promise<T> {
  const errors: Error[] = [];

  return new Promise((resolve, reject) => {
    let pending = tasks.length;

    tasks.forEach((task) => {
      task()
        .then(resolve)
        .catch((error) => {
          errors.push(error);
          pending--;
          if (pending === 0) {
            reject(new AggregateError(errors, 'All promises rejected'));
          }
        });
    });
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { interval?: number; timeout?: number } = {}
): Promise<void> {
  const { interval = 100, timeout = 30000 } = options;
  const start = Date.now();

  while (true) {
    if (await condition()) {
      return;
    }

    if (Date.now() - start > timeout) {
      throw new Error('waitFor timeout');
    }

    await sleep(interval);
  }
}

/**
 * Retry a promise until it succeeds or reaches max attempts
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  predicate: (result: T) => boolean,
  options: { maxAttempts?: number; delay?: number } = {}
): Promise<T> {
  const { maxAttempts = 10, delay = 1000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (predicate(result)) {
      return result;
    }

    if (attempt < maxAttempts) {
      await sleep(delay);
    }
  }

  throw new Error('retryUntil max attempts reached');
}

/**
 * Map with concurrency limit
 */
export async function mapAsync<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const tasks = items.map((item, index) => () => fn(item, index));
  return pool(tasks, concurrency);
}

/**
 * Filter with async predicate
 */
export async function filterAsync<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  concurrency: number = 5
): Promise<T[]> {
  const results = await mapAsync(
    items,
    async (item, index) => ({ item, keep: await predicate(item, index) }),
    concurrency
  );
  return results.filter((r) => r.keep).map((r) => r.item);
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createPool<T>(concurrency?: number): PromisePool<T> {
  return new PromisePool<T>(concurrency);
}

// ============================================================================
// AggregateError Polyfill
// ============================================================================

class AggregateError extends Error {
  errors: Error[];

  constructor(errors: Error[], message: string) {
    super(message);
    this.name = 'AggregateError';
    this.errors = errors;
  }
}
