export type Role = 'admin' | 'moderator' | 'user' | 'guest';

export function hasRole(userRoles: Role[] | undefined, role: Role): boolean {
  if (!userRoles) return false;
  return userRoles.includes(role);
}

export function hasPermission(userRoles: Role[] | undefined, allowed: Role[] = []): boolean {
  if (!userRoles) return false;
  return allowed.some(r => userRoles.includes(r));
}
