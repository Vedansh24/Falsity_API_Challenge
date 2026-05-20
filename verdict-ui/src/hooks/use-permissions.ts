"use client";

import { useMemo } from 'react';
import useAuthStore from '../stores/auth.store';
import { canAccessRoute, hasAtLeastRole, type Role } from '../config/roles';

export function usePermissions() {
  const role = useAuthStore((state) => state.role);

  return useMemo(
    () => ({
      role,
      canAccessRoute: (path: string) => canAccessRoute(role, path),
      canAccessRoles: (requiredRoles: Role[]) => requiredRoles.some((requiredRole) => hasAtLeastRole(role, requiredRole)),
      hasAtLeastRole: (requiredRole: Role) => hasAtLeastRole(role, requiredRole)
    }),
    [role]
  );
}
