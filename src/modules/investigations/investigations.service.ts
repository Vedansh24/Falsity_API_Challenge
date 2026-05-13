import { AppError } from '../../common/errors/app-error';
import type { AuthenticatedUser } from '../../common/types/auth';
import { assertTransition } from '../../common/workflow/state-machine';
import type { ClaimRecord } from '../claims/claims.repository';
import { findById as findClaimById, updateClaim } from '../claims/claims.repository';
import {
  createInvestigation,
  findInvestigationByClaim,
  updateInvestigation,
  type InvestigationRecord
} from './investigations.repository';
import {
  validateAnalystAssignment,
  validateRequestMoreEvidence,
  validateReadyForVerdict,
  validatePublishVerdict,
  validateArchive
} from './investigations-policy.service';
import { prisma } from '../../plugins/prisma';
import * as audit from '../audit/services/audit-log.service';

/**
 * Assign an analyst to investigate a claim.
 * Claim transitions from SUBMITTED → UNDER_REVIEW.
 */
export async function assignAnalystService(
  claimId: string,
  analystId: string,
  requester: AuthenticatedUser
): Promise<ClaimRecord> {
  // Get the claim
  const claim = await findClaimById(claimId);
  if (!claim) {
    throw new AppError(404, 'Claim not found', 'NOT_FOUND');
  }

  // Validate policy
  validateAnalystAssignment(claim, requester);

  // Verify analyst exists and is an analyst
  const analyst = await prisma.user.findUnique({
    where: { id: analystId }
  });

  if (!analyst) {
    throw new AppError(404, 'Analyst not found', 'NOT_FOUND');
  }

  if (analyst.role !== 'ANALYST' && analyst.role !== 'REVIEWER' && analyst.role !== 'ADMIN') {
    throw new AppError(400, 'User is not an analyst, reviewer, or admin', 'INVALID_ANALYST');
  }

  // Check for existing active investigation
  const existingInvestigation = await findInvestigationByClaim(claimId);
  if (existingInvestigation && !existingInvestigation.completedAt) {
    throw new AppError(409, 'An active investigation already exists for this claim', 'INVESTIGATION_EXISTS');
  }

  // Validate transition
  assertTransition(claim.status, 'UNDER_REVIEW');

  // Update claim status and analyst via Prisma directly to handle all fields
  const updated = (await prisma.claim.update({
    where: { id: claimId },
    data: {
      status: 'UNDER_REVIEW',
      currentAnalystId: analystId
    } as any
  })) as ClaimRecord;

  // Create or update investigation
  if (existingInvestigation) {
    await updateInvestigation(existingInvestigation.id, {
      investigatorId: analystId,
      startedAt: new Date()
    });
  } else {
    await createInvestigation({
      claimId,
      investigatorId: analystId,
      status: 'ACTIVE',
      startedAt: new Date()
    });
  }

  // Audit analyst assignment
  await audit.log({
    action: 'ANALYST_ASSIGNED',
    entityType: 'CLAIM',
    entityId: claimId,
    performedById: requester.userId,
    metadata: { analystId }
  });

  return updated;

}

/**
 * Request more evidence for a claim.
 * Claim transitions from UNDER_REVIEW → NEEDS_MORE_EVIDENCE.
 */
export async function requestMoreEvidenceService(
  claimId: string,
  notes: string | undefined,
  requester: AuthenticatedUser
): Promise<ClaimRecord> {
  // Get the claim
  const claim = await findClaimById(claimId);
  if (!claim) {
    throw new AppError(404, 'Claim not found', 'NOT_FOUND');
  }

  // Validate policy
  validateRequestMoreEvidence(claim, requester);

  // Validate transition
  assertTransition(claim.status, 'NEEDS_MORE_EVIDENCE');

  // Update claim
  const updated = await updateClaim(claimId, {
    status: 'NEEDS_MORE_EVIDENCE'
  });

  // Update investigation notes if provided
  const investigation = await findInvestigationByClaim(claimId);
  if (investigation && notes) {
    await updateInvestigation(investigation.id, {
      notes
    });
  }

  return updated;
}

/**
 * Mark claim as ready for verdict.
 * Claim transitions from UNDER_REVIEW → READY_FOR_VERDICT.
 */
export async function readyForVerdictService(
  claimId: string,
  requester: AuthenticatedUser
): Promise<ClaimRecord> {
  // Get the claim
  const claim = await findClaimById(claimId);
  if (!claim) {
    throw new AppError(404, 'Claim not found', 'NOT_FOUND');
  }

  // Validate policy
  validateReadyForVerdict(claim, requester);

  // Validate transition
  assertTransition(claim.status, 'READY_FOR_VERDICT');

  // Update claim
  const updated = await updateClaim(claimId, {
    status: 'READY_FOR_VERDICT'
  });

  return updated;
}

/**
 * Publish a verdict for a claim.
 * Claim transitions from READY_FOR_VERDICT → PUBLISHED.
 * Creates/updates Verdict record.
 */
export async function publishVerdictService(
  claimId: string,
  data: {
    verdict: string;
    falsityScore?: number | null;
    confidenceScore?: number | null;
    reasoning?: string | null;
  },
  requester: AuthenticatedUser
): Promise<ClaimRecord> {
  // Get the claim
  const claim = await findClaimById(claimId);
  if (!claim) {
    throw new AppError(404, 'Claim not found', 'NOT_FOUND');
  }

  // Validate policy
  validatePublishVerdict(claim, requester);

  // Validate transition
  assertTransition(claim.status, 'PUBLISHED');

  // Create or update verdict
  const existingVerdict = await prisma.verdict.findFirst({
    where: { claimId }
  });

  const verdictData = {
    verdict: data.verdict,
    falsityScore: data.falsityScore ?? undefined,
    confidenceScore: data.confidenceScore ?? undefined,
    reasoning: data.reasoning ?? undefined,
    publishedById: requester.userId,
    publishedAt: new Date()
  };

  if (existingVerdict) {
    await prisma.verdict.update({
      where: { id: existingVerdict.id },
      data: verdictData as any
    });
  } else {
    await prisma.verdict.create({
      data: {
        claimId,
        ...verdictData
      } as any
    });
  }

  // Update claim with workflow fields via Prisma directly
  const updated = (await prisma.claim.update({
    where: { id: claimId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    } as any
  })) as ClaimRecord;

  // Mark investigation as completed
  const investigation = await findInvestigationByClaim(claimId);
  if (investigation) {
    await updateInvestigation(investigation.id, {
      status: 'COMPLETED',
      completedAt: new Date()
    });
  }

  // Audit publish
  await audit.log({
    action: 'VERDICT_PUBLISHED',
    entityType: 'CLAIM',
    entityId: claimId,
    performedById: requester.userId,
    metadata: { verdict: data.verdict }
  });

  return updated;
}

/**
 * Archive a published claim.
 * Claim transitions from PUBLISHED → ARCHIVED (or other valid terminal states).
 */
export async function archiveClaimService(
  claimId: string,
  requester: AuthenticatedUser
): Promise<ClaimRecord> {
  // Get the claim
  const claim = await findClaimById(claimId);
  if (!claim) {
    throw new AppError(404, 'Claim not found', 'NOT_FOUND');
  }

  // Validate policy
  validateArchive(claim, requester);

  // Update claim with workflow fields via Prisma directly
  const updated = (await prisma.claim.update({
    where: { id: claimId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date()
    } as any
  })) as ClaimRecord;

  await audit.log({
    action: 'CLAIM_ARCHIVED',
    entityType: 'CLAIM',
    entityId: claimId,
    performedById: requester.userId,
    metadata: {}
  });

  return updated;
}
