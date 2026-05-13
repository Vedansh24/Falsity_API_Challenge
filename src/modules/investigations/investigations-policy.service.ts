import { AppError } from '../../common/errors/app-error';
import { ForbiddenError } from '../../common/errors/forbidden-error';
import type { AuthenticatedUser, Role } from '../../common/types/auth';
import { isApprover, canAnalyze, canPublishVerdicts } from '../../common/hooks/role.hook';
import type { ClaimRecord } from '../claims/claims.repository';

/**
 * INVESTIGATION POLICY SERVICE
 *
 * This is the CENTRAL POLICY ENGINE for all workflow-related authorization and validation.
 * All workflow decisions are centralized here to avoid scattered authorization logic.
 */

/**
 * Validate that the analyst can be assigned exists (checked by caller with user lookup).
 * This just validates the workflow rules.
 */
export function validateAnalystAssignment(claim: ClaimRecord, requester: AuthenticatedUser): void {
  // Only REVIEWER or ADMIN can assign analysts
  if (!isApprover(requester)) {
    throw new ForbiddenError('Only reviewers and admins can assign analysts');
  }

  // Claim must be in SUBMITTED status
  if (claim.status !== 'SUBMITTED') {
    throw new AppError(
      400,
      `Claim must be in SUBMITTED status to assign analyst. Current status: ${claim.status}`,
      'INVALID_WORKFLOW_STATE'
    );
  }
}

/**
 * Validate that requesting more evidence is allowed.
 */
export function validateRequestMoreEvidence(claim: ClaimRecord, requester: AuthenticatedUser): void {
  // ANALYST, REVIEWER, or ADMIN can request more evidence
  if (!canAnalyze(requester)) {
    throw new ForbiddenError('Only analysts and reviewers can request more evidence');
  }

  // Claim must be in UNDER_REVIEW status
  if (claim.status !== 'UNDER_REVIEW') {
    throw new AppError(
      400,
      `Claim must be in UNDER_REVIEW status. Current status: ${claim.status}`,
      'INVALID_WORKFLOW_STATE'
    );
  }
}

/**
 * Validate that moving to ready-for-verdict is allowed.
 */
export function validateReadyForVerdict(claim: ClaimRecord, requester: AuthenticatedUser): void {
  // ANALYST, REVIEWER, or ADMIN can move to ready-for-verdict
  if (!canAnalyze(requester)) {
    throw new ForbiddenError('Only analysts and reviewers can mark claim as ready for verdict');
  }

  // Claim must be in UNDER_REVIEW status
  if (claim.status !== 'UNDER_REVIEW') {
    throw new AppError(
      400,
      `Claim must be in UNDER_REVIEW status. Current status: ${claim.status}`,
      'INVALID_WORKFLOW_STATE'
    );
  }
}

/**
 * Validate that publishing a verdict is allowed.
 */
export function validatePublishVerdict(claim: ClaimRecord, requester: AuthenticatedUser): void {
  // Only REVIEWER or ADMIN can publish verdicts
  if (!canPublishVerdicts(requester)) {
    throw new ForbiddenError('Only reviewers and admins can publish verdicts');
  }

  // Claim must be in READY_FOR_VERDICT status
  if (claim.status !== 'READY_FOR_VERDICT') {
    throw new AppError(
      400,
      `Claim must be in READY_FOR_VERDICT status. Current status: ${claim.status}`,
      'INVALID_WORKFLOW_STATE'
    );
  }
}

/**
 * Validate that archiving is allowed.
 */
export function validateArchive(claim: ClaimRecord, requester: AuthenticatedUser): void {
  // Only REVIEWER or ADMIN can archive
  if (!isApprover(requester)) {
    throw new ForbiddenError('Only reviewers and admins can archive claims');
  }

  // Can only archive from certain states
  const archivableStates: ClaimRecord['status'][] = ['PUBLISHED', 'REJECTED', 'RESOLVED'];
  if (!archivableStates.includes(claim.status)) {
    throw new AppError(
      400,
      `Claim cannot be archived from status: ${claim.status}`,
      'INVALID_WORKFLOW_STATE'
    );
  }
}

/**
 * Check if a user is the assigned analyst for a claim.
 */
export function isAssignedAnalyst(claim: ClaimRecord, userId: string): boolean {
  return claim.currentAnalystId === userId;
}

/**
 * Check if a user should have visibility over a claim's investigation.
 */
export function canViewInvestigation(claim: ClaimRecord, requester: AuthenticatedUser): boolean {
  // Claim owner can always view
  if (claim.submittedById === requester.userId) return true;

  // Assigned analyst can view their own investigation
  if (isAssignedAnalyst(claim, requester.userId)) return true;

  // Reviewers and admins can view all
  return isApprover(requester);
}

/**
 * Check if a user can add comments on a claim.
 */
export function canComment(claim: ClaimRecord, requester: AuthenticatedUser): boolean {
  // Claim owner can comment
  if (claim.submittedById === requester.userId) return true;

  // Analysts, reviewers, admins can comment
  return canAnalyze(requester);
}
