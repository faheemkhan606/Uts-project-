import { usePage } from '@inertiajs/react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  roles: string[];
  permissions: string[];
}

export interface PagePropsWithAuth {
  auth: AuthState;
  [key: string]: any;
}

/**
 * Reusable authorization hook for React / Inertia UI.
 *
 * NOTE: Frontend checks are strictly for UX state (e.g. conditional button rendering).
 * The server-side Laravel Gates and Policies remain the mandatory security authority.
 */
export function useAuthorization() {
  const { auth } = usePage<PagePropsWithAuth>().props;

  const user = auth?.user || null;
  const roles = auth?.roles || [];
  const permissions = auth?.permissions || [];

  const isSuperAdmin = (): boolean => {
    return roles.includes('SUPER_ADMIN');
  };

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: string[]): boolean => {
    return checkRoles.some(r => roles.includes(r));
  };

  const can = (permission: string): boolean => {
    // Super admin has universal permission bypass
    if (permissions.includes('*') || isSuperAdmin()) {
      return true;
    }
    return permissions.includes(permission);
  };

  const canAll = (checkPermissions: string[]): boolean => {
    if (permissions.includes('*') || isSuperAdmin()) {
      return true;
    }
    return checkPermissions.every(p => permissions.includes(p));
  };

  return {
    user,
    roles,
    permissions,
    isSuperAdmin,
    hasRole,
    hasAnyRole,
    can,
    canAll,
    isAuthenticated: !!user,
  };
}
