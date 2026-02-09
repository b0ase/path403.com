"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ADVISOR_ROLE: () => ADVISOR_ROLE,
  ANALYST_ROLE: () => ANALYST_ROLE,
  CEO_ROLE: () => CEO_ROLE,
  CFO_ROLE: () => CFO_ROLE,
  CMO_ROLE: () => CMO_ROLE,
  CONTRIBUTOR_ROLE: () => CONTRIBUTOR_ROLE,
  COO_ROLE: () => COO_ROLE,
  CTO_ROLE: () => CTO_ROLE,
  DESIGNER_ROLE: () => DESIGNER_ROLE,
  DEVELOPER_ROLE: () => DEVELOPER_ROLE,
  EXECUTIVE_ROLES: () => EXECUTIVE_ROLES,
  EXTERNAL_ROLES: () => EXTERNAL_ROLES,
  INVESTOR_ROLE: () => INVESTOR_ROLE,
  LEGAL_ROLE: () => LEGAL_ROLE,
  MARKETER_ROLE: () => MARKETER_ROLE,
  MEMBER_ROLE: () => MEMBER_ROLE,
  OrganizationManager: () => OrganizationManager,
  PREDEFINED_ROLES: () => PREDEFINED_ROLES,
  ROLES_BY_ID: () => ROLES_BY_ID,
  TEAM_ROLES: () => TEAM_ROLES,
  createCustomRole: () => createCustomRole,
  createOrganizationManager: () => createOrganizationManager,
  getCombinedPermissions: () => getCombinedPermissions,
  getRole: () => getRole,
  getRoleOrThrow: () => getRoleOrThrow,
  getRolesWithPermission: () => getRolesWithPermission,
  isAdminRole: () => isAdminRole,
  isExecutiveRole: () => isExecutiveRole,
  roleHasAllPermissions: () => roleHasAllPermissions,
  roleHasAnyPermission: () => roleHasAnyPermission,
  roleHasPermission: () => roleHasPermission
});
module.exports = __toCommonJS(index_exports);

// src/roles.ts
var CEO_ROLE = {
  id: "ceo",
  name: "CEO",
  description: "Chief Executive Officer - Full organizational authority",
  icon: "crown",
  permissions: ["admin", "finance", "tech", "marketing", "legal", "hr", "operations", "read", "write"],
  defaultShareAllocation: 20
};
var CTO_ROLE = {
  id: "cto",
  name: "CTO",
  description: "Chief Technology Officer - Technical strategy and development",
  icon: "cpu",
  permissions: ["tech", "read", "write"],
  defaultShareAllocation: 15
};
var CMO_ROLE = {
  id: "cmo",
  name: "CMO",
  description: "Chief Marketing Officer - Marketing and brand strategy",
  icon: "megaphone",
  permissions: ["marketing", "read", "write"],
  defaultShareAllocation: 10
};
var CFO_ROLE = {
  id: "cfo",
  name: "CFO",
  description: "Chief Financial Officer - Financial strategy and reporting",
  icon: "banknote",
  permissions: ["finance", "read", "write"],
  defaultShareAllocation: 10
};
var COO_ROLE = {
  id: "coo",
  name: "COO",
  description: "Chief Operating Officer - Operations and execution",
  icon: "settings",
  permissions: ["operations", "hr", "read", "write"],
  defaultShareAllocation: 10
};
var DEVELOPER_ROLE = {
  id: "developer",
  name: "Developer",
  description: "Software developer - Build and maintain technical systems",
  icon: "code",
  permissions: ["tech", "read", "write"],
  defaultShareAllocation: 3
};
var DESIGNER_ROLE = {
  id: "designer",
  name: "Designer",
  description: "Product/UI designer - Design user experiences",
  icon: "palette",
  permissions: ["marketing", "read", "write"],
  defaultShareAllocation: 3
};
var MARKETER_ROLE = {
  id: "marketer",
  name: "Marketer",
  description: "Marketing specialist - Execute marketing campaigns",
  icon: "trending-up",
  permissions: ["marketing", "read", "write"],
  defaultShareAllocation: 2
};
var ANALYST_ROLE = {
  id: "analyst",
  name: "Data Analyst",
  description: "Data analyst - Analyze data and provide insights",
  icon: "bar-chart",
  permissions: ["read"],
  defaultShareAllocation: 2
};
var LEGAL_ROLE = {
  id: "legal",
  name: "Legal Counsel",
  description: "Legal counsel - Handle legal matters and compliance",
  icon: "scale",
  permissions: ["legal", "read"],
  defaultShareAllocation: 2
};
var ADVISOR_ROLE = {
  id: "advisor",
  name: "Advisor",
  description: "Advisor - Provide strategic guidance",
  icon: "lightbulb",
  permissions: ["read"],
  defaultShareAllocation: 1
};
var INVESTOR_ROLE = {
  id: "investor",
  name: "Investor",
  description: "Investor - Financial backer with share ownership",
  icon: "wallet",
  permissions: ["read"],
  defaultShareAllocation: 0
  // Varies by investment
};
var CONTRIBUTOR_ROLE = {
  id: "contributor",
  name: "Contributor",
  description: "Contributor - Part-time or community contributor",
  icon: "users",
  permissions: ["read", "write"],
  defaultShareAllocation: 0.5
};
var MEMBER_ROLE = {
  id: "member",
  name: "Member",
  description: "Member - Basic organizational membership",
  icon: "user",
  permissions: ["read"],
  defaultShareAllocation: 0
};
var PREDEFINED_ROLES = [
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
  MEMBER_ROLE
];
var ROLES_BY_ID = {
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
    id: "custom",
    name: "Custom Role",
    description: "Custom role with configurable permissions",
    icon: "settings",
    permissions: [],
    defaultShareAllocation: 0,
    isCustom: true
  }
};
var EXECUTIVE_ROLES = [
  CEO_ROLE,
  CTO_ROLE,
  CMO_ROLE,
  CFO_ROLE,
  COO_ROLE
];
var TEAM_ROLES = [
  DEVELOPER_ROLE,
  DESIGNER_ROLE,
  MARKETER_ROLE,
  ANALYST_ROLE,
  LEGAL_ROLE
];
var EXTERNAL_ROLES = [
  ADVISOR_ROLE,
  INVESTOR_ROLE,
  CONTRIBUTOR_ROLE,
  MEMBER_ROLE
];
function getRole(roleId) {
  return PREDEFINED_ROLES.find((r) => r.id === roleId);
}
function getRoleOrThrow(roleId) {
  const role = getRole(roleId);
  if (!role) {
    throw new Error(`Role not found: ${roleId}`);
  }
  return role;
}
function roleHasPermission(role, permission) {
  return role.permissions.includes(permission);
}
function roleHasAnyPermission(role, permissions) {
  return permissions.some((p) => role.permissions.includes(p));
}
function roleHasAllPermissions(role, permissions) {
  return permissions.every((p) => role.permissions.includes(p));
}
function isExecutiveRole(roleId) {
  return EXECUTIVE_ROLES.some((r) => r.id === roleId);
}
function isAdminRole(role) {
  return role.permissions.includes("admin");
}
function createCustomRole(id, name, description, permissions, options) {
  return {
    id,
    name,
    description,
    icon: options?.icon || "settings",
    permissions,
    defaultShareAllocation: options?.defaultShareAllocation || 0,
    isCustom: true
  };
}
function getRolesWithPermission(permission) {
  return PREDEFINED_ROLES.filter((r) => r.permissions.includes(permission));
}
function getCombinedPermissions(roles) {
  const permissions = /* @__PURE__ */ new Set();
  for (const role of roles) {
    for (const perm of role.permissions) {
      permissions.add(perm);
    }
  }
  return Array.from(permissions);
}

// src/organization.ts
var DEFAULT_SETTINGS = {
  requireKyc: false,
  allowCustomRoles: true,
  minShareAllocation: 0,
  allowShareTransfers: true
};
var OrganizationManager = class {
  constructor() {
    this.organizations = /* @__PURE__ */ new Map();
  }
  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // ==========================================================================
  // Organization CRUD
  // ==========================================================================
  /**
   * Create a new organization
   */
  createOrganization(input) {
    const id = this.generateId("org");
    const now = /* @__PURE__ */ new Date();
    const org = {
      id,
      name: input.name,
      description: input.description,
      tokenSymbol: input.tokenSymbol.toUpperCase(),
      tokenAddress: input.tokenAddress,
      totalShares: input.totalShares || 1e6,
      status: "pending",
      members: [],
      customRoles: [],
      createdAt: now,
      updatedAt: now,
      settings: { ...DEFAULT_SETTINGS, ...input.settings },
      metadata: input.metadata
    };
    this.organizations.set(id, org);
    return org;
  }
  /**
   * Get organization by ID
   */
  getOrganization(id) {
    return this.organizations.get(id);
  }
  /**
   * Get organization or throw if not found
   */
  getOrganizationOrThrow(id) {
    const org = this.getOrganization(id);
    if (!org) {
      throw new Error(`Organization not found: ${id}`);
    }
    return org;
  }
  /**
   * Update organization
   */
  updateOrganization(id, input) {
    const org = this.getOrganizationOrThrow(id);
    const updated = {
      ...org,
      name: input.name ?? org.name,
      description: input.description ?? org.description,
      tokenSymbol: input.tokenSymbol?.toUpperCase() ?? org.tokenSymbol,
      tokenAddress: input.tokenAddress ?? org.tokenAddress,
      totalShares: input.totalShares ?? org.totalShares,
      status: input.status ?? org.status,
      settings: input.settings ? { ...DEFAULT_SETTINGS, ...org.settings, ...input.settings } : org.settings ?? DEFAULT_SETTINGS,
      metadata: input.metadata ? { ...org.metadata, ...input.metadata } : org.metadata,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.organizations.set(id, updated);
    return updated;
  }
  /**
   * Delete organization
   */
  deleteOrganization(id) {
    return this.organizations.delete(id);
  }
  /**
   * List all organizations
   */
  listOrganizations(filter) {
    const orgs = Array.from(this.organizations.values());
    if (filter?.status) {
      return orgs.filter((o) => o.status === filter.status);
    }
    return orgs;
  }
  /**
   * Activate organization
   */
  activateOrganization(id) {
    return this.updateOrganization(id, { status: "active" });
  }
  /**
   * Archive organization
   */
  archiveOrganization(id) {
    return this.updateOrganization(id, { status: "archived" });
  }
  // ==========================================================================
  // Member Management
  // ==========================================================================
  /**
   * Add member to organization
   */
  addMember(organizationId, input) {
    const org = this.getOrganizationOrThrow(organizationId);
    if (org.settings?.maxMembers && org.members.length >= org.settings.maxMembers) {
      throw new Error(
        `Organization has reached maximum members: ${org.settings.maxMembers}`
      );
    }
    const role = this.getEffectiveRole(org, input.roleId);
    if (!role) {
      throw new Error(`Role not found: ${input.roleId}`);
    }
    const member = {
      id: this.generateId("mem"),
      handle: input.handle,
      displayName: input.displayName,
      email: input.email,
      tokenAddress: input.tokenAddress,
      shareAllocation: input.shareAllocation ?? role.defaultShareAllocation,
      roleId: input.roleId,
      organizationId,
      profileId: input.profileId,
      kycStatus: "none",
      joinedAt: /* @__PURE__ */ new Date(),
      metadata: input.metadata
    };
    this.validateShareAllocation(org, member.shareAllocation, void 0);
    org.members.push(member);
    org.updatedAt = /* @__PURE__ */ new Date();
    return member;
  }
  /**
   * Get member by ID
   */
  getMember(organizationId, memberId) {
    const org = this.getOrganization(organizationId);
    return org?.members.find((m) => m.id === memberId);
  }
  /**
   * Get member by handle
   */
  getMemberByHandle(organizationId, handle) {
    const org = this.getOrganization(organizationId);
    return org?.members.find((m) => m.handle === handle);
  }
  /**
   * Update member
   */
  updateMember(organizationId, memberId, input) {
    const org = this.getOrganizationOrThrow(organizationId);
    const memberIndex = org.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
      throw new Error(`Member not found: ${memberId}`);
    }
    const member = org.members[memberIndex];
    if (input.shareAllocation !== void 0) {
      this.validateShareAllocation(org, input.shareAllocation, memberId);
    }
    if (input.roleId) {
      const role = this.getEffectiveRole(org, input.roleId);
      if (!role) {
        throw new Error(`Role not found: ${input.roleId}`);
      }
    }
    const updated = {
      ...member,
      displayName: input.displayName ?? member.displayName,
      email: input.email ?? member.email,
      tokenAddress: input.tokenAddress ?? member.tokenAddress,
      shareAllocation: input.shareAllocation ?? member.shareAllocation,
      roleId: input.roleId ?? member.roleId,
      kycStatus: input.kycStatus ?? member.kycStatus,
      metadata: input.metadata ? { ...member.metadata, ...input.metadata } : member.metadata
    };
    org.members[memberIndex] = updated;
    org.updatedAt = /* @__PURE__ */ new Date();
    return updated;
  }
  /**
   * Remove member from organization
   */
  removeMember(organizationId, memberId) {
    const org = this.getOrganizationOrThrow(organizationId);
    const initialLength = org.members.length;
    org.members = org.members.filter((m) => m.id !== memberId);
    org.updatedAt = /* @__PURE__ */ new Date();
    return org.members.length < initialLength;
  }
  /**
   * List organization members
   */
  listMembers(organizationId, filter) {
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
  validateShareAllocation(org, newAllocation, excludeMemberId) {
    const minAllocation = org.settings?.minShareAllocation ?? 0;
    if (newAllocation < minAllocation) {
      throw new Error(
        `Share allocation must be at least ${minAllocation}%`
      );
    }
    const currentTotal = org.members.filter((m) => m.id !== excludeMemberId).reduce((sum, m) => sum + m.shareAllocation, 0);
    if (currentTotal + newAllocation > 100) {
      throw new Error(
        `Total share allocation would exceed 100% (current: ${currentTotal}%, new: ${newAllocation}%)`
      );
    }
  }
  /**
   * Get share distribution for organization
   */
  getShareDistribution(organizationId) {
    const org = this.getOrganizationOrThrow(organizationId);
    const allocations = org.members.map((m) => ({
      memberId: m.id,
      handle: m.handle,
      displayName: m.displayName,
      shares: Math.floor(m.shareAllocation / 100 * org.totalShares),
      percentage: m.shareAllocation,
      tokenAddress: m.tokenAddress
    }));
    const allocatedPercent = org.members.reduce(
      (sum, m) => sum + m.shareAllocation,
      0
    );
    const allocatedShares = Math.floor(
      allocatedPercent / 100 * org.totalShares
    );
    return {
      organizationId,
      totalShares: org.totalShares,
      allocatedShares,
      unallocatedShares: org.totalShares - allocatedShares,
      allocations
    };
  }
  /**
   * Transfer shares between members
   */
  transferShares(organizationId, transfer) {
    const org = this.getOrganizationOrThrow(organizationId);
    if (!org.settings?.allowShareTransfers) {
      throw new Error("Share transfers are not allowed for this organization");
    }
    const fromMember = org.members.find((m) => m.id === transfer.fromMemberId);
    const toMember = org.members.find((m) => m.id === transfer.toMemberId);
    if (!fromMember) {
      throw new Error(`From member not found: ${transfer.fromMemberId}`);
    }
    if (!toMember) {
      throw new Error(`To member not found: ${transfer.toMemberId}`);
    }
    const sharePercent = transfer.shares / org.totalShares * 100;
    if (fromMember.shareAllocation < sharePercent) {
      throw new Error(
        `Insufficient shares: ${fromMember.displayName} has ${fromMember.shareAllocation}%, trying to transfer ${sharePercent}%`
      );
    }
    fromMember.shareAllocation -= sharePercent;
    toMember.shareAllocation += sharePercent;
    org.updatedAt = /* @__PURE__ */ new Date();
    return { from: fromMember, to: toMember };
  }
  // ==========================================================================
  // Role Management
  // ==========================================================================
  /**
   * Get effective role (predefined or custom)
   */
  getEffectiveRole(org, roleId) {
    const predefined = getRole(roleId);
    if (predefined) return predefined;
    return org.customRoles.find((r) => r.id === roleId);
  }
  /**
   * Add custom role to organization
   */
  addCustomRole(organizationId, role) {
    const org = this.getOrganizationOrThrow(organizationId);
    if (!org.settings?.allowCustomRoles) {
      throw new Error("Custom roles are not allowed for this organization");
    }
    if (getRole(role.id) || org.customRoles.some((r) => r.id === role.id)) {
      throw new Error(`Role already exists: ${role.id}`);
    }
    const customRole = { ...role, isCustom: true };
    org.customRoles.push(customRole);
    org.updatedAt = /* @__PURE__ */ new Date();
    return customRole;
  }
  /**
   * Remove custom role from organization
   */
  removeCustomRole(organizationId, roleId) {
    const org = this.getOrganizationOrThrow(organizationId);
    const membersWithRole = org.members.filter((m) => m.roleId === roleId);
    if (membersWithRole.length > 0) {
      throw new Error(
        `Cannot remove role: ${membersWithRole.length} members have this role`
      );
    }
    const initialLength = org.customRoles.length;
    org.customRoles = org.customRoles.filter((r) => r.id !== roleId);
    org.updatedAt = /* @__PURE__ */ new Date();
    return org.customRoles.length < initialLength;
  }
  /**
   * List all roles for organization (predefined + custom)
   */
  listRoles(organizationId) {
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
  checkPermission(organizationId, memberId, requiredPermissions, options) {
    const org = this.getOrganization(organizationId);
    if (!org) {
      return {
        allowed: false,
        reason: "Organization not found",
        requiredPermissions,
        memberPermissions: []
      };
    }
    const member = org.members.find((m) => m.id === memberId);
    if (!member) {
      return {
        allowed: false,
        reason: "Member not found",
        requiredPermissions,
        memberPermissions: []
      };
    }
    const role = this.getEffectiveRole(org, member.roleId);
    if (!role) {
      return {
        allowed: false,
        reason: "Role not found",
        requiredPermissions,
        memberPermissions: []
      };
    }
    const hasPermission = options?.requireAll ? roleHasAllPermissions(role, requiredPermissions) : roleHasAnyPermission(role, requiredPermissions);
    return {
      allowed: hasPermission,
      reason: hasPermission ? void 0 : "Insufficient permissions",
      requiredPermissions,
      memberPermissions: role.permissions
    };
  }
  /**
   * Check if member can perform action
   */
  canPerformAction(organizationId, memberId, action) {
    const actionPermissions = {
      "org:update": ["admin"],
      "org:delete": ["admin"],
      "member:add": ["admin", "hr"],
      "member:remove": ["admin", "hr"],
      "member:update": ["admin", "hr"],
      "role:add": ["admin"],
      "role:remove": ["admin"],
      "shares:transfer": ["admin", "finance"],
      "finance:view": ["admin", "finance"],
      "tech:deploy": ["admin", "tech"],
      "marketing:publish": ["admin", "marketing"]
    };
    const required = actionPermissions[action];
    if (!required) return false;
    const result = this.checkPermission(organizationId, memberId, required);
    return result.allowed;
  }
};
function createOrganizationManager() {
  return new OrganizationManager();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADVISOR_ROLE,
  ANALYST_ROLE,
  CEO_ROLE,
  CFO_ROLE,
  CMO_ROLE,
  CONTRIBUTOR_ROLE,
  COO_ROLE,
  CTO_ROLE,
  DESIGNER_ROLE,
  DEVELOPER_ROLE,
  EXECUTIVE_ROLES,
  EXTERNAL_ROLES,
  INVESTOR_ROLE,
  LEGAL_ROLE,
  MARKETER_ROLE,
  MEMBER_ROLE,
  OrganizationManager,
  PREDEFINED_ROLES,
  ROLES_BY_ID,
  TEAM_ROLES,
  createCustomRole,
  createOrganizationManager,
  getCombinedPermissions,
  getRole,
  getRoleOrThrow,
  getRolesWithPermission,
  isAdminRole,
  isExecutiveRole,
  roleHasAllPermissions,
  roleHasAnyPermission,
  roleHasPermission
});
//# sourceMappingURL=index.cjs.map