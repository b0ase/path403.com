/**
 * @b0ase/api-client
 *
 * Unified API client with retry, caching, and error handling.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** HTTP method */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** Request body */
export type RequestBody = Record<string, unknown> | FormData | string | Uint8Array | null;

/** Request headers */
export type RequestHeaders = Record<string, string>;

/** Query params */
export type QueryParams = Record<string, string | number | boolean | string[] | undefined>;

/** Response type */
export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

/** Request options */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: RequestHeaders;
  body?: RequestBody;
  params?: QueryParams;
  responseType?: ResponseType;
  timeout?: number;
  retry?: RetryOptions;
  cache?: CacheOptions;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

/** Retry options */
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryOn?: number[];
  exponentialBackoff?: boolean;
  maxDelay?: number;
}

/** Cache options */
export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
  key?: string;
  staleWhileRevalidate?: boolean;
}

/** API response */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
  cached?: boolean;
  retries?: number;
}

/** API error */
export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  code?: string;
  data?: unknown;
  retries?: number;
}

/** Interceptor */
export interface Interceptor {
  request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  response?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  error?: (error: ApiError) => ApiError | Promise<ApiError>;
}

/** Request config */
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers: RequestHeaders;
  body?: RequestBody;
  params?: QueryParams;
  timeout: number;
  retry: Required<RetryOptions>;
  cache: Required<CacheOptions>;
  responseType: ResponseType;
}

/** Client config */
export interface ClientConfig {
  baseUrl?: string;
  headers?: RequestHeaders;
  timeout?: number;
  retry?: RetryOptions;
  cache?: CacheOptions;
  credentials?: RequestCredentials;
  interceptors?: Interceptor[];
}

/** Cache entry */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  stale?: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOn: [408, 429, 500, 502, 503, 504],
  exponentialBackoff: true,
  maxDelay: 30000,
};

export const DEFAULT_CACHE_OPTIONS: Required<CacheOptions> = {
  enabled: false,
  ttl: 60000, // 1 minute
  key: '',
  staleWhileRevalidate: false,
};

export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// API Client
// ============================================================================

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: RequestHeaders;
  private defaultTimeout: number;
  private defaultRetry: Required<RetryOptions>;
  private defaultCache: Required<CacheOptions>;
  private credentials: RequestCredentials;
  private interceptors: Interceptor[] = [];
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.defaultTimeout = config.timeout || DEFAULT_TIMEOUT;
    this.defaultRetry = { ...DEFAULT_RETRY_OPTIONS, ...config.retry };
    this.defaultCache = { ...DEFAULT_CACHE_OPTIONS, ...config.cache };
    this.credentials = config.credentials || 'same-origin';
    this.interceptors = config.interceptors || [];
  }

  // ==========================================================================
  // HTTP Methods
  // ==========================================================================

  async get<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async patch<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  async head(url: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.request<void>(url, { ...options, method: 'HEAD' });
  }

  // ==========================================================================
  // Core Request
  // ==========================================================================

  async request<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    let config = this.buildConfig(url, options);

    // Run request interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        config = await interceptor.request(config);
      }
    }

    // Check cache
    if (config.cache.enabled && config.method === 'GET') {
      const cacheKey = config.cache.key || this.getCacheKey(config);
      const cached = this.getFromCache<T>(cacheKey);

      if (cached) {
        if (!cached.stale) {
          return {
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            ok: true,
            cached: true,
          };
        }

        // Stale-while-revalidate: return stale data and refresh in background
        if (config.cache.staleWhileRevalidate) {
          this.executeRequest<T>(config).then(response => {
            this.setCache(cacheKey, response.data, config.cache.ttl);
          });

          return {
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            ok: true,
            cached: true,
          };
        }
      }
    }

    // Execute request with retry
    let lastError: ApiError | null = null;
    let retries = 0;

    while (retries <= config.retry.maxRetries) {
      try {
        const response = await this.executeRequest<T>(config);

        // Run response interceptors
        let processedResponse = response;
        for (const interceptor of this.interceptors) {
          if (interceptor.response) {
            processedResponse = await interceptor.response(processedResponse);
          }
        }

        // Cache successful GET responses
        if (config.cache.enabled && config.method === 'GET' && processedResponse.ok) {
          const cacheKey = config.cache.key || this.getCacheKey(config);
          this.setCache(cacheKey, processedResponse.data, config.cache.ttl);
        }

        processedResponse.retries = retries;
        return processedResponse;
      } catch (error) {
        lastError = this.normalizeError(error);
        lastError.retries = retries;

        // Run error interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.error) {
            lastError = await interceptor.error(lastError);
          }
        }

        // Check if should retry
        if (
          retries < config.retry.maxRetries &&
          lastError.status &&
          config.retry.retryOn.includes(lastError.status)
        ) {
          const delay = this.calculateRetryDelay(retries, config.retry);
          await this.sleep(delay);
          retries++;
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Request failed');
  }

  private buildConfig(url: string, options: RequestOptions): RequestConfig {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    return {
      url: fullUrl,
      method: options.method || 'GET',
      headers: { ...this.defaultHeaders, ...options.headers },
      body: options.body,
      params: options.params,
      timeout: options.timeout || this.defaultTimeout,
      retry: { ...this.defaultRetry, ...options.retry },
      cache: { ...this.defaultCache, ...options.cache },
      responseType: options.responseType || 'json',
    };
  }

  private async executeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      // Build URL with params
      let finalUrl = config.url;
      if (config.params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(config.params)) {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          }
        }
        const queryString = searchParams.toString();
        if (queryString) {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
        }
      }

      // Prepare body
      let body: BodyInit | undefined;
      if (config.body) {
        if (config.body instanceof FormData || typeof config.body === 'string') {
          body = config.body;
        } else if (config.body instanceof Uint8Array) {
          body = config.body.buffer.slice(
            config.body.byteOffset,
            config.body.byteOffset + config.body.byteLength
          ) as ArrayBuffer;
        } else {
          body = JSON.stringify(config.body);
        }
      }

      const response = await fetch(finalUrl, {
        method: config.method,
        headers: config.headers,
        body,
        signal: controller.signal,
        credentials: this.credentials,
      });

      // Parse response
      let data: T;
      switch (config.responseType) {
        case 'text':
          data = await response.text() as T;
          break;
        case 'blob':
          data = await response.blob() as T;
          break;
        case 'arrayBuffer':
          data = await response.arrayBuffer() as T;
          break;
        case 'formData':
          data = await response.formData() as T;
          break;
        default:
          const text = await response.text();
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = text as T;
          }
      }

      // Parse headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      if (!response.ok) {
        const error: ApiError = {
          message: response.statusText || 'Request failed',
          status: response.status,
          statusText: response.statusText,
          data,
        };
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        ok: response.ok,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ==========================================================================
  // Cache
  // ==========================================================================

  private getCacheKey(config: RequestConfig): string {
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${config.method}:${config.url}:${params}`;
  }

  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      return { ...entry, stale: true };
    }

    return entry;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      } else {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  // ==========================================================================
  // Interceptors
  // ==========================================================================

  addInterceptor(interceptor: Interceptor): () => void {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index >= 0) {
        this.interceptors.splice(index, 1);
      }
    };
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private calculateRetryDelay(attempt: number, options: Required<RetryOptions>): number {
    if (!options.exponentialBackoff) {
      return options.retryDelay;
    }

    const delay = options.retryDelay * Math.pow(2, attempt);
    return Math.min(delay, options.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeError(error: unknown): ApiError {
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>;
      return {
        message: String(e.message || 'Request failed'),
        status: typeof e.status === 'number' ? e.status : undefined,
        statusText: typeof e.statusText === 'string' ? e.statusText : undefined,
        code: typeof e.code === 'string' ? e.code : undefined,
        data: e.data,
      };
    }
    return { message: String(error) };
  }

  setHeader(name: string, value: string): void {
    this.defaultHeaders[name] = value;
  }

  removeHeader(name: string): void {
    delete this.defaultHeaders[name];
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createApiClient(config?: ClientConfig): ApiClient {
  return new ApiClient(config);
}

// ============================================================================
// Common Interceptors
// ============================================================================

export function createAuthInterceptor(getToken: () => string | null | Promise<string | null>): Interceptor {
  return {
    request: async (config) => {
      const token = await getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
  };
}

export function createLoggingInterceptor(
  logger: { log: (...args: unknown[]) => void } = console
): Interceptor {
  return {
    request: (config) => {
      logger.log(`[API] ${config.method} ${config.url}`);
      return config;
    },
    response: (response) => {
      logger.log(`[API] ${response.status} ${response.statusText}`);
      return response;
    },
    error: (error) => {
      logger.log(`[API] Error: ${error.message}`);
      return error;
    },
  };
}

export function createRetryInterceptor(options?: Partial<RetryOptions>): Interceptor {
  return {
    request: (config) => {
      config.retry = { ...config.retry, ...options };
      return config;
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }
  return searchParams.toString();
}

export function parseQueryString(query: string): QueryParams {
  const params: QueryParams = {};
  const searchParams = new URLSearchParams(query);
  for (const [key, value] of searchParams.entries()) {
    if (key in params) {
      const existing = params[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        params[key] = [String(existing), value];
      }
    } else {
      params[key] = value;
    }
  }
  return params;
}

export function joinUrl(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/+$/, '');
      }
      return part.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
}
