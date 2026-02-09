// Role-Based Access Control (RBAC) System

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  level: number;
  permissions: Permission[];
  description: string;
}

// Define roles and their permissions
export const ROLES: Record<string, Role> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    level: 10,
    description: 'Full system control and management',
    permissions: [
      { resource: '*', action: '*' }, // All resources, all actions
    ]
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    level: 5,
    description: 'Administrative access to most features',
    permissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'suspend' },
      { resource: 'users', action: 'activate' },
      { resource: 'projects', action: '*' },
      { resource: 'teams', action: '*' },
      { resource: 'finances', action: 'read' },
      { resource: 'analytics', action: 'read' },
    ]
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    level: 3,
    description: 'Create and manage projects',
    permissions: [
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'read', conditions: { owner: true } },
      { resource: 'projects', action: 'update', conditions: { owner: true } },
      { resource: 'projects', action: 'delete', conditions: { owner: true } },
      { resource: 'teams', action: 'create' },
      { resource: 'teams', action: 'read', conditions: { member: true } },
      { resource: 'teams', action: 'update', conditions: { owner: true } },
      { resource: 'ai_agents', action: '*' },
    ]
  },
  investor: {
    id: 'investor',
    name: 'Investor',
    level: 2,
    description: 'Access investment opportunities',
    permissions: [
      { resource: 'projects', action: 'read' },
      { resource: 'investments', action: '*' },
      { resource: 'analytics', action: 'read', conditions: { owner: true } },
      { resource: 'portfolio', action: '*' },
    ]
  },
  client: {
    id: 'client',
    name: 'Client',
    level: 2,
    description: 'Manage client projects',
    permissions: [
      { resource: 'projects', action: 'read', conditions: { client: true } },
      { resource: 'projects', action: 'update', conditions: { client: true } },
      { resource: 'communications', action: '*' },
      { resource: 'payments', action: '*' },
    ]
  },
  user: {
    id: 'user',
    name: 'User',
    level: 1,
    description: 'Basic platform access',
    permissions: [
      { resource: 'profile', action: '*' },
      { resource: 'dashboard', action: 'read' },
      { resource: 'projects', action: 'read', conditions: { public: true } },
    ]
  }
};

// RBAC class for permission checking
export class RBAC {
  private userRole: Role;
  private userPermissions: Permission[];

  constructor(userRole: string, customPermissions?: Permission[]) {
    this.userRole = ROLES[userRole] || ROLES.user;
    this.userPermissions = [
      ...this.userRole.permissions,
      ...(customPermissions || [])
    ];
  }

  // Check if user has permission for a specific resource and action
  can(resource: string, action: string, context?: Record<string, any>): boolean {
    // Super admin has all permissions
    if (this.userRole.level === 10) return true;

    // Check for wildcard permissions
    const wildcardPermission = this.userPermissions.find(
      p => p.resource === '*' && p.action === '*'
    );
    if (wildcardPermission) return true;

    // Check for resource wildcard
    const resourceWildcard = this.userPermissions.find(
      p => p.resource === '*' && p.action === action
    );
    if (resourceWildcard) return true;

    // Check for specific permission
    const permission = this.userPermissions.find(
      p => p.resource === resource && p.action === action
    );

    if (!permission) return false;

    // Check conditions if they exist
    if (permission.conditions && context) {
      return this.checkConditions(permission.conditions, context);
    }

    return true;
  }

  // Check multiple permissions (all must be true)
  canAll(permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>): boolean {
    return permissions.every(p => this.can(p.resource, p.action, p.context));
  }

  // Check multiple permissions (any can be true)
  canAny(permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>): boolean {
    return permissions.some(p => this.can(p.resource, p.action, p.context));
  }

  // Get user's role level
  getRoleLevel(): number {
    return this.userRole.level;
  }

  // Get user's role name
  getRoleName(): string {
    return this.userRole.name;
  }

  // Get user's permissions
  getPermissions(): Permission[] {
    return this.userPermissions;
  }

  // Check if user has higher or equal role level
  hasRoleLevel(minLevel: number): boolean {
    return this.userRole.level >= minLevel;
  }

  // Check if user has specific role
  hasRole(roleId: string): boolean {
    return this.userRole.id === roleId;
  }

  private checkConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'owner' && value === true) {
        if (!context.ownerId || context.ownerId !== context.userId) {
          return false;
        }
      }
      if (key === 'member' && value === true) {
        if (!context.memberIds || !context.memberIds.includes(context.userId)) {
          return false;
        }
      }
      if (key === 'client' && value === true) {
        if (!context.clientId || context.clientId !== context.userId) {
          return false;
        }
      }
      if (key === 'public' && value === true) {
        if (!context.isPublic) {
          return false;
        }
      }
    }
    return true;
  }
}

// Helper function to create RBAC instance from user data
export function createRBAC(userRole: string, customPermissions?: Permission[]): RBAC {
  return new RBAC(userRole, customPermissions);
}

// Route protection helper
export function requirePermission(resource: string, action: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const rbac = args[0]?.rbac; // Assuming RBAC instance is passed as first argument
      if (!rbac || !rbac.can(resource, action)) {
        throw new Error(`Insufficient permissions: ${action} on ${resource}`);
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Middleware for Next.js API routes
export function withRBAC(handler: Function, requiredPermissions: Array<{ resource: string; action: string }>) {
  return async (req: any, res: any) => {
    try {
      // Get user role from session/token
      const userRole = req.user?.role || 'user';
      const rbac = createRBAC(userRole);

      // Check if user has all required permissions
      const hasPermission = rbac.canAll(requiredPermissions);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermissions,
          userRole: userRole
        });
      }

      // Add RBAC instance to request for use in handler
      req.rbac = rbac;
      
      return handler(req, res);
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Component-level permission checking for React
export function useRBAC(userRole: string, customPermissions?: Permission[]) {
  const rbac = createRBAC(userRole, customPermissions);
  
  return {
    can: (resource: string, action: string, context?: Record<string, any>) => 
      rbac.can(resource, action, context),
    canAll: (permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>) => 
      rbac.canAll(permissions),
    canAny: (permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>) => 
      rbac.canAny(permissions),
    hasRoleLevel: (minLevel: number) => rbac.hasRoleLevel(minLevel),
    hasRole: (roleId: string) => rbac.hasRole(roleId),
    getRoleLevel: () => rbac.getRoleLevel(),
    getRoleName: () => rbac.getRoleName(),
    getPermissions: () => rbac.getPermissions(),
  };
} 