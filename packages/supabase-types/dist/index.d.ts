/**
 * @b0ase/supabase-types
 *
 * Shared Supabase database types and utilities.
 *
 * @packageDocumentation
 */
/** UUID type */
type UUID = string;
/** Timestamp type */
type Timestamp = string;
/** JSON type */
type Json = string | number | boolean | null | {
    [key: string]: Json;
} | Json[];
/** Database row base */
interface BaseRow {
    id: UUID;
    created_at: Timestamp;
    updated_at?: Timestamp;
}
/** Soft deletable row */
interface SoftDeletableRow extends BaseRow {
    deleted_at?: Timestamp | null;
    is_deleted?: boolean;
}
/** User profile */
interface UserProfile extends BaseRow {
    user_id: UUID;
    email?: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    website?: string;
    wallet_address?: string;
    handcash_handle?: string;
    is_verified?: boolean;
    metadata?: Json;
}
/** Organization */
interface Organization extends SoftDeletableRow {
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    website?: string;
    owner_id: UUID;
    settings?: Json;
    metadata?: Json;
}
/** Organization member */
interface OrganizationMember extends BaseRow {
    organization_id: UUID;
    user_id: UUID;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    permissions?: string[];
    invited_by?: UUID;
    joined_at?: Timestamp;
}
/** Project */
interface Project extends SoftDeletableRow {
    name: string;
    slug: string;
    description?: string;
    organization_id?: UUID;
    owner_id: UUID;
    visibility: 'public' | 'private' | 'unlisted';
    status: 'active' | 'archived' | 'draft';
    settings?: Json;
    metadata?: Json;
}
/** Token */
interface Token extends BaseRow {
    symbol: string;
    name: string;
    description?: string;
    icon_url?: string;
    total_supply: string;
    decimals: number;
    owner_id: UUID;
    organization_id?: UUID;
    contract_address?: string;
    blockchain: 'bsv' | 'ethereum' | 'solana' | 'polygon';
    standard: 'bsv-20' | 'brc-20' | 'erc-20' | 'spl';
    is_verified?: boolean;
    metadata?: Json;
}
/** Token balance */
interface TokenBalance extends BaseRow {
    token_id: UUID;
    user_id: UUID;
    balance: string;
    locked_balance?: string;
    pending_balance?: string;
}
/** Transaction */
interface Transaction extends BaseRow {
    type: 'transfer' | 'mint' | 'burn' | 'payment' | 'fee' | 'reward';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    from_user_id?: UUID;
    to_user_id?: UUID;
    token_id?: UUID;
    amount: string;
    fee?: string;
    txid?: string;
    blockchain?: string;
    description?: string;
    metadata?: Json;
}
/** File */
interface File extends SoftDeletableRow {
    name: string;
    path: string;
    mime_type: string;
    size: number;
    owner_id: UUID;
    organization_id?: UUID;
    project_id?: UUID;
    storage_provider: 'supabase' | 'ipfs' | 'arweave' | 'bsv';
    storage_url?: string;
    content_hash?: string;
    is_public?: boolean;
    metadata?: Json;
}
/** Comment */
interface Comment extends SoftDeletableRow {
    content: string;
    user_id: UUID;
    parent_id?: UUID;
    entity_type: string;
    entity_id: UUID;
    is_edited?: boolean;
    metadata?: Json;
}
/** Notification */
interface Notification extends BaseRow {
    user_id: UUID;
    type: string;
    title: string;
    message?: string;
    link?: string;
    is_read?: boolean;
    read_at?: Timestamp;
    metadata?: Json;
}
/** Audit log */
interface AuditLog extends BaseRow {
    user_id?: UUID;
    action: string;
    entity_type: string;
    entity_id: UUID;
    old_values?: Json;
    new_values?: Json;
    ip_address?: string;
    user_agent?: string;
    metadata?: Json;
}
/** Pagination params */
interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
/** Sort params */
interface SortParams {
    field: string;
    direction: 'asc' | 'desc';
}
/** Filter operator */
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'contains' | 'overlaps';
/** Filter param */
interface FilterParam {
    field: string;
    operator: FilterOperator;
    value: unknown;
}
/** Query params */
interface QueryParams {
    pagination?: PaginationParams;
    sort?: SortParams[];
    filters?: FilterParam[];
    select?: string;
    include?: string[];
}
/** Paginated response */
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
/** Realtime event type */
type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';
/** Realtime payload */
interface RealtimePayload<T = Record<string, unknown>> {
    eventType: RealtimeEventType;
    new: T | null;
    old: T | null;
    table: string;
    schema: string;
    commit_timestamp: string;
}
/** Subscription config */
interface SubscriptionConfig {
    table: string;
    schema?: string;
    event?: RealtimeEventType | '*';
    filter?: string;
}
/** Policy action */
type PolicyAction = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
/** Policy definition */
interface PolicyDefinition {
    name: string;
    table: string;
    action: PolicyAction;
    using?: string;
    withCheck?: string;
}
/** Insert type (omit auto-generated fields) */
type Insert<T extends BaseRow> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
    id?: UUID;
    created_at?: Timestamp;
    updated_at?: Timestamp;
};
/** Update type (all fields optional except id) */
type Update<T extends BaseRow> = Partial<Omit<T, 'id' | 'created_at'>> & {
    updated_at?: Timestamp;
};
/** Row type with relations */
type WithRelations<T, Relations extends Record<string, unknown>> = T & {
    [K in keyof Relations]?: Relations[K];
};
declare function buildPaginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T>;
declare function calculateOffset(page: number, limit: number): number;
declare function parseSortString(sort: string): SortParams[];
declare function toSnakeCase(str: string): string;
declare function toCamelCase(str: string): string;
declare function transformKeys<T extends Record<string, unknown>>(obj: T, transformer: (key: string) => string): Record<string, unknown>;
declare function snakeCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown>;
declare function camelCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown>;
declare function isUUID(str: string): boolean;
declare function generateSlug(name: string): string;
declare function parseTimestamp(timestamp: Timestamp): Date;
declare function toTimestamp(date: Date): Timestamp;

export { type AuditLog, type BaseRow, type Comment, type File, type FilterOperator, type FilterParam, type Insert, type Json, type Notification, type Organization, type OrganizationMember, type PaginatedResponse, type PaginationParams, type PolicyAction, type PolicyDefinition, type Project, type QueryParams, type RealtimeEventType, type RealtimePayload, type SoftDeletableRow, type SortParams, type SubscriptionConfig, type Timestamp, type Token, type TokenBalance, type Transaction, type UUID, type Update, type UserProfile, type WithRelations, buildPaginatedResponse, calculateOffset, camelCaseKeys, generateSlug, isUUID, parseSortString, parseTimestamp, snakeCaseKeys, toCamelCase, toSnakeCase, toTimestamp, transformKeys };
