/**
 * @b0ase/retry-utils
 *
 * Retry utilities with exponential backoff and circuit breaker.
 *
 * @packageDocumentation
 */
/** Retry options */
interface RetryOptions {
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
interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    attempts: number;
    totalTime: number;
}
/** Circuit breaker options */
interface CircuitBreakerOptions {
    failureThreshold?: number;
    successThreshold?: number;
    timeout?: number;
    halfOpenLimit?: number;
    onStateChange?: (from: CircuitState, to: CircuitState) => void;
}
/** Circuit breaker state */
type CircuitState = 'closed' | 'open' | 'half-open';
declare const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'retryIf' | 'onRetry' | 'timeout'>>;
declare const DEFAULT_CIRCUIT_BREAKER_OPTIONS: Required<Omit<CircuitBreakerOptions, 'onStateChange'>>;
declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
declare function retryWithResult<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<RetryResult<T>>;
declare class TimeoutError extends Error {
    constructor(ms: number);
}
declare function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
declare class CircuitBreaker {
    private state;
    private failures;
    private successes;
    private lastFailure?;
    private halfOpenCalls;
    private options;
    constructor(options?: CircuitBreakerOptions);
    getState(): CircuitState;
    isOpen(): boolean;
    isClosed(): boolean;
    isHalfOpen(): boolean;
    private shouldTransitionToHalfOpen;
    private transitionTo;
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private recordSuccess;
    private recordFailure;
    reset(): void;
    trip(): void;
    getStats(): {
        state: CircuitState;
        failures: number;
        successes: number;
        lastFailure?: number;
    };
}
declare class CircuitBreakerError extends Error {
    constructor(message: string);
}
declare function createCircuitBreaker(options?: CircuitBreakerOptions): CircuitBreaker;
declare function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, options?: RetryOptions): T;
declare function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, breaker: CircuitBreaker): T;
declare function isRetryableError(error: Error): boolean;
declare function createRetryableFunction<T>(fn: () => Promise<T>, options?: RetryOptions): () => Promise<RetryResult<T>>;

export { CircuitBreaker, CircuitBreakerError, type CircuitBreakerOptions, type CircuitState, DEFAULT_CIRCUIT_BREAKER_OPTIONS, DEFAULT_RETRY_OPTIONS, type RetryOptions, type RetryResult, TimeoutError, createCircuitBreaker, createRetryableFunction, isRetryableError, retry, retryWithResult, withCircuitBreaker, withRetry, withTimeout };
