"use client";

import useAuthStore from '../stores/auth.store';
import { hasAtLeastRole, type Role } from '../config/roles';

export function useRole() {
  const role = useAuthStore((state) => state.role);
  return role;
}

export function useHasRole(requiredRole: Role) {
  const role = useRole();
  return hasAtLeastRole(role, requiredRole);
}
