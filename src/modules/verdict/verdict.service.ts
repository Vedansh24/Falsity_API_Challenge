/**
 * VERDICT SERVICE
 * 
 * Orchestrates verdict computation, persistence, and history tracking.
 * Uses the advanced verdict engine from Phase 5.
 */

import { computeAdvancedVerdict } from './advanced-verdict.engine';
import { findByClaimId } from '../evidence/evidence.repository';
import * as repository from './verdict.repository';
import type { ComputeVerdictResult, EvidenceInput } from './verdict.types';
import * as audit from '../audit/services/audit-log.service';

/**
 * Compute and persist verdict for a claim.
 * Automatically creates history entry if verdict changes.
 */
export async function computeAndPersistVerdict(claimId: string): Promise<ComputeVerdictResult> {
  // Fetch all evidence for the claim
  const evidences = await findByClaimId(claimId);

  // Format evidence for the engine
  const formattedEvidence: EvidenceInput[] = evidences.map((e) => ({
    stance: e.stance as 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL',
    credibilityScore: e.credibilityScore,
    relevanceScore: e.relevanceScore,
    freshnessScore: e.freshnessScore,
    reviewerConfidence: e.reviewerConfidence,
    sourceType: e.sourceType
  }));

  // Compute advanced verdict
  const verdict = computeAdvancedVerdict(formattedEvidence);

  // Persist to database (creates history entry if updating)
  const { evidenceCount, ...persistData } = verdict;
  await repository.upsertVerdict(claimId, persistData);

  return verdict;
}

/**
 * Get current verdict for a claim.
 * Returns persisted verdict without recomputation.
 */
export async function getVerdictService(claimId: string): Promise<ComputeVerdictResult> {
  const verdict = await repository.getVerdictByClaimId(claimId);

  if (!verdict) {
    // If no verdict exists, compute and persist it
    return computeAndPersistVerdict(claimId);
  }

  return {
    verdict: (verdict as any).verdictType || (verdict as any).verdict,
    verdictType: (verdict as any).verdictType || (verdict as any).verdict,
    falsityScore: (verdict as any).falsityScore ?? 0,
    confidenceScore: (verdict as any).confidenceScore ?? 0,
    confidenceBand: (verdict as any).confidenceBand ?? (verdict as any).confidence ?? 'LOW',
    supportScore: (verdict as any).supportScore || 0,
    contradictScore: (verdict as any).contradictScore || 0,
    contradictionLevel: (verdict as any).contradictionLevel || 0,
    reasoning: (verdict as any).reasoning || '',
    evidenceCount: 0 // Will be computed when fetching evidence
  };
}

/**
 * Recompute verdict for a claim.
 * Called when evidence is added/modified/deleted.
 */
export async function recomputeVerdictService(claimId: string): Promise<ComputeVerdictResult> {
  const result = await computeAndPersistVerdict(claimId);
  // Audit
  try {
    await audit.log({
      action: 'VERDICT_RECOMPUTED',
      entityType: 'CLAIM',
      entityId: claimId,
      performedById: null,
      metadata: { resultType: result.verdict }
    });
  } catch (e) {
    // ignore audit failures
  }

  return result;
}

/**
 * Get verdict history for a claim.
 */
export async function getVerdictHistoryService(claimId: string, limit: number = 50) {
  return repository.getClaimVerdictHistory(claimId, limit);
}

/**
 * Approve a verdict (moderation workflow).
 */
export async function approveVerdictService(verdictId: string, reviewerId: string) {
  return repository.approveVerdict(verdictId, reviewerId);
}

/**
 * Reject a verdict (moderation workflow).
 */
export async function rejectVerdictService(verdictId: string) {
  return repository.rejectVerdict(verdictId);
}

/**
 * Get statistics about verdicts.
 */
export async function getVerdictStatsService() {
  const approved = await repository.getApprovedVerdicts(1000);
  const pending = await repository.getPendingVerdicts(1000);

  const stats = {
    totalApproved: approved.length,
    totalPending: pending.length,
    byType: {
      TRUE: 0,
      MISLEADING: 0,
      PARTLY_FALSE: 0,
      FALSE: 0,
      SEVERELY_FALSE: 0,
      UNVERIFIABLE: 0
    },
    byConfidenceBand: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      VERY_HIGH: 0
    },
    averageFalsityScore: 0
  };

  let totalFalsityScore = 0;

  for (const verdict of approved) {
    stats.byType[verdict.verdictType as keyof typeof stats.byType]++;
    stats.byConfidenceBand[verdict.confidenceBand as keyof typeof stats.byConfidenceBand]++;
    totalFalsityScore += verdict.falsityScore;
  }

  if (approved.length > 0) {
    stats.averageFalsityScore = totalFalsityScore / approved.length;
  }

  return stats;
}
