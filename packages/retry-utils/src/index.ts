/**
 * @b0ase/retry-utils
 *
 * Retry utilities with exponential backoff and circuit breaker.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Retry options */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  retryIf?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  timeout?: number;
}

/** Retry result */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/** Circuit breaker options */
export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  halfOpenLimit?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

/** Circuit breaker state */
export type CircuitState = 'closed' | 'open' | 'half-open';

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'retryIf' | 'onRetry' | 'timeout'>> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  factor: 2,
  jitter: true,
};

export const DEFAULT_CIRCUIT_BREAKER_OPTIONS: Required<Omit<CircuitBreakerOptions, 'onStateChange'>> = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  halfOpenLimit: 1,
};

// ============================================================================
// Delay Utilities
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  factor: number,
  jitter: boolean
): number {
  let delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);

  if (jitter) {
    delay = delay * (0.5 + Math.random());
  }

  return Math.round(delay);
}

// ============================================================================
// Retry Functions
// ============================================================================

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      if (config.timeout) {
        return await withTimeout(fn(), config.timeout);
      }
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === config.maxAttempts) {
        break;
      }

      if (config.retryIf && !config.retryIf(lastError, attempt)) {
        break;
      }

      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.factor,
        config.jitter
      );

      if (config.onRetry) {
        config.onRetry(lastError, attempt, delay);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

export async function retryWithResult<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const data = config.timeout ? await withTimeout(fn(), config.timeout) : await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === config.maxAttempts) {
        break;
      }

      if (config.retryIf && !config.retryIf(lastError, attempt)) {
        break;
      }

      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.factor,
        config.jitter
      );

      if (config.onRetry) {
        config.onRetry(lastError, attempt, delay);
      }

      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: config.maxAttempts,
    totalTime: Date.now() - startTime,
  };
}

// ============================================================================
// Timeout Utilities
// ============================================================================

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// ============================================================================
// Circuit Breaker
// ============================================================================

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailure?: number;
  private halfOpenCalls = 0;
  private options: Required<Omit<CircuitBreakerOptions, 'onStateChange'>> & Pick<CircuitBreakerOptions, 'onStateChange'>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options };
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  getState(): CircuitState {
    if (this.state === 'open' && this.shouldTransitionToHalfOpen()) {
      this.transitionTo('half-open');
    }
    return this.state;
  }

  isOpen(): boolean {
    return this.getState() === 'open';
  }

  isClosed(): boolean {
    return this.getState() === 'closed';
  }

  isHalfOpen(): boolean {
    return this.getState() === 'half-open';
  }

  private shouldTransitionToHalfOpen(): boolean {
    return (
      this.state === 'open' &&
      this.lastFailure !== undefined &&
      Date.now() - this.lastFailure >= this.options.timeout
    );
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === 'closed') {
      this.failures = 0;
      this.successes = 0;
    } else if (newState === 'half-open') {
      this.halfOpenCalls = 0;
      this.successes = 0;
    }

    if (this.options.onStateChange) {
      this.options.onStateChange(oldState, newState);
    }
  }

  // ==========================================================================
  // Execution
  // ==========================================================================

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === 'open') {
      throw new CircuitBreakerError('Circuit breaker is open');
    }

    if (state === 'half-open' && this.halfOpenCalls >= this.options.halfOpenLimit) {
      throw new CircuitBreakerError('Circuit breaker half-open limit reached');
    }

    if (state === 'half-open') {
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.transitionTo('closed');
      }
    } else if (this.state === 'closed') {
      this.failures = 0; // Reset on success
    }
  }

  private recordFailure(): void {
    if (this.state === 'half-open') {
      this.transitionTo('open');
      this.lastFailure = Date.now();
    } else if (this.state === 'closed') {
      this.failures++;
      if (this.failures >= this.options.failureThreshold) {
        this.transitionTo('open');
        this.lastFailure = Date.now();
      }
    }
  }

  // ==========================================================================
  // Manual Control
  // ==========================================================================

  reset(): void {
    this.transitionTo('closed');
    this.lastFailure = undefined;
  }

  trip(): void {
    this.transitionTo('open');
    this.lastFailure = Date.now();
  }

  // ==========================================================================
  // Stats
  // ==========================================================================

  getStats(): {
    state: CircuitState;
    failures: number;
    successes: number;
    lastFailure?: number;
  } {
    return {
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
    };
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createCircuitBreaker(options?: CircuitBreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}

export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: RetryOptions
): T {
  return ((...args: unknown[]) => retry(() => fn(...args), options)) as T;
}

export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  breaker: CircuitBreaker
): T {
  return ((...args: unknown[]) => breaker.execute(() => fn(...args))) as T;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors
  if (error instanceof TimeoutError) {
    return true;
  }

  // Common retryable error messages
  const retryableMessages = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'rate limit',
    '429',
    '503',
    '502',
    '504',
  ];

  return retryableMessages.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

export function createRetryableFunction<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): () => Promise<RetryResult<T>> {
  return () => retryWithResult(fn, options);
}
