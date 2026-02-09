/**
 * @b0ase/org - Type definitions
 *
 * Core types for organization management, roles, and members.
 */
/** Available permission categories */
type PermissionCategory = 'admin' | 'finance' | 'tech' | 'marketing' | 'legal' | 'hr' | 'operations' | 'read' | 'write';
/** Permission definition */
interface Permission {
    /** Permission identifier */
    id: string;
    /** Permission category */
    category: PermissionCategory;
    /** Human-readable name */
    name: string;
    /** Description */
    description: string;
}
/** Predefined role identifiers */
type RoleId = 'ceo' | 'cto' | 'cmo' | 'cfo' | 'coo' | 'developer' | 'designer' | 'marketer' | 'analyst' | 'legal' | 'advisor' | 'investor' | 'contributor' | 'member' | 'custom';
/** Role definition */
interface Role {
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
/** KYC status levels */
type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
/** Organization member (extends HandCash handle concept) */
interface Member {
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
interface CreateMemberInput {
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
interface UpdateMemberInput {
    displayName?: string;
    email?: string;
    tokenAddress?: string;
    shareAllocation?: number;
    roleId?: string;
    kycStatus?: KycStatus;
    metadata?: Record<string, unknown>;
}
/** Organization status */
type OrganizationStatus = 'active' | 'inactive' | 'pending' | 'archived';
/** Organization definition */
interface Organization {
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
interface OrganizationSettings {
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
interface GovernanceSettings {
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
interface CreateOrganizationInput {
    name: string;
    description: string;
    tokenSymbol: string;
    tokenAddress?: string;
    totalShares?: number;
    settings?: Partial<OrganizationSettings>;
    metadata?: Record<string, unknown>;
}
/** Organization update input */
interface UpdateOrganizationInput {
    name?: string;
    description?: string;
    tokenSymbol?: string;
    tokenAddress?: string;
    totalShares?: number;
    status?: OrganizationStatus;
    settings?: Partial<OrganizationSettings>;
    metadata?: Record<string, unknown>;
}
/** Share allocation entry */
interface ShareAllocation {
    memberId: string;
    handle: string;
    displayName: string;
    shares: number;
    percentage: number;
    tokenAddress?: string;
}
/** Share distribution result */
interface ShareDistribution {
    organizationId: string;
    totalShares: number;
    allocatedShares: number;
    unallocatedShares: number;
    allocations: ShareAllocation[];
}
/** Share transfer request */
interface ShareTransfer {
    fromMemberId: string;
    toMemberId: string;
    shares: number;
    reason?: string;
}
/** Permission check result */
interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    requiredPermissions: PermissionCategory[];
    memberPermissions: PermissionCategory[];
}
/** Action requiring permissions */
interface PermissionAction {
    action: string;
    requiredPermissions: PermissionCategory[];
    requireAll?: boolean;
}

/**
 * @b0ase/org - Predefined roles and role utilities
 */

/** CEO - Full administrative access */
declare const CEO_ROLE: Role;
/** CTO - Technical leadership */
declare const CTO_ROLE: Role;
/** CMO - Marketing leadership */
declare const CMO_ROLE: Role;
/** CFO - Financial leadership */
declare const CFO_ROLE: Role;
/** COO - Operations leadership */
declare const COO_ROLE: Role;
/** Developer - Technical contributor */
declare const DEVELOPER_ROLE: Role;
/** Designer - Creative contributor */
declare const DESIGNER_ROLE: Role;
/** Marketer - Marketing contributor */
declare const MARKETER_ROLE: Role;
/** Analyst - Data and business analysis */
declare const ANALYST_ROLE: Role;
/** Legal - Legal affairs */
declare const LEGAL_ROLE: Role;
/** Advisor - External advisor */
declare const ADVISOR_ROLE: Role;
/** Investor - Financial backer */
declare const INVESTOR_ROLE: Role;
/** Contributor - Community contributor */
declare const CONTRIBUTOR_ROLE: Role;
/** Member - Basic member */
declare const MEMBER_ROLE: Role;
/** All predefined roles */
declare const PREDEFINED_ROLES: Role[];
/** Role lookup by ID */
declare const ROLES_BY_ID: Record<RoleId, Role>;
/** Executive roles (C-suite) */
declare const EXECUTIVE_ROLES: Role[];
/** Team member roles */
declare const TEAM_ROLES: Role[];
/** External roles */
declare const EXTERNAL_ROLES: Role[];
/**
 * Get role by ID
 */
declare function getRole(roleId: string): Role | undefined;
/**
 * Get role by ID or throw if not found
 */
declare function getRoleOrThrow(roleId: string): Role;
/**
 * Check if role has specific permission
 */
declare function roleHasPermission(role: Role, permission: PermissionCategory): boolean;
/**
 * Check if role has any of the specified permissions
 */
declare function roleHasAnyPermission(role: Role, permissions: PermissionCategory[]): boolean;
/**
 * Check if role has all of the specified permissions
 */
declare function roleHasAllPermissions(role: Role, permissions: PermissionCategory[]): boolean;
/**
 * Check if role is an executive role
 */
declare function isExecutiveRole(roleId: string): boolean;
/**
 * Check if role has admin permissions
 */
declare function isAdminRole(role: Role): boolean;
/**
 * Create a custom role
 */
declare function createCustomRole(id: string, name: string, description: string, permissions: PermissionCategory[], options?: {
    icon?: string;
    defaultShareAllocation?: number;
}): Role;
/**
 * Get roles with specific permission
 */
declare function getRolesWithPermission(permission: PermissionCategory): Role[];
/**
 * Get all unique permissions from a set of roles
 */
declare function getCombinedPermissions(roles: Role[]): PermissionCategory[];

/**
 * @b0ase/org - Organization management
 */

/**
 * Organization Manager
 *
 * Manages organizations, members, roles, and permissions.
 * This is an in-memory manager - integrate with your database for persistence.
 */
declare class OrganizationManager {
    private organizations;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Create a new organization
     */
    createOrganization(input: CreateOrganizationInput): Organization;
    /**
     * Get organization by ID
     */
    getOrganization(id: string): Organization | undefined;
    /**
     * Get organization or throw if not found
     */
    getOrganizationOrThrow(id: string): Organization;
    /**
     * Update organization
     */
    updateOrganization(id: string, input: UpdateOrganizationInput): Organization;
    /**
     * Delete organization
     */
    deleteOrganization(id: string): boolean;
    /**
     * List all organizations
     */
    listOrganizations(filter?: {
        status?: OrganizationStatus;
    }): Organization[];
    /**
     * Activate organization
     */
    activateOrganization(id: string): Organization;
    /**
     * Archive organization
     */
    archiveOrganization(id: string): Organization;
    /**
     * Add member to organization
     */
    addMember(organizationId: string, input: CreateMemberInput): Member;
    /**
     * Get member by ID
     */
    getMember(organizationId: string, memberId: string): Member | undefined;
    /**
     * Get member by handle
     */
    getMemberByHandle(organizationId: string, handle: string): Member | undefined;
    /**
     * Update member
     */
    updateMember(organizationId: string, memberId: string, input: UpdateMemberInput): Member;
    /**
     * Remove member from organization
     */
    removeMember(organizationId: string, memberId: string): boolean;
    /**
     * List organization members
     */
    listMembers(organizationId: string, filter?: {
        roleId?: string;
    }): Member[];
    /**
     * Validate share allocation
     */
    private validateShareAllocation;
    /**
     * Get share distribution for organization
     */
    getShareDistribution(organizationId: string): ShareDistribution;
    /**
     * Transfer shares between members
     */
    transferShares(organizationId: string, transfer: ShareTransfer): {
        from: Member;
        to: Member;
    };
    /**
     * Get effective role (predefined or custom)
     */
    getEffectiveRole(org: Organization, roleId: string): Role | undefined;
    /**
     * Add custom role to organization
     */
    addCustomRole(organizationId: string, role: Role): Role;
    /**
     * Remove custom role from organization
     */
    removeCustomRole(organizationId: string, roleId: string): boolean;
    /**
     * List all roles for organization (predefined + custom)
     */
    listRoles(organizationId: string): Role[];
    /**
     * Check if member has permission
     */
    checkPermission(organizationId: string, memberId: string, requiredPermissions: PermissionCategory[], options?: {
        requireAll?: boolean;
    }): PermissionCheckResult;
    /**
     * Check if member can perform action
     */
    canPerformAction(organizationId: string, memberId: string, action: string): boolean;
}
/**
 * Create an organization manager instance
 */
declare function createOrganizationManager(): OrganizationManager;

export { ADVISOR_ROLE, ANALYST_ROLE, CEO_ROLE, CFO_ROLE, CMO_ROLE, CONTRIBUTOR_ROLE, COO_ROLE, CTO_ROLE, type CreateMemberInput, type CreateOrganizationInput, DESIGNER_ROLE, DEVELOPER_ROLE, EXECUTIVE_ROLES, EXTERNAL_ROLES, type GovernanceSettings, INVESTOR_ROLE, type KycStatus, LEGAL_ROLE, MARKETER_ROLE, MEMBER_ROLE, type Member, type Organization, OrganizationManager, type OrganizationSettings, type OrganizationStatus, PREDEFINED_ROLES, type Permission, type PermissionAction, type PermissionCategory, type PermissionCheckResult, ROLES_BY_ID, type Role, type RoleId, type ShareAllocation, type ShareDistribution, type ShareTransfer, TEAM_ROLES, type UpdateMemberInput, type UpdateOrganizationInput, createCustomRole, createOrganizationManager, getCombinedPermissions, getRole, getRoleOrThrow, getRolesWithPermission, isAdminRole, isExecutiveRole, roleHasAllPermissions, roleHasAnyPermission, roleHasPermission };
