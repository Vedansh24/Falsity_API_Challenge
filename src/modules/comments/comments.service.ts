import type { AuthenticatedUser } from '../../common/types/auth';
import * as repository from './comments.repository';
import { validateCreateCommentVisibility, filterVisibleCommentsForRequester } from './comments-policy.service';
import * as claimsRepo from '../claims/claims.repository';
import * as audit from '../audit/services/audit-log.service';

export async function addComment(
  claimId: string,
  user: AuthenticatedUser,
  content: string,
  visibility: 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY' = 'PUBLIC'
): Promise<repository.CommentRecord> {
  const claim = await claimsRepo.findById(claimId);
  if (!claim) throw new Error('Claim not found');

  validateCreateCommentVisibility(visibility, user, claim.submittedById);

  const { sanitizeString } = await import('../../common/utils/sanitize.js');
  const safeContent = sanitizeString(content);

  const created = await repository.createComment({
    claimId,
    userId: user.userId,
    content: safeContent,
    visibility
  });

  // Audit
  await audit.log({
    action: 'COMMENT_ADDED',
    entityType: 'CLAIM',
    entityId: claimId,
    performedById: user.userId,
    metadata: { commentId: created.id, visibility }
  });

  return created;
}

export async function updateComment(
  commentId: string,
  user: AuthenticatedUser,
  content: string
): Promise<repository.CommentRecord> {
  const existing = await repository.findById(commentId);
  if (!existing) throw new Error('Comment not found');

  // Only author or admin can edit
  if (existing.userId !== user.userId && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  const { sanitizeString } = await import('../../common/utils/sanitize.js');
  const safeContent = sanitizeString(content);
  const updated = await repository.updateComment(commentId, { content: safeContent });

  await audit.log({
    action: 'COMMENT_ADDED',
    entityType: 'COMMENT',
    entityId: commentId,
    performedById: user.userId,
    metadata: { updated: true }
  });

  return updated;
}

export async function deleteComment(commentId: string, user: AuthenticatedUser): Promise<void> {
  const existing = await repository.findById(commentId);
  if (!existing) throw new Error('Comment not found');

  if (existing.userId !== user.userId && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  await repository.deleteComment(commentId);

  await audit.log({
    action: 'EVIDENCE_DELETED',
    entityType: 'COMMENT',
    entityId: commentId,
    performedById: user.userId,
    metadata: { deleted: true }
  });
}

export async function listComments(claimId: string, requester?: AuthenticatedUser) {
  const items = await repository.listByClaim(claimId, { limit: 200 });

  if (!requester) {
    // Unauthenticated: filter to PUBLIC only
    return items.filter((i) => (i.visibility || 'PUBLIC') === 'PUBLIC');
  }

  return filterVisibleCommentsForRequester(items, requester);
}
