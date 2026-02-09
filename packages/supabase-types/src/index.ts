/**
 * @b0ase/supabase-types
 *
 * Shared Supabase database types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Base Types
// ============================================================================

/** UUID type */
export type UUID = string;

/** Timestamp type */
export type Timestamp = string;

/** JSON type */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

/** Database row base */
export interface BaseRow {
  id: UUID;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

/** Soft deletable row */
export interface SoftDeletableRow extends BaseRow {
  deleted_at?: Timestamp | null;
  is_deleted?: boolean;
}

// ============================================================================
// Common Entity Types
// ============================================================================

/** User profile */
export interface UserProfile extends BaseRow {
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
export interface Organization extends SoftDeletableRow {
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
export interface OrganizationMember extends BaseRow {
  organization_id: UUID;
  user_id: UUID;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions?: string[];
  invited_by?: UUID;
  joined_at?: Timestamp;
}

/** Project */
export interface Project extends SoftDeletableRow {
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
export interface Token extends BaseRow {
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
export interface TokenBalance extends BaseRow {
  token_id: UUID;
  user_id: UUID;
  balance: string;
  locked_balance?: string;
  pending_balance?: string;
}

/** Transaction */
export interface Transaction extends BaseRow {
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
export interface File extends SoftDeletableRow {
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
export interface Comment extends SoftDeletableRow {
  content: string;
  user_id: UUID;
  parent_id?: UUID;
  entity_type: string;
  entity_id: UUID;
  is_edited?: boolean;
  metadata?: Json;
}

/** Notification */
export interface Notification extends BaseRow {
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
export interface AuditLog extends BaseRow {
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

// ============================================================================
// Query Types
// ============================================================================

/** Pagination params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/** Sort params */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/** Filter operator */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'is'
  | 'contains'
  | 'overlaps';

/** Filter param */
export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/** Query params */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParam[];
  select?: string;
  include?: string[];
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================================
// Realtime Types
// ============================================================================

/** Realtime event type */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/** Realtime payload */
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: RealtimeEventType;
  new: T | null;
  old: T | null;
  table: string;
  schema: string;
  commit_timestamp: string;
}

/** Subscription config */
export interface SubscriptionConfig {
  table: string;
  schema?: string;
  event?: RealtimeEventType | '*';
  filter?: string;
}

// ============================================================================
// RLS Policy Types
// ============================================================================

/** Policy action */
export type PolicyAction = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';

/** Policy definition */
export interface PolicyDefinition {
  name: string;
  table: string;
  action: PolicyAction;
  using?: string;
  withCheck?: string;
}

// ============================================================================
// Type Utilities
// ============================================================================

/** Insert type (omit auto-generated fields) */
export type Insert<T extends BaseRow> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

/** Update type (all fields optional except id) */
export type Update<T extends BaseRow> = Partial<Omit<T, 'id' | 'created_at'>> & {
  updated_at?: Timestamp;
};

/** Row type with relations */
export type WithRelations<T, Relations extends Record<string, unknown>> = T & {
  [K in keyof Relations]?: Relations[K];
};

// ============================================================================
// Utility Functions
// ============================================================================

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function parseSortString(sort: string): SortParams[] {
  return sort.split(',').map(s => {
    const [field, direction] = s.trim().split(':');
    return {
      field: field.trim(),
      direction: (direction?.trim().toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
    };
  });
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformKeys<T extends Record<string, unknown>>(
  obj: T,
  transformer: (key: string) => string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[transformer(key)] = obj[key];
  }
  return result;
}

export function snakeCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return transformKeys(obj, toSnakeCase);
}

export function camelCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return transformKeys(obj, toCamelCase);
}

export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseTimestamp(timestamp: Timestamp): Date {
  return new Date(timestamp);
}

export function toTimestamp(date: Date): Timestamp {
  return date.toISOString();
}
