import { AppError } from '../errors/app-error';

export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_MORE_EVIDENCE' | 'READY_FOR_VERDICT' | 'PUBLISHED' | 'ARCHIVED' | 'RESOLVED' | 'REJECTED';

/**
 * Centralized claim workflow state machine.
 * Defines all valid state transitions.
 */

const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT'],
  NEEDS_MORE_EVIDENCE: ['UNDER_REVIEW'],
  READY_FOR_VERDICT: ['PUBLISHED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
  RESOLVED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED']
};

/**
 * Check if a transition from `from` to `to` is valid.
 */
export function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Assert that a transition is valid. Throws if not.
 */
export function assertTransition(from: ClaimStatus, to: ClaimStatus): void {
  if (!canTransition(from, to)) {
    throw new AppError(
      400,
      `Invalid workflow transition from ${from} to ${to}`,
      'INVALID_WORKFLOW_TRANSITION'
    );
  }
}

/**
 * Get all valid next states for a given state.
 */
export function getValidNextStates(status: ClaimStatus): ClaimStatus[] {
  return validTransitions[status] || [];
}
