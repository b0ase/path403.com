"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApiClient: () => ApiClient,
  DEFAULT_CACHE_OPTIONS: () => DEFAULT_CACHE_OPTIONS,
  DEFAULT_RETRY_OPTIONS: () => DEFAULT_RETRY_OPTIONS,
  DEFAULT_TIMEOUT: () => DEFAULT_TIMEOUT,
  buildQueryString: () => buildQueryString,
  createApiClient: () => createApiClient,
  createAuthInterceptor: () => createAuthInterceptor,
  createLoggingInterceptor: () => createLoggingInterceptor,
  createRetryInterceptor: () => createRetryInterceptor,
  getErrorMessage: () => getErrorMessage,
  isApiError: () => isApiError,
  joinUrl: () => joinUrl,
  parseQueryString: () => parseQueryString
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1e3,
  retryOn: [408, 429, 500, 502, 503, 504],
  exponentialBackoff: true,
  maxDelay: 3e4
};
var DEFAULT_CACHE_OPTIONS = {
  enabled: false,
  ttl: 6e4,
  // 1 minute
  key: "",
  staleWhileRevalidate: false
};
var DEFAULT_TIMEOUT = 3e4;
var ApiClient = class {
  constructor(config = {}) {
    this.interceptors = [];
    this.cache = /* @__PURE__ */ new Map();
    this.baseUrl = config.baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers
    };
    this.defaultTimeout = config.timeout || DEFAULT_TIMEOUT;
    this.defaultRetry = { ...DEFAULT_RETRY_OPTIONS, ...config.retry };
    this.defaultCache = { ...DEFAULT_CACHE_OPTIONS, ...config.cache };
    this.credentials = config.credentials || "same-origin";
    this.interceptors = config.interceptors || [];
  }
  // ==========================================================================
  // HTTP Methods
  // ==========================================================================
  async get(url, options) {
    return this.request(url, { ...options, method: "GET" });
  }
  async post(url, body, options) {
    return this.request(url, { ...options, method: "POST", body });
  }
  async put(url, body, options) {
    return this.request(url, { ...options, method: "PUT", body });
  }
  async patch(url, body, options) {
    return this.request(url, { ...options, method: "PATCH", body });
  }
  async delete(url, options) {
    return this.request(url, { ...options, method: "DELETE" });
  }
  async head(url, options) {
    return this.request(url, { ...options, method: "HEAD" });
  }
  // ==========================================================================
  // Core Request
  // ==========================================================================
  async request(url, options = {}) {
    let config = this.buildConfig(url, options);
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        config = await interceptor.request(config);
      }
    }
    if (config.cache.enabled && config.method === "GET") {
      const cacheKey = config.cache.key || this.getCacheKey(config);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        if (!cached.stale) {
          return {
            data: cached.data,
            status: 200,
            statusText: "OK",
            headers: {},
            ok: true,
            cached: true
          };
        }
        if (config.cache.staleWhileRevalidate) {
          this.executeRequest(config).then((response) => {
            this.setCache(cacheKey, response.data, config.cache.ttl);
          });
          return {
            data: cached.data,
            status: 200,
            statusText: "OK",
            headers: {},
            ok: true,
            cached: true
          };
        }
      }
    }
    let lastError = null;
    let retries = 0;
    while (retries <= config.retry.maxRetries) {
      try {
        const response = await this.executeRequest(config);
        let processedResponse = response;
        for (const interceptor of this.interceptors) {
          if (interceptor.response) {
            processedResponse = await interceptor.response(processedResponse);
          }
        }
        if (config.cache.enabled && config.method === "GET" && processedResponse.ok) {
          const cacheKey = config.cache.key || this.getCacheKey(config);
          this.setCache(cacheKey, processedResponse.data, config.cache.ttl);
        }
        processedResponse.retries = retries;
        return processedResponse;
      } catch (error) {
        lastError = this.normalizeError(error);
        lastError.retries = retries;
        for (const interceptor of this.interceptors) {
          if (interceptor.error) {
            lastError = await interceptor.error(lastError);
          }
        }
        if (retries < config.retry.maxRetries && lastError.status && config.retry.retryOn.includes(lastError.status)) {
          const delay = this.calculateRetryDelay(retries, config.retry);
          await this.sleep(delay);
          retries++;
          continue;
        }
        throw lastError;
      }
    }
    throw lastError || new Error("Request failed");
  }
  buildConfig(url, options) {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;
    return {
      url: fullUrl,
      method: options.method || "GET",
      headers: { ...this.defaultHeaders, ...options.headers },
      body: options.body,
      params: options.params,
      timeout: options.timeout || this.defaultTimeout,
      retry: { ...this.defaultRetry, ...options.retry },
      cache: { ...this.defaultCache, ...options.cache },
      responseType: options.responseType || "json"
    };
  }
  async executeRequest(config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    try {
      let finalUrl = config.url;
      if (config.params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(config.params)) {
          if (value !== void 0) {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          }
        }
        const queryString = searchParams.toString();
        if (queryString) {
          finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
        }
      }
      let body;
      if (config.body) {
        if (config.body instanceof FormData || typeof config.body === "string") {
          body = config.body;
        } else if (config.body instanceof Uint8Array) {
          body = config.body.buffer.slice(
            config.body.byteOffset,
            config.body.byteOffset + config.body.byteLength
          );
        } else {
          body = JSON.stringify(config.body);
        }
      }
      const response = await fetch(finalUrl, {
        method: config.method,
        headers: config.headers,
        body,
        signal: controller.signal,
        credentials: this.credentials
      });
      let data;
      switch (config.responseType) {
        case "text":
          data = await response.text();
          break;
        case "blob":
          data = await response.blob();
          break;
        case "arrayBuffer":
          data = await response.arrayBuffer();
          break;
        case "formData":
          data = await response.formData();
          break;
        default:
          const text = await response.text();
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = text;
          }
      }
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      if (!response.ok) {
        const error = {
          message: response.statusText || "Request failed",
          status: response.status,
          statusText: response.statusText,
          data
        };
        throw error;
      }
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        ok: response.ok
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
  // ==========================================================================
  // Cache
  // ==========================================================================
  getCacheKey(config) {
    const params = config.params ? JSON.stringify(config.params) : "";
    return `${config.method}:${config.url}:${params}`;
  }
  getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (now > entry.expiresAt) {
      return { ...entry, stale: true };
    }
    return entry;
  }
  setCache(key, data, ttl) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }
  clearCache() {
    this.cache.clear();
  }
  invalidateCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (typeof pattern === "string") {
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
  addInterceptor(interceptor) {
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
  calculateRetryDelay(attempt, options) {
    if (!options.exponentialBackoff) {
      return options.retryDelay;
    }
    const delay = options.retryDelay * Math.pow(2, attempt);
    return Math.min(delay, options.maxDelay);
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  normalizeError(error) {
    if (typeof error === "object" && error !== null) {
      const e = error;
      return {
        message: String(e.message || "Request failed"),
        status: typeof e.status === "number" ? e.status : void 0,
        statusText: typeof e.statusText === "string" ? e.statusText : void 0,
        code: typeof e.code === "string" ? e.code : void 0,
        data: e.data
      };
    }
    return { message: String(error) };
  }
  setHeader(name, value) {
    this.defaultHeaders[name] = value;
  }
  removeHeader(name) {
    delete this.defaultHeaders[name];
  }
  setBaseUrl(url) {
    this.baseUrl = url;
  }
};
function createApiClient(config) {
  return new ApiClient(config);
}
function createAuthInterceptor(getToken) {
  return {
    request: async (config) => {
      const token = await getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    }
  };
}
function createLoggingInterceptor(logger = console) {
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
    }
  };
}
function createRetryInterceptor(options) {
  return {
    request: (config) => {
      config.retry = { ...config.retry, ...options };
      return config;
    }
  };
}
function isApiError(error) {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string";
}
function getErrorMessage(error) {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }
  return searchParams.toString();
}
function parseQueryString(query) {
  const params = {};
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
function joinUrl(...parts) {
  return parts.map((part, index) => {
    if (index === 0) {
      return part.replace(/\/+$/, "");
    }
    return part.replace(/^\/+/, "").replace(/\/+$/, "");
  }).filter(Boolean).join("/");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient,
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_RETRY_OPTIONS,
  DEFAULT_TIMEOUT,
  buildQueryString,
  createApiClient,
  createAuthInterceptor,
  createLoggingInterceptor,
  createRetryInterceptor,
  getErrorMessage,
  isApiError,
  joinUrl,
  parseQueryString
});
//# sourceMappingURL=index.cjs.map