// src/index.ts
var QueryBuilder = class {
  constructor(table) {
    this.options = {};
    this.isSingle = false;
    this.tableName = table;
  }
  select(columns = "*") {
    this.options.select = columns;
    return this;
  }
  eq(column, value) {
    this.addFilter(column, "eq", value);
    return this;
  }
  neq(column, value) {
    this.addFilter(column, "neq", value);
    return this;
  }
  gt(column, value) {
    this.addFilter(column, "gt", value);
    return this;
  }
  gte(column, value) {
    this.addFilter(column, "gte", value);
    return this;
  }
  lt(column, value) {
    this.addFilter(column, "lt", value);
    return this;
  }
  lte(column, value) {
    this.addFilter(column, "lte", value);
    return this;
  }
  like(column, pattern) {
    this.addFilter(column, "like", pattern);
    return this;
  }
  ilike(column, pattern) {
    this.addFilter(column, "ilike", pattern);
    return this;
  }
  is(column, value) {
    this.addFilter(column, "is", value);
    return this;
  }
  in(column, values) {
    this.addFilter(column, "in", values);
    return this;
  }
  contains(column, value) {
    this.addFilter(column, "contains", value);
    return this;
  }
  containedBy(column, value) {
    this.addFilter(column, "containedBy", value);
    return this;
  }
  overlap(column, value) {
    this.addFilter(column, "overlap", value);
    return this;
  }
  order(column, options) {
    if (!this.options.orderBy) {
      this.options.orderBy = [];
    }
    this.options.orderBy.push({
      column,
      direction: options?.ascending === false ? "desc" : "asc"
    });
    return this;
  }
  limit(count) {
    this.options.limit = count;
    return this;
  }
  range(from, to) {
    this.options.offset = from;
    this.options.limit = to - from + 1;
    return this;
  }
  single() {
    this.isSingle = true;
    this.options.limit = 1;
    return this;
  }
  maybeSingle() {
    this.isSingle = true;
    this.options.limit = 1;
    return this;
  }
  addFilter(column, operator, value) {
    if (!this.options.filters) {
      this.options.filters = [];
    }
    this.options.filters.push({ column, operator, value });
  }
  getTable() {
    return this.tableName;
  }
  getOptions() {
    return { ...this.options };
  }
  isSingleResult() {
    return this.isSingle;
  }
};
var SupabaseService = class {
  constructor(config) {
    this.authState = {
      session: null,
      user: null,
      isLoading: true,
      error: null
    };
    this.subscriptions = /* @__PURE__ */ new Map();
    this.authListeners = /* @__PURE__ */ new Set();
    this.config = {
      schema: "public",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      ...config
    };
  }
  // ==========================================================================
  // Database Operations
  // ==========================================================================
  from(table) {
    return new QueryBuilder(table);
  }
  buildSelectUrl(query) {
    const table = query.getTable();
    const options = query.getOptions();
    const params = new URLSearchParams();
    if (options.select) {
      params.set("select", options.select);
    }
    if (options.filters) {
      for (const filter of options.filters) {
        const value = this.formatFilterValue(filter.operator, filter.value);
        params.append(filter.column, `${filter.operator}.${value}`);
      }
    }
    if (options.orderBy) {
      const orderStr = options.orderBy.map((o) => `${o.column}.${o.direction}`).join(",");
      params.set("order", orderStr);
    }
    if (options.limit !== void 0) {
      params.set("limit", String(options.limit));
    }
    if (options.offset !== void 0) {
      params.set("offset", String(options.offset));
    }
    return `${this.config.url}/rest/v1/${table}?${params.toString()}`;
  }
  formatFilterValue(operator, value) {
    if (operator === "in" && Array.isArray(value)) {
      return `(${value.join(",")})`;
    }
    if (value === null) {
      return "null";
    }
    return String(value);
  }
  buildInsertUrl(table) {
    return `${this.config.url}/rest/v1/${table}`;
  }
  buildUpdateUrl(table) {
    return `${this.config.url}/rest/v1/${table}`;
  }
  buildDeleteUrl(table) {
    return `${this.config.url}/rest/v1/${table}`;
  }
  buildRpcUrl(functionName) {
    return `${this.config.url}/rest/v1/rpc/${functionName}`;
  }
  getHeaders(options) {
    const headers = {
      "Content-Type": "application/json",
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.authState.session?.accessToken || this.config.anonKey}`
    };
    if (options?.preferReturn) {
      headers["Prefer"] = `return=${options.preferReturn}`;
    }
    return headers;
  }
  // ==========================================================================
  // Auth Operations
  // ==========================================================================
  getAuthState() {
    return { ...this.authState };
  }
  onAuthStateChange(callback) {
    this.authListeners.add(callback);
    callback(this.authState);
    return () => this.authListeners.delete(callback);
  }
  notifyAuthListeners() {
    const state = this.getAuthState();
    for (const listener of this.authListeners) {
      listener(state);
    }
  }
  setSession(session) {
    this.authState = {
      session,
      user: session?.user || null,
      isLoading: false,
      error: null
    };
    this.notifyAuthListeners();
  }
  setAuthError(error) {
    this.authState = {
      ...this.authState,
      isLoading: false,
      error
    };
    this.notifyAuthListeners();
  }
  setAuthLoading(isLoading) {
    this.authState = {
      ...this.authState,
      isLoading
    };
    this.notifyAuthListeners();
  }
  signOut() {
    this.authState = {
      session: null,
      user: null,
      isLoading: false,
      error: null
    };
    this.notifyAuthListeners();
  }
  buildAuthUrl(path) {
    return `${this.config.url}/auth/v1${path}`;
  }
  // ==========================================================================
  // Realtime Operations
  // ==========================================================================
  subscribe(table, event, callback, filter) {
    const id = `${table}:${event}:${Date.now()}`;
    const subscription = {
      id,
      table,
      event,
      filter,
      callback,
      unsubscribe: () => {
        this.subscriptions.delete(id);
      }
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }
  unsubscribeAll() {
    this.subscriptions.clear();
  }
  buildRealtimeUrl() {
    const wsUrl = this.config.url.replace("https://", "wss://").replace("http://", "ws://");
    return `${wsUrl}/realtime/v1/websocket?apikey=${this.config.anonKey}`;
  }
  // ==========================================================================
  // Storage Operations
  // ==========================================================================
  buildStorageUrl(bucket, path) {
    return `${this.config.url}/storage/v1/object/${bucket}/${path}`;
  }
  buildPublicUrl(bucket, path) {
    return `${this.config.url}/storage/v1/object/public/${bucket}/${path}`;
  }
  buildSignedUrl(bucket, path, expiresIn) {
    return `${this.config.url}/storage/v1/object/sign/${bucket}/${path}?expiresIn=${expiresIn}`;
  }
  // ==========================================================================
  // Edge Functions
  // ==========================================================================
  buildFunctionUrl(functionName) {
    return `${this.config.url}/functions/v1/${functionName}`;
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  getConfig() {
    return { ...this.config };
  }
};
function createSupabaseService(config) {
  return new SupabaseService(config);
}
function createQueryBuilder(table) {
  return new QueryBuilder(table);
}
function parsePostgrestError(error) {
  if (typeof error === "object" && error !== null) {
    const e = error;
    return {
      code: String(e.code || "UNKNOWN"),
      message: String(e.message || "An unknown error occurred"),
      details: e.details ? String(e.details) : void 0,
      hint: e.hint ? String(e.hint) : void 0
    };
  }
  return {
    code: "UNKNOWN",
    message: String(error)
  };
}
function isAuthError(error) {
  return error.code.startsWith("PGRST3") || error.code === "401" || error.code === "403";
}
function isNotFoundError(error) {
  return error.code === "PGRST116" || error.code === "404";
}
function isConflictError(error) {
  return error.code === "23505" || error.code === "409";
}
function isValidationError(error) {
  return error.code.startsWith("22") || error.code.startsWith("23");
}
function formatFilterParams(filters) {
  const params = {};
  for (const filter of filters) {
    const value = Array.isArray(filter.value) ? `(${filter.value.join(",")})` : String(filter.value);
    params[filter.column] = `${filter.operator}.${value}`;
  }
  return params;
}
function parseJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
function isTokenExpired(token, bufferSeconds = 60) {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const now = Math.floor(Date.now() / 1e3);
  return payload.exp - bufferSeconds <= now;
}
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
export {
  QueryBuilder,
  SupabaseService,
  createQueryBuilder,
  createSupabaseService,
  formatFilterParams,
  generateUUID,
  isAuthError,
  isConflictError,
  isNotFoundError,
  isTokenExpired,
  isValidationError,
  parseJwtPayload,
  parsePostgrestError
};
//# sourceMappingURL=index.js.map