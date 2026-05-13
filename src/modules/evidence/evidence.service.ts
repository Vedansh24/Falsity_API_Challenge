import { AppError } from '../../common/errors/app-error';
import type { AuthenticatedUser } from '../../common/types/auth';
import * as repository from './evidence.repository';  
import type { EvidenceRecord, CreateEvidenceInput } from './evidence.repository';
import { assertNoDuplicate } from './services/evidence-duplicate.service';
import { calculateQualityScore } from './services/evidence-scoring.service';
import * as audit from '../audit/services/audit-log.service';

/**
 * Create a new evidence record for a claim.
 * Validates duplicates and calculates quality score.
 */
export async function addEvidence(
  claimId: string,
  data: Omit<CreateEvidenceInput, 'claimId'>,
  requester?: AuthenticatedUser
): Promise<EvidenceRecord> {
  // Sanitize user-provided fields
  // Import here to avoid circular deps at module load time
  const { sanitizeString, sanitizeUrl } = await import('../../common/utils/sanitize.js');
  data.sourceUrl = sanitizeUrl(data.sourceUrl as unknown) || '';
  data.sourceType = sanitizeString(data.sourceType as unknown);
  // Check for duplicates
  await assertNoDuplicate(claimId, data.sourceUrl);

  // Calculate quality score for internal use (not persisted in DB schema)
  const qualityScore = calculateQualityScore({
    sourceType: data.sourceType as any,
    credibilityScore: data.credibilityScore,
    relevanceScore: data.relevanceScore,
    freshnessScore: data.freshnessScore,
    reviewerConfidence: data.reviewerConfidence,
    isDuplicate: false
  });

  // Merge claimId into the data (DB schema doesn't include qualityScore)
  const evidenceData: CreateEvidenceInput = {
    claimId,
    ...data
  };

  // Delegate to repository
  const created = await repository.createEvidence(evidenceData);

  // Audit
  await audit.log({
    action: 'EVIDENCE_ADDED',
    entityType: 'EVIDENCE',
    entityId: created.id,
    performedById: requester?.userId ?? null,
    metadata: { claimId, sourceUrl: created.sourceUrl, qualityScore: qualityScore.score }
  });

  return created;
}

/**
 * Retrieve all evidence records for a specific claim.
 */
export async function getEvidenceForClaim(claimId: string): Promise<EvidenceRecord[]> {
  return repository.findByClaimId(claimId);
}

/**
 * Get a single evidence record by ID.
 */
export async function getEvidenceById(id: string): Promise<EvidenceRecord> {
  const evidence = await repository.findById(id);

  if (!evidence) {
    throw new AppError(404, 'Evidence not found', 'NOT_FOUND');
  }

  return evidence;
}

/**
 * Update an evidence record.
 */
export async function updateEvidenceService(
  id: string,
  data: {
    sourceType?: string;
    stance?: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
    credibilityScore?: number;
    relevanceScore?: number;
    freshnessScore?: number;
    reviewerConfidence?: number;
  },
  requester?: AuthenticatedUser
): Promise<EvidenceRecord> {
  // Verify evidence exists
  const existing = await getEvidenceById(id);

  // Recalculate quality score if any scoring fields changed
  let updatedData: any = { ...data };
  if (
    data.credibilityScore !== undefined ||
    data.relevanceScore !== undefined ||
    data.freshnessScore !== undefined ||
    data.reviewerConfidence !== undefined
  ) {
    const qualityScore = calculateQualityScore({
      sourceType: (data.sourceType || existing.sourceType) as any,
      credibilityScore: data.credibilityScore ?? existing.credibilityScore,
      relevanceScore: data.relevanceScore ?? existing.relevanceScore,
      freshnessScore: data.freshnessScore ?? existing.freshnessScore,
      reviewerConfidence: data.reviewerConfidence ?? existing.reviewerConfidence,
      isDuplicate: false
    });

    updatedData = { ...updatedData, qualityScore: qualityScore.score };
  }

  return repository.updateEvidence(id, updatedData);
}

/**
 * Delete an evidence record.
 */
export async function deleteEvidenceService(
  id: string,
  requester?: AuthenticatedUser
): Promise<void> {
  // Verify evidence exists first
  await getEvidenceById(id);

  const deleted = await repository.deleteEvidence(id);

  if (!deleted) {
    throw new AppError(500, 'Failed to delete evidence', 'DELETE_FAILED');
  }
  await audit.log({
    action: 'EVIDENCE_DELETED',
    entityType: 'EVIDENCE',
    entityId: id,
    performedById: requester?.userId ?? null,
    metadata: { claimId: id }
  });
}
