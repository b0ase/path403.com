/**
 * @b0ase/org - Predefined roles and role utilities
 */

import type { Role, RoleId, PermissionCategory } from './types';

// ============================================================================
// Predefined Roles
// ============================================================================

/** CEO - Full administrative access */
export const CEO_ROLE: Role = {
  id: 'ceo',
  name: 'CEO',
  description: 'Chief Executive Officer - Full organizational authority',
  icon: 'crown',
  permissions: ['admin', 'finance', 'tech', 'marketing', 'legal', 'hr', 'operations', 'read', 'write'],
  defaultShareAllocation: 20,
};

/** CTO - Technical leadership */
export const CTO_ROLE: Role = {
  id: 'cto',
  name: 'CTO',
  description: 'Chief Technology Officer - Technical strategy and development',
  icon: 'cpu',
  permissions: ['tech', 'read', 'write'],
  defaultShareAllocation: 15,
};

/** CMO - Marketing leadership */
export const CMO_ROLE: Role = {
  id: 'cmo',
  name: 'CMO',
  description: 'Chief Marketing Officer - Marketing and brand strategy',
  icon: 'megaphone',
  permissions: ['marketing', 'read', 'write'],
  defaultShareAllocation: 10,
};

/** CFO - Financial leadership */
export const CFO_ROLE: Role = {
  id: 'cfo',
  name: 'CFO',
  description: 'Chief Financial Officer - Financial strategy and reporting',
  icon: 'banknote',
  permissions: ['finance', 'read', 'write'],
  defaultShareAllocation: 10,
};

/** COO - Operations leadership */
export const COO_ROLE: Role = {
  id: 'coo',
  name: 'COO',
  description: 'Chief Operating Officer - Operations and execution',
  icon: 'settings',
  permissions: ['operations', 'hr', 'read', 'write'],
  defaultShareAllocation: 10,
};

/** Developer - Technical contributor */
export const DEVELOPER_ROLE: Role = {
  id: 'developer',
  name: 'Developer',
  description: 'Software developer - Build and maintain technical systems',
  icon: 'code',
  permissions: ['tech', 'read', 'write'],
  defaultShareAllocation: 3,
};

/** Designer - Creative contributor */
export const DESIGNER_ROLE: Role = {
  id: 'designer',
  name: 'Designer',
  description: 'Product/UI designer - Design user experiences',
  icon: 'palette',
  permissions: ['marketing', 'read', 'write'],
  defaultShareAllocation: 3,
};

/** Marketer - Marketing contributor */
export const MARKETER_ROLE: Role = {
  id: 'marketer',
  name: 'Marketer',
  description: 'Marketing specialist - Execute marketing campaigns',
  icon: 'trending-up',
  permissions: ['marketing', 'read', 'write'],
  defaultShareAllocation: 2,
};

/** Analyst - Data and business analysis */
export const ANALYST_ROLE: Role = {
  id: 'analyst',
  name: 'Data Analyst',
  description: 'Data analyst - Analyze data and provide insights',
  icon: 'bar-chart',
  permissions: ['read'],
  defaultShareAllocation: 2,
};

/** Legal - Legal affairs */
export const LEGAL_ROLE: Role = {
  id: 'legal',
  name: 'Legal Counsel',
  description: 'Legal counsel - Handle legal matters and compliance',
  icon: 'scale',
  permissions: ['legal', 'read'],
  defaultShareAllocation: 2,
};

/** Advisor - External advisor */
export const ADVISOR_ROLE: Role = {
  id: 'advisor',
  name: 'Advisor',
  description: 'Advisor - Provide strategic guidance',
  icon: 'lightbulb',
  permissions: ['read'],
  defaultShareAllocation: 1,
};

/** Investor - Financial backer */
export const INVESTOR_ROLE: Role = {
  id: 'investor',
  name: 'Investor',
  description: 'Investor - Financial backer with share ownership',
  icon: 'wallet',
  permissions: ['read'],
  defaultShareAllocation: 0, // Varies by investment
};

/** Contributor - Community contributor */
export const CONTRIBUTOR_ROLE: Role = {
  id: 'contributor',
  name: 'Contributor',
  description: 'Contributor - Part-time or community contributor',
  icon: 'users',
  permissions: ['read', 'write'],
  defaultShareAllocation: 0.5,
};

/** Member - Basic member */
export const MEMBER_ROLE: Role = {
  id: 'member',
  name: 'Member',
  description: 'Member - Basic organizational membership',
  icon: 'user',
  permissions: ['read'],
  defaultShareAllocation: 0,
};

// ============================================================================
// Role Collections
// ============================================================================

/** All predefined roles */
export const PREDEFINED_ROLES: Role[] = [
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
];

/** Role lookup by ID */
export const ROLES_BY_ID: Record<RoleId, Role> = {
  ceo: CEO_ROLE,
  cto: CTO_ROLE,
  cmo: CMO_ROLE,
  cfo: CFO_ROLE,
  coo: COO_ROLE,
  developer: DEVELOPER_ROLE,
  designer: DESIGNER_ROLE,
  marketer: MARKETER_ROLE,
  analyst: ANALYST_ROLE,
  legal: LEGAL_ROLE,
  advisor: ADVISOR_ROLE,
  investor: INVESTOR_ROLE,
  contributor: CONTRIBUTOR_ROLE,
  member: MEMBER_ROLE,
  custom: {
    id: 'custom',
    name: 'Custom Role',
    description: 'Custom role with configurable permissions',
    icon: 'settings',
    permissions: [],
    defaultShareAllocation: 0,
    isCustom: true,
  },
};

/** Executive roles (C-suite) */
export const EXECUTIVE_ROLES: Role[] = [
  CEO_ROLE,
  CTO_ROLE,
  CMO_ROLE,
  CFO_ROLE,
  COO_ROLE,
];

/** Team member roles */
export const TEAM_ROLES: Role[] = [
  DEVELOPER_ROLE,
  DESIGNER_ROLE,
  MARKETER_ROLE,
  ANALYST_ROLE,
  LEGAL_ROLE,
];

/** External roles */
export const EXTERNAL_ROLES: Role[] = [
  ADVISOR_ROLE,
  INVESTOR_ROLE,
  CONTRIBUTOR_ROLE,
  MEMBER_ROLE,
];

// ============================================================================
// Role Utilities
// ============================================================================

/**
 * Get role by ID
 */
export function getRole(roleId: string): Role | undefined {
  return PREDEFINED_ROLES.find((r) => r.id === roleId);
}

/**
 * Get role by ID or throw if not found
 */
export function getRoleOrThrow(roleId: string): Role {
  const role = getRole(roleId);
  if (!role) {
    throw new Error(`Role not found: ${roleId}`);
  }
  return role;
}

/**
 * Check if role has specific permission
 */
export function roleHasPermission(
  role: Role,
  permission: PermissionCategory
): boolean {
  return role.permissions.includes(permission);
}

/**
 * Check if role has any of the specified permissions
 */
export function roleHasAnyPermission(
  role: Role,
  permissions: PermissionCategory[]
): boolean {
  return permissions.some((p) => role.permissions.includes(p));
}

/**
 * Check if role has all of the specified permissions
 */
export function roleHasAllPermissions(
  role: Role,
  permissions: PermissionCategory[]
): boolean {
  return permissions.every((p) => role.permissions.includes(p));
}

/**
 * Check if role is an executive role
 */
export function isExecutiveRole(roleId: string): boolean {
  return EXECUTIVE_ROLES.some((r) => r.id === roleId);
}

/**
 * Check if role has admin permissions
 */
export function isAdminRole(role: Role): boolean {
  return role.permissions.includes('admin');
}

/**
 * Create a custom role
 */
export function createCustomRole(
  id: string,
  name: string,
  description: string,
  permissions: PermissionCategory[],
  options?: {
    icon?: string;
    defaultShareAllocation?: number;
  }
): Role {
  return {
    id,
    name,
    description,
    icon: options?.icon || 'settings',
    permissions,
    defaultShareAllocation: options?.defaultShareAllocation || 0,
    isCustom: true,
  };
}

/**
 * Get roles with specific permission
 */
export function getRolesWithPermission(
  permission: PermissionCategory
): Role[] {
  return PREDEFINED_ROLES.filter((r) => r.permissions.includes(permission));
}

/**
 * Get all unique permissions from a set of roles
 */
export function getCombinedPermissions(roles: Role[]): PermissionCategory[] {
  const permissions = new Set<PermissionCategory>();
  for (const role of roles) {
    for (const perm of role.permissions) {
      permissions.add(perm);
    }
  }
  return Array.from(permissions);
}
