/**
 * @b0ase/org
 *
 * Organization management with role-based access control and share allocation.
 *
 * Features:
 * - Organization CRUD with settings and metadata
 * - Member management with role assignment
 * - Predefined roles (CEO, CTO, Developer, etc.)
 * - Custom role support
 * - Share allocation and transfer
 * - Permission checking for actions
 * - KYC status tracking
 *
 * @example
 * ```typescript
 * import { OrganizationManager, PREDEFINED_ROLES } from '@b0ase/org';
 *
 * const manager = new OrganizationManager();
 *
 * // Create organization
 * const org = manager.createOrganization({
 *   name: 'Acme Corp',
 *   description: 'Building the future',
 *   tokenSymbol: 'ACME',
 *   totalShares: 1000000,
 * });
 *
 * // Add members
 * const ceo = manager.addMember(org.id, {
 *   handle: '$alice',
 *   displayName: 'Alice',
 *   roleId: 'ceo',
 * });
 *
 * const dev = manager.addMember(org.id, {
 *   handle: '$bob',
 *   displayName: 'Bob',
 *   roleId: 'developer',
 *   shareAllocation: 5,
 * });
 *
 * // Check permissions
 * const canDelete = manager.canPerformAction(org.id, ceo.id, 'org:delete');
 * // true (CEO has admin)
 *
 * // Get share distribution
 * const distribution = manager.getShareDistribution(org.id);
 * console.log(distribution.allocations);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Permissions
  PermissionCategory,
  Permission,

  // Roles
  RoleId,
  Role,

  // Members
  KycStatus,
  Member,
  CreateMemberInput,
  UpdateMemberInput,

  // Organizations
  OrganizationStatus,
  Organization,
  OrganizationSettings,
  GovernanceSettings,
  CreateOrganizationInput,
  UpdateOrganizationInput,

  // Shares
  ShareAllocation,
  ShareDistribution,
  ShareTransfer,

  // Permissions
  PermissionCheckResult,
  PermissionAction,
} from './types';

// ============================================================================
// Role Exports
// ============================================================================

export {
  // Individual roles
  CEO_ROLE,
  CTO_ROLE,
  CMO_ROLE,
  CFO_ROLE,
  COO_ROLE,
  DEVELOPER_ROLE,
  DESIGNER_ROLE,
  MARKETER_ROLE,
  ANALYST_ROLE,
  LEGAL_ROLE,
  ADVISOR_ROLE,
  INVESTOR_ROLE,
  CONTRIBUTOR_ROLE,
  MEMBER_ROLE,

  // Role collections
  PREDEFINED_ROLES,
  ROLES_BY_ID,
  EXECUTIVE_ROLES,
  TEAM_ROLES,
  EXTERNAL_ROLES,

  // Role utilities
  getRole,
  getRoleOrThrow,
  roleHasPermission,
  roleHasAnyPermission,
  roleHasAllPermissions,
  isExecutiveRole,
  isAdminRole,
  createCustomRole,
  getRolesWithPermission,
  getCombinedPermissions,
} from './roles';

// ============================================================================
// Organization Exports
// ============================================================================

export {
  OrganizationManager,
  createOrganizationManager,
} from './organization';
