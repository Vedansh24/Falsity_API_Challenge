import type { FastifyRequest } from 'fastify';
import { ForbiddenError } from '../errors/forbidden-error';
import type { Role } from '../types/auth';

/**
 * Requires user to have one of the specified roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!request.user) {
      throw new ForbiddenError('Authentication required');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(`This operation requires one of: ${allowedRoles.join(', ')}`);
    }
  };
}

/**
 * Check if user has the required role.
 */
export function hasRole(user: { role: Role } | undefined, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the required roles.
 */
export function hasAnyRole(user: { role: Role } | undefined, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user is admin or reviewer.
 */
export function isApprover(user: { role: Role } | undefined): boolean {
  return hasAnyRole(user, ['REVIEWER', 'ADMIN']);
}

/**
 * Check if user is analyst, reviewer, or admin.
 */
export function canAnalyze(user: { role: Role } | undefined): boolean {
  return hasAnyRole(user, ['ANALYST', 'REVIEWER', 'ADMIN']);
}

/**
 * Check if user can publish verdicts.
 */
export function canPublishVerdicts(user: { role: Role } | undefined): boolean {
  return hasAnyRole(user, ['REVIEWER', 'ADMIN']);
}
