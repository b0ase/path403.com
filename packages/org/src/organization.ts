/**
 * @b0ase/org - Organization management
 */

import type {
  Organization,
  OrganizationStatus,
  OrganizationSettings,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  Role,
  ShareDistribution,
  ShareAllocation,
  ShareTransfer,
  PermissionCategory,
  PermissionCheckResult,
} from './types';

import { getRole, PREDEFINED_ROLES, roleHasAnyPermission, roleHasAllPermissions } from './roles';

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: OrganizationSettings = {
  requireKyc: false,
  allowCustomRoles: true,
  minShareAllocation: 0,
  allowShareTransfers: true,
};

// ============================================================================
// Organization Manager Class
// ============================================================================

/**
 * Organization Manager
 *
 * Manages organizations, members, roles, and permissions.
 * This is an in-memory manager - integrate with your database for persistence.
 */
export class OrganizationManager {
  private organizations: Map<string, Organization> = new Map();

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // Organization CRUD
  // ==========================================================================

  /**
   * Create a new organization
   */
  createOrganization(input: CreateOrganizationInput): Organization {
    const id = this.generateId('org');
    const now = new Date();

    const org: Organization = {
      id,
      name: input.name,
      description: input.description,
      tokenSymbol: input.tokenSymbol.toUpperCase(),
      tokenAddress: input.tokenAddress,
      totalShares: input.totalShares || 1000000,
      status: 'pending',
      members: [],
      customRoles: [],
      createdAt: now,
      updatedAt: now,
      settings: { ...DEFAULT_SETTINGS, ...input.settings },
      metadata: input.metadata,
    };

    this.organizations.set(id, org);
    return org;
  }

  /**
   * Get organization by ID
   */
  getOrganization(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  /**
   * Get organization or throw if not found
   */
  getOrganizationOrThrow(id: string): Organization {
    const org = this.getOrganization(id);
    if (!org) {
      throw new Error(`Organization not found: ${id}`);
    }
    return org;
  }

  /**
   * Update organization
   */
  updateOrganization(
    id: string,
    input: UpdateOrganizationInput
  ): Organization {
    const org = this.getOrganizationOrThrow(id);

    const updated: Organization = {
      ...org,
      name: input.name ?? org.name,
      description: input.description ?? org.description,
      tokenSymbol: input.tokenSymbol?.toUpperCase() ?? org.tokenSymbol,
      tokenAddress: input.tokenAddress ?? org.tokenAddress,
      totalShares: input.totalShares ?? org.totalShares,
      status: input.status ?? org.status,
      settings: input.settings
        ? { ...DEFAULT_SETTINGS, ...org.settings, ...input.settings }
        : org.settings ?? DEFAULT_SETTINGS,
      metadata: input.metadata
        ? { ...org.metadata, ...input.metadata }
        : org.metadata,
      updatedAt: new Date(),
    };

    this.organizations.set(id, updated);
    return updated;
  }

  /**
   * Delete organization
   */
  deleteOrganization(id: string): boolean {
    return this.organizations.delete(id);
  }

  /**
   * List all organizations
   */
  listOrganizations(filter?: {
    status?: OrganizationStatus;
  }): Organization[] {
    const orgs = Array.from(this.organizations.values());
    if (filter?.status) {
      return orgs.filter((o) => o.status === filter.status);
    }
    return orgs;
  }

  /**
   * Activate organization
   */
  activateOrganization(id: string): Organization {
    return this.updateOrganization(id, { status: 'active' });
  }

  /**
   * Archive organization
   */
  archiveOrganization(id: string): Organization {
    return this.updateOrganization(id, { status: 'archived' });
  }

  // ==========================================================================
  // Member Management
  // ==========================================================================

  /**
   * Add member to organization
   */
  addMember(organizationId: string, input: CreateMemberInput): Member {
    const org = this.getOrganizationOrThrow(organizationId);

    // Check max members
    if (
      org.settings?.maxMembers &&
      org.members.length >= org.settings.maxMembers
    ) {
      throw new Error(
        `Organization has reached maximum members: ${org.settings.maxMembers}`
      );
    }

    // Validate role exists
    const role = this.getEffectiveRole(org, input.roleId);
    if (!role) {
      throw new Error(`Role not found: ${input.roleId}`);
    }

    const member: Member = {
      id: this.generateId('mem'),
      handle: input.handle,
      displayName: input.displayName,
      email: input.email,
      tokenAddress: input.tokenAddress,
      shareAllocation: input.shareAllocation ?? role.defaultShareAllocation,
      roleId: input.roleId,
      organizationId,
      profileId: input.profileId,
      kycStatus: 'none',
      joinedAt: new Date(),
      metadata: input.metadata,
    };

    // Validate share allocation
    this.validateShareAllocation(org, member.shareAllocation, undefined);

    org.members.push(member);
    org.updatedAt = new Date();

    return member;
  }

  /**
   * Get member by ID
   */
  getMember(organizationId: string, memberId: string): Member | undefined {
    const org = this.getOrganization(organizationId);
    return org?.members.find((m) => m.id === memberId);
  }

  /**
   * Get member by handle
   */
  getMemberByHandle(
    organizationId: string,
    handle: string
  ): Member | undefined {
    const org = this.getOrganization(organizationId);
    return org?.members.find((m) => m.handle === handle);
  }

  /**
   * Update member
   */
  updateMember(
    organizationId: string,
    memberId: string,
    input: UpdateMemberInput
  ): Member {
    const org = this.getOrganizationOrThrow(organizationId);
    const memberIndex = org.members.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      throw new Error(`Member not found: ${memberId}`);
    }

    const member = org.members[memberIndex];

    // Validate new share allocation if provided
    if (input.shareAllocation !== undefined) {
      this.validateShareAllocation(org, input.shareAllocation, memberId);
    }

    // Validate new role if provided
    if (input.roleId) {
      const role = this.getEffectiveRole(org, input.roleId);
      if (!role) {
        throw new Error(`Role not found: ${input.roleId}`);
      }
    }

    const updated: Member = {
      ...member,
      displayName: input.displayName ?? member.displayName,
      email: input.email ?? member.email,
      tokenAddress: input.tokenAddress ?? member.tokenAddress,
      shareAllocation: input.shareAllocation ?? member.shareAllocation,
      roleId: input.roleId ?? member.roleId,
      kycStatus: input.kycStatus ?? member.kycStatus,
      metadata: input.metadata
        ? { ...member.metadata, ...input.metadata }
        : member.metadata,
    };

    org.members[memberIndex] = updated;
    org.updatedAt = new Date();

    return updated;
  }

  /**
   * Remove member from organization
   */
  removeMember(organizationId: string, memberId: string): boolean {
    const org = this.getOrganizationOrThrow(organizationId);
    const initialLength = org.members.length;
    org.members = org.members.filter((m) => m.id !== memberId);
    org.updatedAt = new Date();
    return org.members.length < initialLength;
  }

  /**
   * List organization members
   */
  listMembers(
    organizationId: string,
    filter?: { roleId?: string }
  ): Member[] {
    const org = this.getOrganization(organizationId);
    if (!org) return [];

    if (filter?.roleId) {
      return org.members.filter((m) => m.roleId === filter.roleId);
    }
    return org.members;
  }

  // ==========================================================================
  // Share Management
  // ==========================================================================

  /**
   * Validate share allocation
   */
  private validateShareAllocation(
    org: Organization,
    newAllocation: number,
    excludeMemberId?: string
  ): void {
    const minAllocation = org.settings?.minShareAllocation ?? 0;
    if (newAllocation < minAllocation) {
      throw new Error(
        `Share allocation must be at least ${minAllocation}%`
      );
    }

    // Check total doesn't exceed 100%
    const currentTotal = org.members
      .filter((m) => m.id !== excludeMemberId)
      .reduce((sum, m) => sum + m.shareAllocation, 0);

    if (currentTotal + newAllocation > 100) {
      throw new Error(
        `Total share allocation would exceed 100% (current: ${currentTotal}%, new: ${newAllocation}%)`
      );
    }
  }

  /**
   * Get share distribution for organization
   */
  getShareDistribution(organizationId: string): ShareDistribution {
    const org = this.getOrganizationOrThrow(organizationId);

    const allocations: ShareAllocation[] = org.members.map((m) => ({
      memberId: m.id,
      handle: m.handle,
      displayName: m.displayName,
      shares: Math.floor((m.shareAllocation / 100) * org.totalShares),
      percentage: m.shareAllocation,
      tokenAddress: m.tokenAddress,
    }));

    const allocatedPercent = org.members.reduce(
      (sum, m) => sum + m.shareAllocation,
      0
    );
    const allocatedShares = Math.floor(
      (allocatedPercent / 100) * org.totalShares
    );

    return {
      organizationId,
      totalShares: org.totalShares,
      allocatedShares,
      unallocatedShares: org.totalShares - allocatedShares,
      allocations,
    };
  }

  /**
   * Transfer shares between members
   */
  transferShares(
    organizationId: string,
    transfer: ShareTransfer
  ): { from: Member; to: Member } {
    const org = this.getOrganizationOrThrow(organizationId);

    if (!org.settings?.allowShareTransfers) {
      throw new Error('Share transfers are not allowed for this organization');
    }

    const fromMember = org.members.find((m) => m.id === transfer.fromMemberId);
    const toMember = org.members.find((m) => m.id === transfer.toMemberId);

    if (!fromMember) {
      throw new Error(`From member not found: ${transfer.fromMemberId}`);
    }
    if (!toMember) {
      throw new Error(`To member not found: ${transfer.toMemberId}`);
    }

    // Calculate share percentage from shares
    const sharePercent = (transfer.shares / org.totalShares) * 100;

    if (fromMember.shareAllocation < sharePercent) {
      throw new Error(
        `Insufficient shares: ${fromMember.displayName} has ${fromMember.shareAllocation}%, trying to transfer ${sharePercent}%`
      );
    }

    // Perform transfer
    fromMember.shareAllocation -= sharePercent;
    toMember.shareAllocation += sharePercent;
    org.updatedAt = new Date();

    return { from: fromMember, to: toMember };
  }

  // ==========================================================================
  // Role Management
  // ==========================================================================

  /**
   * Get effective role (predefined or custom)
   */
  getEffectiveRole(org: Organization, roleId: string): Role | undefined {
    // Check predefined roles first
    const predefined = getRole(roleId);
    if (predefined) return predefined;

    // Check custom roles
    return org.customRoles.find((r) => r.id === roleId);
  }

  /**
   * Add custom role to organization
   */
  addCustomRole(organizationId: string, role: Role): Role {
    const org = this.getOrganizationOrThrow(organizationId);

    if (!org.settings?.allowCustomRoles) {
      throw new Error('Custom roles are not allowed for this organization');
    }

    // Check for duplicate ID
    if (
      getRole(role.id) ||
      org.customRoles.some((r) => r.id === role.id)
    ) {
      throw new Error(`Role already exists: ${role.id}`);
    }

    const customRole = { ...role, isCustom: true };
    org.customRoles.push(customRole);
    org.updatedAt = new Date();

    return customRole;
  }

  /**
   * Remove custom role from organization
   */
  removeCustomRole(organizationId: string, roleId: string): boolean {
    const org = this.getOrganizationOrThrow(organizationId);

    // Check if any members have this role
    const membersWithRole = org.members.filter((m) => m.roleId === roleId);
    if (membersWithRole.length > 0) {
      throw new Error(
        `Cannot remove role: ${membersWithRole.length} members have this role`
      );
    }

    const initialLength = org.customRoles.length;
    org.customRoles = org.customRoles.filter((r) => r.id !== roleId);
    org.updatedAt = new Date();

    return org.customRoles.length < initialLength;
  }

  /**
   * List all roles for organization (predefined + custom)
   */
  listRoles(organizationId: string): Role[] {
    const org = this.getOrganization(organizationId);
    if (!org) return PREDEFINED_ROLES;
    return [...PREDEFINED_ROLES, ...org.customRoles];
  }

  // ==========================================================================
  // Permission Checking
  // ==========================================================================

  /**
   * Check if member has permission
   */
  checkPermission(
    organizationId: string,
    memberId: string,
    requiredPermissions: PermissionCategory[],
    options?: { requireAll?: boolean }
  ): PermissionCheckResult {
    const org = this.getOrganization(organizationId);
    if (!org) {
      return {
        allowed: false,
        reason: 'Organization not found',
        requiredPermissions,
        memberPermissions: [],
      };
    }

    const member = org.members.find((m) => m.id === memberId);
    if (!member) {
      return {
        allowed: false,
        reason: 'Member not found',
        requiredPermissions,
        memberPermissions: [],
      };
    }

    const role = this.getEffectiveRole(org, member.roleId);
    if (!role) {
      return {
        allowed: false,
        reason: 'Role not found',
        requiredPermissions,
        memberPermissions: [],
      };
    }

    const hasPermission = options?.requireAll
      ? roleHasAllPermissions(role, requiredPermissions)
      : roleHasAnyPermission(role, requiredPermissions);

    return {
      allowed: hasPermission,
      reason: hasPermission ? undefined : 'Insufficient permissions',
      requiredPermissions,
      memberPermissions: role.permissions,
    };
  }

  /**
   * Check if member can perform action
   */
  canPerformAction(
    organizationId: string,
    memberId: string,
    action: string
  ): boolean {
    // Map actions to required permissions
    const actionPermissions: Record<string, PermissionCategory[]> = {
      'org:update': ['admin'],
      'org:delete': ['admin'],
      'member:add': ['admin', 'hr'],
      'member:remove': ['admin', 'hr'],
      'member:update': ['admin', 'hr'],
      'role:add': ['admin'],
      'role:remove': ['admin'],
      'shares:transfer': ['admin', 'finance'],
      'finance:view': ['admin', 'finance'],
      'tech:deploy': ['admin', 'tech'],
      'marketing:publish': ['admin', 'marketing'],
    };

    const required = actionPermissions[action];
    if (!required) return false;

    const result = this.checkPermission(organizationId, memberId, required);
    return result.allowed;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create an organization manager instance
 */
export function createOrganizationManager(): OrganizationManager {
  return new OrganizationManager();
}
