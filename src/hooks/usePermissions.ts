import { useAuth } from "@/core/auth/useAuth";
import { useAdminStore } from "@/core/store";
import type { ResourceDefinition } from "@/types/resource-types";

export function usePermissions() {
  const { roles: authRoles, isAuthenticated, enabled } = useAuth();
  const globalPermissions = useAdminStore((s) => s.globalPermissions);

  const hasPermission = (
    resource: ResourceDefinition | string,
    action: "create" | "edit" | "delete" | "view" | string,
    userRoleProp?: string
  ): boolean => {
    const resourceName = typeof resource === "string" ? resource : resource.name;
    const resDef = typeof resource === "string" ? useAdminStore.getState().resources.find(r => r.name === resource) : resource;
    
    // Active roles: mix of AuthStore roles and the userRole prop passed to Adminix
    const activeRoles = new Set<string>();
    if (enabled && isAuthenticated) {
      authRoles.forEach(r => activeRoles.add(r));
    }
    if (userRoleProp) {
      activeRoles.add(userRoleProp);
    }

    // 1. Check Global Permissions Config
    if (globalPermissions && globalPermissions[resourceName]) {
      const allowedRolesForAction = globalPermissions[resourceName][action];
      if (allowedRolesForAction && allowedRolesForAction.length > 0) {
        if (activeRoles.size === 0) return false;
        const hasRole = allowedRolesForAction.some(r => activeRoles.has(r));
        if (!hasRole) return false;
      }
    }

    // 2. Check Resource-level permissions
    if (resDef?.permissions) {
      // Check action specific permission boolean flag
      const actionAllowed = resDef.permissions[action as keyof typeof resDef.permissions];
      if (actionAllowed === false) return false;

      // Check RBAC roles array
      if (resDef.permissions.roles && resDef.permissions.roles.length > 0) {
        if (activeRoles.size === 0) return false;
        const hasRole = resDef.permissions.roles.some(r => activeRoles.has(r));
        if (!hasRole) return false;
      }
    }

    return true; // Default allow if no restrictions defined
  };

  return { hasPermission };
}
