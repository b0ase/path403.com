import { useAuth } from '@/components/Providers';
import { useRBAC as useRBACBase, ROLES } from '@/lib/rbac';

export function useRBAC() {
  const { session } = useAuth();

  // Get user role from session, default to 'user'
  const userRole = session?.user?.user_metadata?.role || 'user';

  // Create RBAC instance
  const rbac = useRBACBase(userRole);

  // Enhanced helper functions
  const isSuperAdmin = () => session?.user?.email === (process.env.ADMIN_EMAIL || 'richardwboase@gmail.com') || rbac.hasRole('super_admin');
  const isAdmin = () => rbac.hasRoleLevel(5);
  const isBuilder = () => rbac.hasRole('builder');
  const isInvestor = () => rbac.hasRole('investor');
  const isClient = () => rbac.hasRole('client');
  const isUser = () => rbac.hasRole('user');

  // Get available roles for role selection
  const getAvailableRoles = () => {
    const roles = Object.values(ROLES);

    // If user is super admin, they can assign any role
    if (isSuperAdmin()) {
      return roles;
    }

    // If user is admin, they can assign roles up to their level
    if (isAdmin()) {
      return roles.filter(role => role.level < 10);
    }

    // Regular users can only see basic roles
    return roles.filter(role => role.level <= 3);
  };

  // Check if user can assign a specific role
  const canAssignRole = (targetRoleId: string) => {
    const targetRole = ROLES[targetRoleId];
    if (!targetRole) return false;

    // Super admin can assign any role
    if (isSuperAdmin()) return true;

    // Admin can assign roles below super admin level
    if (isAdmin()) return targetRole.level < 10;

    // Regular users cannot assign roles
    return false;
  };

  // Get role display information
  const getRoleInfo = (roleId: string) => {
    return ROLES[roleId] || null;
  };

  // Check if user can access a specific route
  const canAccessRoute = (route: string) => {
    const routePermissions: Record<string, Array<{ resource: string; action: string }>> = {
      '/auth/admin/super-admin': [{ resource: 'admin', action: 'super_admin' }],
      '/auth/admin': [{ resource: 'admin', action: 'access' }],
      '/auth/projects': [{ resource: 'projects', action: 'read' }],
      '/auth/teams': [{ resource: 'teams', action: 'read' }],
      '/auth/finances': [{ resource: 'finances', action: 'read' }],
      '/auth/analytics': [{ resource: 'analytics', action: 'read' }],
      '/boardroom': [{ resource: 'community', action: 'access' }],
      '/exchange': [{ resource: 'exchange', action: 'access' }],
      '/studio': [{ resource: 'studio', action: 'access' }],
    };

    const permissions = routePermissions[route];
    if (!permissions) return true; // Default to allow if no specific permissions defined

    return rbac.canAll(permissions);
  };

  return {
    // Basic RBAC functions
    ...rbac,

    // Enhanced role checking
    isSuperAdmin,
    isAdmin,
    isBuilder,
    isInvestor,
    isClient,
    isUser,

    // Role management
    getAvailableRoles,
    canAssignRole,
    getRoleInfo,

    // Route access
    canAccessRoute,

    // User info
    userRole,
    userRoleLevel: rbac.getRoleLevel(),
    userRoleName: rbac.getRoleName(),

    // Session info
    isAuthenticated: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  };
} 