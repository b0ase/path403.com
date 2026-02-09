/**
 * @b0ase/api-client
 *
 * Unified API client with retry, caching, and error handling.
 *
 * @packageDocumentation
 */
/** HTTP method */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
/** Request body */
type RequestBody = Record<string, unknown> | FormData | string | Uint8Array | null;
/** Request headers */
type RequestHeaders = Record<string, string>;
/** Query params */
type QueryParams = Record<string, string | number | boolean | string[] | undefined>;
/** Response type */
type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
/** Request options */
interface RequestOptions {
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
interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    retryOn?: number[];
    exponentialBackoff?: boolean;
    maxDelay?: number;
}
/** Cache options */
interface CacheOptions {
    enabled?: boolean;
    ttl?: number;
    key?: string;
    staleWhileRevalidate?: boolean;
}
/** API response */
interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    ok: boolean;
    cached?: boolean;
    retries?: number;
}
/** API error */
interface ApiError {
    message: string;
    status?: number;
    statusText?: string;
    code?: string;
    data?: unknown;
    retries?: number;
}
/** Interceptor */
interface Interceptor {
    request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    response?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
    error?: (error: ApiError) => ApiError | Promise<ApiError>;
}
/** Request config */
interface RequestConfig {
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
interface ClientConfig {
    baseUrl?: string;
    headers?: RequestHeaders;
    timeout?: number;
    retry?: RetryOptions;
    cache?: CacheOptions;
    credentials?: RequestCredentials;
    interceptors?: Interceptor[];
}
declare const DEFAULT_RETRY_OPTIONS: Required<RetryOptions>;
declare const DEFAULT_CACHE_OPTIONS: Required<CacheOptions>;
declare const DEFAULT_TIMEOUT = 30000;
declare class ApiClient {
    private baseUrl;
    private defaultHeaders;
    private defaultTimeout;
    private defaultRetry;
    private defaultCache;
    private credentials;
    private interceptors;
    private cache;
    constructor(config?: ClientConfig);
    get<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    post<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>>;
    put<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>>;
    patch<T = unknown>(url: string, body?: RequestBody, options?: RequestOptions): Promise<ApiResponse<T>>;
    delete<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    head(url: string, options?: RequestOptions): Promise<ApiResponse<void>>;
    request<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    private buildConfig;
    private executeRequest;
    private getCacheKey;
    private getFromCache;
    private setCache;
    clearCache(): void;
    invalidateCache(pattern?: string | RegExp): void;
    addInterceptor(interceptor: Interceptor): () => void;
    private calculateRetryDelay;
    private sleep;
    private normalizeError;
    setHeader(name: string, value: string): void;
    removeHeader(name: string): void;
    setBaseUrl(url: string): void;
}
declare function createApiClient(config?: ClientConfig): ApiClient;
declare function createAuthInterceptor(getToken: () => string | null | Promise<string | null>): Interceptor;
declare function createLoggingInterceptor(logger?: {
    log: (...args: unknown[]) => void;
}): Interceptor;
declare function createRetryInterceptor(options?: Partial<RetryOptions>): Interceptor;
declare function isApiError(error: unknown): error is ApiError;
declare function getErrorMessage(error: unknown): string;
declare function buildQueryString(params: QueryParams): string;
declare function parseQueryString(query: string): QueryParams;
declare function joinUrl(...parts: string[]): string;

export { ApiClient, type ApiError, type ApiResponse, type CacheOptions, type ClientConfig, DEFAULT_CACHE_OPTIONS, DEFAULT_RETRY_OPTIONS, DEFAULT_TIMEOUT, type HttpMethod, type Interceptor, type QueryParams, type RequestBody, type RequestConfig, type RequestHeaders, type RequestOptions, type ResponseType, type RetryOptions, buildQueryString, createApiClient, createAuthInterceptor, createLoggingInterceptor, createRetryInterceptor, getErrorMessage, isApiError, joinUrl, parseQueryString };
