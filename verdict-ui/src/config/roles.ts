export const ROLES = {
  USER: 'USER',
  ANALYST: 'ANALYST',
  REVIEWER: 'REVIEWER',
  ADMIN: 'ADMIN'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  ANALYST: 1,
  REVIEWER: 2,
  ADMIN: 3
};

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'verdict_access_token',
  ROLE: 'verdict_role'
} as const;

export const AUTH_HOME_BY_ROLE: Record<Role, string> = {
  USER: '/dashboard/user',
  ANALYST: '/dashboard/analyst',
  REVIEWER: '/reviewer',
  ADMIN: '/admin'
};

export const ROLE_ROUTE_REQUIREMENTS: Array<{ prefix: string; minimumRole: Role }> = [
  { prefix: '/dashboard', minimumRole: 'USER' },
  { prefix: '/analyst', minimumRole: 'ANALYST' },
  { prefix: '/reviewer', minimumRole: 'REVIEWER' },
  { prefix: '/admin', minimumRole: 'ADMIN' }
];

export function hasAtLeastRole(actualRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!actualRole) {
    return false;
  }

  return ROLE_HIERARCHY[actualRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessRoute(role: Role | null | undefined, path: string): boolean {
  const requirement = ROLE_ROUTE_REQUIREMENTS.find((item) => path.startsWith(item.prefix));
  if (!requirement) {
    return true;
  }

  return hasAtLeastRole(role, requirement.minimumRole);
}

export function getRoleHomePath(role: Role | null | undefined): string {
  return role ? AUTH_HOME_BY_ROLE[role] : AUTH_HOME_BY_ROLE.USER;
}
