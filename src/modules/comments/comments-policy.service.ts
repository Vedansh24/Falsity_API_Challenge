import type { AuthenticatedUser } from '../../common/types/auth';
import { ForbiddenError } from '../../common/errors/forbidden-error';

/**
 * Centralized comment visibility and permission policy.
 * Keeps rules in one place so controllers/services can enforce consistently.
 */
export function validateCreateCommentVisibility(
  visibility: 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY',
  requester: AuthenticatedUser,
  claimOwnerId?: string
): void {
  const role = requester.role;

  if (visibility === 'PUBLIC') {
    // Allow claim owner to create public comments; analysts/reviewers/admins can create public anywhere.
    if (requester.userId === claimOwnerId) return;
    if (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN') return;
    throw new ForbiddenError('Only claim owner or staff can create public comments');
  }

  if (visibility === 'INTERNAL') {
    if (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN') return;
    throw new ForbiddenError('Only analysts, reviewers, or admins can create internal comments');
  }

  if (visibility === 'REVIEWER_ONLY') {
    if (role === 'REVIEWER' || role === 'ADMIN') return;
    throw new ForbiddenError('Only reviewers or admins can create reviewer-only comments');
  }
}

export function filterVisibleCommentsForRequester<T extends { visibility?: string }>(
  items: T[],
  requester: AuthenticatedUser,
  claimOwnerId?: string
): T[] {
  return items.filter((c) => {
    const v = (c.visibility || 'PUBLIC') as 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY';
    if (v === 'PUBLIC') return true; // public always visible by listing endpoint; higher-level checks might restrict
    if (v === 'INTERNAL') return requester.role === 'ANALYST' || requester.role === 'REVIEWER' || requester.role === 'ADMIN';
    if (v === 'REVIEWER_ONLY') return requester.role === 'REVIEWER' || requester.role === 'ADMIN';
    return false;
  });
}
