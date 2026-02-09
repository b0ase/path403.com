/**
 * @b0ase/org - Type definitions
 *
 * Core types for organization management, roles, and members.
 */

// ============================================================================
// Permission Types
// ============================================================================

/** Available permission categories */
export type PermissionCategory =
  | 'admin'
  | 'finance'
  | 'tech'
  | 'marketing'
  | 'legal'
  | 'hr'
  | 'operations'
  | 'read'
  | 'write';

/** Permission definition */
export interface Permission {
  /** Permission identifier */
  id: string;
  /** Permission category */
  category: PermissionCategory;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
}

// ============================================================================
// Role Types
// ============================================================================

/** Predefined role identifiers */
export type RoleId =
  | 'ceo'
  | 'cto'
  | 'cmo'
  | 'cfo'
  | 'coo'
  | 'developer'
  | 'designer'
  | 'marketer'
  | 'analyst'
  | 'legal'
  | 'advisor'
  | 'investor'
  | 'contributor'
  | 'member'
  | 'custom';

/** Role definition */
export interface Role {
  /** Unique role identifier */
  id: string;
  /** Role name */
  name: string;
  /** Role description */
  description: string;
  /** Icon identifier (lucide icon name) */
  icon: string;
  /** Permissions granted to this role */
  permissions: PermissionCategory[];
  /** Default share allocation percentage (0-100) */
  defaultShareAllocation: number;
  /** Whether this is a custom role */
  isCustom?: boolean;
}

// ============================================================================
// Member Types
// ============================================================================

/** KYC status levels */
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';

/** Organization member (extends HandCash handle concept) */
export interface Member {
  /** Unique member identifier */
  id: string;
  /** Payment handle (e.g., HandCash $handle) */
  handle: string;
  /** Display name */
  displayName: string;
  /** Email address */
  email?: string;
  /** Token/wallet address for share distribution */
  tokenAddress?: string;
  /** Share allocation percentage (0-100) */
  shareAllocation: number;
  /** Role ID */
  roleId: string;
  /** Organization ID */
  organizationId: string;
  /** Profile ID (linked user) */
  profileId?: string;
  /** KYC status */
  kycStatus: KycStatus;
  /** When member joined */
  joinedAt: Date;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Member creation input */
export interface CreateMemberInput {
  handle: string;
  displayName: string;
  email?: string;
  tokenAddress?: string;
  shareAllocation?: number;
  roleId: string;
  profileId?: string;
  metadata?: Record<string, unknown>;
}

/** Member update input */
export interface UpdateMemberInput {
  displayName?: string;
  email?: string;
  tokenAddress?: string;
  shareAllocation?: number;
  roleId?: string;
  kycStatus?: KycStatus;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Organization Types
// ============================================================================

/** Organization status */
export type OrganizationStatus = 'active' | 'inactive' | 'pending' | 'archived';

/** Organization definition */
export interface Organization {
  /** Unique organization identifier */
  id: string;
  /** Organization name */
  name: string;
  /** Description */
  description: string;
  /** Token symbol (e.g., ORG) */
  tokenSymbol: string;
  /** Token contract address */
  tokenAddress?: string;
  /** Total shares issued */
  totalShares: number;
  /** Organization status */
  status: OrganizationStatus;
  /** Organization members */
  members: Member[];
  /** Custom roles for this organization */
  customRoles: Role[];
  /** When organization was created */
  createdAt: Date;
  /** Last update */
  updatedAt: Date;
  /** Additional settings */
  settings?: OrganizationSettings;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Organization settings */
export interface OrganizationSettings {
  /** Require KYC for members */
  requireKyc: boolean;
  /** Allow custom roles */
  allowCustomRoles: boolean;
  /** Maximum members */
  maxMembers?: number;
  /** Minimum share allocation per member */
  minShareAllocation: number;
  /** Allow share transfers between members */
  allowShareTransfers: boolean;
  /** Governance settings */
  governance?: GovernanceSettings;
}

/** Governance settings */
export interface GovernanceSettings {
  /** Voting quorum percentage (0-100) */
  quorumPercent: number;
  /** Proposal threshold (minimum shares to propose) */
  proposalThreshold: number;
  /** Voting period in seconds */
  votingPeriodSeconds: number;
  /** Execution delay in seconds */
  executionDelaySeconds: number;
}

/** Organization creation input */
export interface CreateOrganizationInput {
  name: string;
  description: string;
  tokenSymbol: string;
  tokenAddress?: string;
  totalShares?: number;
  settings?: Partial<OrganizationSettings>;
  metadata?: Record<string, unknown>;
}

/** Organization update input */
export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  totalShares?: number;
  status?: OrganizationStatus;
  settings?: Partial<OrganizationSettings>;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Share Allocation Types
// ============================================================================

/** Share allocation entry */
export interface ShareAllocation {
  memberId: string;
  handle: string;
  displayName: string;
  shares: number;
  percentage: number;
  tokenAddress?: string;
}

/** Share distribution result */
export interface ShareDistribution {
  organizationId: string;
  totalShares: number;
  allocatedShares: number;
  unallocatedShares: number;
  allocations: ShareAllocation[];
}

/** Share transfer request */
export interface ShareTransfer {
  fromMemberId: string;
  toMemberId: string;
  shares: number;
  reason?: string;
}

// ============================================================================
// Permission Check Types
// ============================================================================

/** Permission check result */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions: PermissionCategory[];
  memberPermissions: PermissionCategory[];
}

/** Action requiring permissions */
export interface PermissionAction {
  action: string;
  requiredPermissions: PermissionCategory[];
  requireAll?: boolean; // Default: any permission is sufficient
}
