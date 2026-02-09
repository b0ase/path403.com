// src/index.ts
var DEFAULT_RETRY_OPTIONS = {
  maxAttempts: 3,
  baseDelay: 1e3,
  maxDelay: 3e4,
  factor: 2,
  jitter: true
};
var DEFAULT_CIRCUIT_BREAKER_OPTIONS = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 6e4,
  halfOpenLimit: 1
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function calculateDelay(attempt, baseDelay, maxDelay, factor, jitter) {
  let delay = Math.min(baseDelay * Math.pow(factor, attempt - 1), maxDelay);
  if (jitter) {
    delay = delay * (0.5 + Math.random());
  }
  return Math.round(delay);
}
async function retry(fn, options = {}) {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError;
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
async function retryWithResult(fn, options = {}) {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError;
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const data = config.timeout ? await withTimeout(fn(), config.timeout) : await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime
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
    totalTime: Date.now() - startTime
  };
}
var TimeoutError = class extends Error {
  constructor(ms) {
    super(`Operation timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
};
async function withTimeout(promise, ms) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}
var CircuitBreaker = class {
  constructor(options = {}) {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.halfOpenCalls = 0;
    this.options = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options };
  }
  // ==========================================================================
  // State Management
  // ==========================================================================
  getState() {
    if (this.state === "open" && this.shouldTransitionToHalfOpen()) {
      this.transitionTo("half-open");
    }
    return this.state;
  }
  isOpen() {
    return this.getState() === "open";
  }
  isClosed() {
    return this.getState() === "closed";
  }
  isHalfOpen() {
    return this.getState() === "half-open";
  }
  shouldTransitionToHalfOpen() {
    return this.state === "open" && this.lastFailure !== void 0 && Date.now() - this.lastFailure >= this.options.timeout;
  }
  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    if (newState === "closed") {
      this.failures = 0;
      this.successes = 0;
    } else if (newState === "half-open") {
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
  async execute(fn) {
    const state = this.getState();
    if (state === "open") {
      throw new CircuitBreakerError("Circuit breaker is open");
    }
    if (state === "half-open" && this.halfOpenCalls >= this.options.halfOpenLimit) {
      throw new CircuitBreakerError("Circuit breaker half-open limit reached");
    }
    if (state === "half-open") {
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
  recordSuccess() {
    if (this.state === "half-open") {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.transitionTo("closed");
      }
    } else if (this.state === "closed") {
      this.failures = 0;
    }
  }
  recordFailure() {
    if (this.state === "half-open") {
      this.transitionTo("open");
      this.lastFailure = Date.now();
    } else if (this.state === "closed") {
      this.failures++;
      if (this.failures >= this.options.failureThreshold) {
        this.transitionTo("open");
        this.lastFailure = Date.now();
      }
    }
  }
  // ==========================================================================
  // Manual Control
  // ==========================================================================
  reset() {
    this.transitionTo("closed");
    this.lastFailure = void 0;
  }
  trip() {
    this.transitionTo("open");
    this.lastFailure = Date.now();
  }
  // ==========================================================================
  // Stats
  // ==========================================================================
  getStats() {
    return {
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure
    };
  }
};
var CircuitBreakerError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CircuitBreakerError";
  }
};
function createCircuitBreaker(options) {
  return new CircuitBreaker(options);
}
function withRetry(fn, options) {
  return ((...args) => retry(() => fn(...args), options));
}
function withCircuitBreaker(fn, breaker) {
  return ((...args) => breaker.execute(() => fn(...args)));
}
function isRetryableError(error) {
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return true;
  }
  if (error instanceof TimeoutError) {
    return true;
  }
  const retryableMessages = [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "rate limit",
    "429",
    "503",
    "502",
    "504"
  ];
  return retryableMessages.some(
    (msg) => error.message.toLowerCase().includes(msg.toLowerCase())
  );
}
function createRetryableFunction(fn, options) {
  return () => retryWithResult(fn, options);
}
export {
  CircuitBreaker,
  CircuitBreakerError,
  DEFAULT_CIRCUIT_BREAKER_OPTIONS,
  DEFAULT_RETRY_OPTIONS,
  TimeoutError,
  createCircuitBreaker,
  createRetryableFunction,
  isRetryableError,
  retry,
  retryWithResult,
  withCircuitBreaker,
  withRetry,
  withTimeout
};
//# sourceMappingURL=index.js.map