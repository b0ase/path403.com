/**
 * @b0ase/supabase-service
 *
 * Supabase client patterns and typed database utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Database table names */
export type TableName = string;

/** Query operator */
export type QueryOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'contains'
  | 'containedBy'
  | 'overlap';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Realtime event type */
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/** Auth provider */
export type AuthProvider =
  | 'email'
  | 'phone'
  | 'google'
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'discord'
  | 'twitter'
  | 'facebook'
  | 'apple'
  | 'azure';

/** Storage bucket */
export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

/** Query filter */
export interface QueryFilter {
  column: string;
  operator: QueryOperator;
  value: unknown;
}

/** Query options */
export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { column: string; direction: SortDirection }[];
  limit?: number;
  offset?: number;
  select?: string;
  count?: 'exact' | 'planned' | 'estimated';
}

/** Realtime subscription */
export interface RealtimeSubscription {
  id: string;
  table: string;
  event: RealtimeEvent;
  filter?: string;
  callback: (payload: RealtimePayload) => void;
  unsubscribe: () => void;
}

/** Realtime payload */
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: RealtimeEvent;
  new: T | null;
  old: T | null;
  table: string;
  schema: string;
  commitTimestamp: string;
}

/** User session */
export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
  user: UserProfile;
}

/** User profile */
export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  emailConfirmedAt?: string;
  phoneConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
}

/** Auth state */
export interface AuthState {
  session: UserSession | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/** Database error */
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

/** Query result */
export interface QueryResult<T> {
  data: T[] | null;
  error: DatabaseError | null;
  count: number | null;
  status: number;
  statusText: string;
}

/** Single result */
export interface SingleResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

/** Mutation result */
export interface MutationResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

/** Storage file */
export interface StorageFile {
  id: string;
  name: string;
  bucket: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}

/** Upload options */
export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

/** RPC function */
export interface RPCFunction {
  name: string;
  args?: Record<string, unknown>;
}

/** Service config */
export interface ServiceConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  schema?: string;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

// ============================================================================
// Query Builder
// ============================================================================

export class QueryBuilder<T = Record<string, unknown>> {
  private tableName: string;
  private options: QueryOptions = {};
  private isSingle = false;

  constructor(table: string) {
    this.tableName = table;
  }

  select(columns: string = '*'): this {
    this.options.select = columns;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.addFilter(column, 'eq', value);
    return this;
  }

  neq(column: string, value: unknown): this {
    this.addFilter(column, 'neq', value);
    return this;
  }

  gt(column: string, value: unknown): this {
    this.addFilter(column, 'gt', value);
    return this;
  }

  gte(column: string, value: unknown): this {
    this.addFilter(column, 'gte', value);
    return this;
  }

  lt(column: string, value: unknown): this {
    this.addFilter(column, 'lt', value);
    return this;
  }

  lte(column: string, value: unknown): this {
    this.addFilter(column, 'lte', value);
    return this;
  }

  like(column: string, pattern: string): this {
    this.addFilter(column, 'like', pattern);
    return this;
  }

  ilike(column: string, pattern: string): this {
    this.addFilter(column, 'ilike', pattern);
    return this;
  }

  is(column: string, value: boolean | null): this {
    this.addFilter(column, 'is', value);
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.addFilter(column, 'in', values);
    return this;
  }

  contains(column: string, value: unknown): this {
    this.addFilter(column, 'contains', value);
    return this;
  }

  containedBy(column: string, value: unknown): this {
    this.addFilter(column, 'containedBy', value);
    return this;
  }

  overlap(column: string, value: unknown[]): this {
    this.addFilter(column, 'overlap', value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    if (!this.options.orderBy) {
      this.options.orderBy = [];
    }
    this.options.orderBy.push({
      column,
      direction: options?.ascending === false ? 'desc' : 'asc',
    });
    return this;
  }

  limit(count: number): this {
    this.options.limit = count;
    return this;
  }

  range(from: number, to: number): this {
    this.options.offset = from;
    this.options.limit = to - from + 1;
    return this;
  }

  single(): this {
    this.isSingle = true;
    this.options.limit = 1;
    return this;
  }

  maybeSingle(): this {
    this.isSingle = true;
    this.options.limit = 1;
    return this;
  }

  private addFilter(column: string, operator: QueryOperator, value: unknown): void {
    if (!this.options.filters) {
      this.options.filters = [];
    }
    this.options.filters.push({ column, operator, value });
  }

  getTable(): string {
    return this.tableName;
  }

  getOptions(): QueryOptions {
    return { ...this.options };
  }

  isSingleResult(): boolean {
    return this.isSingle;
  }
}

// ============================================================================
// Service Manager
// ============================================================================

export class SupabaseService {
  private config: ServiceConfig;
  private authState: AuthState = {
    session: null,
    user: null,
    isLoading: true,
    error: null,
  };
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private authListeners: Set<(state: AuthState) => void> = new Set();

  constructor(config: ServiceConfig) {
    this.config = {
      schema: 'public',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      ...config,
    };
  }

  // ==========================================================================
  // Database Operations
  // ==========================================================================

  from<T = Record<string, unknown>>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  }

  buildSelectUrl(query: QueryBuilder): string {
    const table = query.getTable();
    const options = query.getOptions();
    const params = new URLSearchParams();

    if (options.select) {
      params.set('select', options.select);
    }

    if (options.filters) {
      for (const filter of options.filters) {
        const value = this.formatFilterValue(filter.operator, filter.value);
        params.append(filter.column, `${filter.operator}.${value}`);
      }
    }

    if (options.orderBy) {
      const orderStr = options.orderBy
        .map(o => `${o.column}.${o.direction}`)
        .join(',');
      params.set('order', orderStr);
    }

    if (options.limit !== undefined) {
      params.set('limit', String(options.limit));
    }

    if (options.offset !== undefined) {
      params.set('offset', String(options.offset));
    }

    return `${this.config.url}/rest/v1/${table}?${params.toString()}`;
  }

  private formatFilterValue(operator: QueryOperator, value: unknown): string {
    if (operator === 'in' && Array.isArray(value)) {
      return `(${value.join(',')})`;
    }
    if (value === null) {
      return 'null';
    }
    return String(value);
  }

  buildInsertUrl(table: string): string {
    return `${this.config.url}/rest/v1/${table}`;
  }

  buildUpdateUrl(table: string): string {
    return `${this.config.url}/rest/v1/${table}`;
  }

  buildDeleteUrl(table: string): string {
    return `${this.config.url}/rest/v1/${table}`;
  }

  buildRpcUrl(functionName: string): string {
    return `${this.config.url}/rest/v1/rpc/${functionName}`;
  }

  getHeaders(options?: { preferReturn?: 'minimal' | 'representation' }): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.authState.session?.accessToken || this.config.anonKey}`,
    };

    if (options?.preferReturn) {
      headers['Prefer'] = `return=${options.preferReturn}`;
    }

    return headers;
  }

  // ==========================================================================
  // Auth Operations
  // ==========================================================================

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.authListeners.add(callback);
    callback(this.authState);
    return () => this.authListeners.delete(callback);
  }

  private notifyAuthListeners(): void {
    const state = this.getAuthState();
    for (const listener of this.authListeners) {
      listener(state);
    }
  }

  setSession(session: UserSession | null): void {
    this.authState = {
      session,
      user: session?.user || null,
      isLoading: false,
      error: null,
    };
    this.notifyAuthListeners();
  }

  setAuthError(error: string): void {
    this.authState = {
      ...this.authState,
      isLoading: false,
      error,
    };
    this.notifyAuthListeners();
  }

  setAuthLoading(isLoading: boolean): void {
    this.authState = {
      ...this.authState,
      isLoading,
    };
    this.notifyAuthListeners();
  }

  signOut(): void {
    this.authState = {
      session: null,
      user: null,
      isLoading: false,
      error: null,
    };
    this.notifyAuthListeners();
  }

  buildAuthUrl(path: string): string {
    return `${this.config.url}/auth/v1${path}`;
  }

  // ==========================================================================
  // Realtime Operations
  // ==========================================================================

  subscribe(
    table: string,
    event: RealtimeEvent,
    callback: (payload: RealtimePayload) => void,
    filter?: string
  ): RealtimeSubscription {
    const id = `${table}:${event}:${Date.now()}`;

    const subscription: RealtimeSubscription = {
      id,
      table,
      event,
      filter,
      callback,
      unsubscribe: () => {
        this.subscriptions.delete(id);
      },
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  getSubscriptions(): RealtimeSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  unsubscribeAll(): void {
    this.subscriptions.clear();
  }

  buildRealtimeUrl(): string {
    const wsUrl = this.config.url.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsUrl}/realtime/v1/websocket?apikey=${this.config.anonKey}`;
  }

  // ==========================================================================
  // Storage Operations
  // ==========================================================================

  buildStorageUrl(bucket: string, path: string): string {
    return `${this.config.url}/storage/v1/object/${bucket}/${path}`;
  }

  buildPublicUrl(bucket: string, path: string): string {
    return `${this.config.url}/storage/v1/object/public/${bucket}/${path}`;
  }

  buildSignedUrl(bucket: string, path: string, expiresIn: number): string {
    return `${this.config.url}/storage/v1/object/sign/${bucket}/${path}?expiresIn=${expiresIn}`;
  }

  // ==========================================================================
  // Edge Functions
  // ==========================================================================

  buildFunctionUrl(functionName: string): string {
    return `${this.config.url}/functions/v1/${functionName}`;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  getConfig(): ServiceConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createSupabaseService(config: ServiceConfig): SupabaseService {
  return new SupabaseService(config);
}

export function createQueryBuilder<T = Record<string, unknown>>(table: string): QueryBuilder<T> {
  return new QueryBuilder<T>(table);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function parsePostgrestError(error: unknown): DatabaseError {
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    return {
      code: String(e.code || 'UNKNOWN'),
      message: String(e.message || 'An unknown error occurred'),
      details: e.details ? String(e.details) : undefined,
      hint: e.hint ? String(e.hint) : undefined,
    };
  }
  return {
    code: 'UNKNOWN',
    message: String(error),
  };
}

export function isAuthError(error: DatabaseError): boolean {
  return error.code.startsWith('PGRST3') || error.code === '401' || error.code === '403';
}

export function isNotFoundError(error: DatabaseError): boolean {
  return error.code === 'PGRST116' || error.code === '404';
}

export function isConflictError(error: DatabaseError): boolean {
  return error.code === '23505' || error.code === '409';
}

export function isValidationError(error: DatabaseError): boolean {
  return error.code.startsWith('22') || error.code.startsWith('23');
}

export function formatFilterParams(filters: QueryFilter[]): Record<string, string> {
  const params: Record<string, string> = {};
  for (const filter of filters) {
    const value = Array.isArray(filter.value)
      ? `(${filter.value.join(',')})`
      : String(filter.value);
    params[filter.column] = `${filter.operator}.${value}`;
  }
  return params;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds <= now;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
