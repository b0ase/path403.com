/**
 * @b0ase/supabase-service
 *
 * Supabase client patterns and typed database utilities.
 *
 * @packageDocumentation
 */
/** Database table names */
type TableName = string;
/** Query operator */
type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'contains' | 'containedBy' | 'overlap';
/** Sort direction */
type SortDirection = 'asc' | 'desc';
/** Realtime event type */
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
/** Auth provider */
type AuthProvider = 'email' | 'phone' | 'google' | 'github' | 'gitlab' | 'bitbucket' | 'discord' | 'twitter' | 'facebook' | 'apple' | 'azure';
/** Storage bucket */
interface StorageBucket {
    id: string;
    name: string;
    public: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
}
/** Query filter */
interface QueryFilter {
    column: string;
    operator: QueryOperator;
    value: unknown;
}
/** Query options */
interface QueryOptions {
    filters?: QueryFilter[];
    orderBy?: {
        column: string;
        direction: SortDirection;
    }[];
    limit?: number;
    offset?: number;
    select?: string;
    count?: 'exact' | 'planned' | 'estimated';
}
/** Realtime subscription */
interface RealtimeSubscription {
    id: string;
    table: string;
    event: RealtimeEvent;
    filter?: string;
    callback: (payload: RealtimePayload) => void;
    unsubscribe: () => void;
}
/** Realtime payload */
interface RealtimePayload<T = Record<string, unknown>> {
    eventType: RealtimeEvent;
    new: T | null;
    old: T | null;
    table: string;
    schema: string;
    commitTimestamp: string;
}
/** User session */
interface UserSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    expiresIn: number;
    user: UserProfile;
}
/** User profile */
interface UserProfile {
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
interface AuthState {
    session: UserSession | null;
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}
/** Database error */
interface DatabaseError {
    code: string;
    message: string;
    details?: string;
    hint?: string;
}
/** Query result */
interface QueryResult<T> {
    data: T[] | null;
    error: DatabaseError | null;
    count: number | null;
    status: number;
    statusText: string;
}
/** Single result */
interface SingleResult<T> {
    data: T | null;
    error: DatabaseError | null;
}
/** Mutation result */
interface MutationResult<T> {
    data: T | null;
    error: DatabaseError | null;
}
/** Storage file */
interface StorageFile {
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
interface UploadOptions {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
}
/** RPC function */
interface RPCFunction {
    name: string;
    args?: Record<string, unknown>;
}
/** Service config */
interface ServiceConfig {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
    schema?: string;
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
}
declare class QueryBuilder<T = Record<string, unknown>> {
    private tableName;
    private options;
    private isSingle;
    constructor(table: string);
    select(columns?: string): this;
    eq(column: string, value: unknown): this;
    neq(column: string, value: unknown): this;
    gt(column: string, value: unknown): this;
    gte(column: string, value: unknown): this;
    lt(column: string, value: unknown): this;
    lte(column: string, value: unknown): this;
    like(column: string, pattern: string): this;
    ilike(column: string, pattern: string): this;
    is(column: string, value: boolean | null): this;
    in(column: string, values: unknown[]): this;
    contains(column: string, value: unknown): this;
    containedBy(column: string, value: unknown): this;
    overlap(column: string, value: unknown[]): this;
    order(column: string, options?: {
        ascending?: boolean;
    }): this;
    limit(count: number): this;
    range(from: number, to: number): this;
    single(): this;
    maybeSingle(): this;
    private addFilter;
    getTable(): string;
    getOptions(): QueryOptions;
    isSingleResult(): boolean;
}
declare class SupabaseService {
    private config;
    private authState;
    private subscriptions;
    private authListeners;
    constructor(config: ServiceConfig);
    from<T = Record<string, unknown>>(table: string): QueryBuilder<T>;
    buildSelectUrl(query: QueryBuilder): string;
    private formatFilterValue;
    buildInsertUrl(table: string): string;
    buildUpdateUrl(table: string): string;
    buildDeleteUrl(table: string): string;
    buildRpcUrl(functionName: string): string;
    getHeaders(options?: {
        preferReturn?: 'minimal' | 'representation';
    }): Record<string, string>;
    getAuthState(): AuthState;
    onAuthStateChange(callback: (state: AuthState) => void): () => void;
    private notifyAuthListeners;
    setSession(session: UserSession | null): void;
    setAuthError(error: string): void;
    setAuthLoading(isLoading: boolean): void;
    signOut(): void;
    buildAuthUrl(path: string): string;
    subscribe(table: string, event: RealtimeEvent, callback: (payload: RealtimePayload) => void, filter?: string): RealtimeSubscription;
    getSubscriptions(): RealtimeSubscription[];
    unsubscribeAll(): void;
    buildRealtimeUrl(): string;
    buildStorageUrl(bucket: string, path: string): string;
    buildPublicUrl(bucket: string, path: string): string;
    buildSignedUrl(bucket: string, path: string, expiresIn: number): string;
    buildFunctionUrl(functionName: string): string;
    getConfig(): ServiceConfig;
}
declare function createSupabaseService(config: ServiceConfig): SupabaseService;
declare function createQueryBuilder<T = Record<string, unknown>>(table: string): QueryBuilder<T>;
declare function parsePostgrestError(error: unknown): DatabaseError;
declare function isAuthError(error: DatabaseError): boolean;
declare function isNotFoundError(error: DatabaseError): boolean;
declare function isConflictError(error: DatabaseError): boolean;
declare function isValidationError(error: DatabaseError): boolean;
declare function formatFilterParams(filters: QueryFilter[]): Record<string, string>;
declare function parseJwtPayload(token: string): Record<string, unknown> | null;
declare function isTokenExpired(token: string, bufferSeconds?: number): boolean;
declare function generateUUID(): string;

export { type AuthProvider, type AuthState, type DatabaseError, type MutationResult, QueryBuilder, type QueryFilter, type QueryOperator, type QueryOptions, type QueryResult, type RPCFunction, type RealtimeEvent, type RealtimePayload, type RealtimeSubscription, type ServiceConfig, type SingleResult, type SortDirection, type StorageBucket, type StorageFile, SupabaseService, type TableName, type UploadOptions, type UserProfile, type UserSession, createQueryBuilder, createSupabaseService, formatFilterParams, generateUUID, isAuthError, isConflictError, isNotFoundError, isTokenExpired, isValidationError, parseJwtPayload, parsePostgrestError };
