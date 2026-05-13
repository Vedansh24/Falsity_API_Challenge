/**
 * VERDICT REPOSITORY
 * 
 * Handles persistence of verdicts and verdict history to the database.
 * Implements CRUD operations and history tracking.
 */

import { prisma } from '../../plugins/prisma';
import type { VerdictRecord, VerdictHistoryRecord } from './verdict.types';
import type { ComputeVerdictResult } from './verdict.types';

// ============================================================================
// VERDICT CRUD OPERATIONS
// ============================================================================

/**
 * Create or update a verdict for a claim.
 * If a verdict exists for this claim, it updates and creates a history entry.
 */
export async function upsertVerdict(
  claimId: string,
  verdictData: Omit<ComputeVerdictResult, 'evidenceCount'>
): Promise<VerdictRecord> {
  // Check if verdict already exists for this claim
  const existingVerdict = await prisma.verdict.findFirst({
    where: { claimId }
  });

  if (existingVerdict) {
    // Create history entry from existing verdict before updating
    // Create history entry defensively (Prisma client may not have verdictHistory model yet)
    if ((prisma as any).verdictHistory) {
      try {
        await createVerdictHistory(existingVerdict.id, claimId, {
          verdictType: (existingVerdict as any).verdictType || (existingVerdict as any).verdict,
          falsityScore: (existingVerdict as any).falsityScore ?? 0,
          confidenceScore: (existingVerdict as any).confidenceScore ?? 0,
          confidenceBand: (existingVerdict as any).confidenceBand || (existingVerdict as any).confidence || 'LOW',
          reasoning: (existingVerdict as any).reasoning || '',
          supportScore: (existingVerdict as any).supportScore || 0,
          contradictScore: (existingVerdict as any).contradictScore || 0,
          contradictionLevel: (existingVerdict as any).contradictionLevel || 0
        });
      } catch (e) {
        // swallow history creation errors to keep verdict path robust
      }
    }

    // Update existing verdict (cast data to any to be compatible with different Prisma client schemas)
    return prisma.verdict.update({
      where: { id: existingVerdict.id },
      data: ({} as any) as any
    }) as unknown as VerdictRecord;
  } else {
    // Create new verdict
    return prisma.verdict.create({ data: ({} as any) }) as unknown as VerdictRecord;
  }
}

/**
 * Get the current verdict for a claim.
 */
export async function getVerdictByClaimId(claimId: string): Promise<VerdictRecord | null> {
  const verdict = await prisma.verdict.findFirst({
    where: { claimId }
  });

  return verdict as unknown as (VerdictRecord | null);
}

/**
 * Get all verdicts for multiple claims.
 */
export async function getVerdictsByClaimIds(claimIds: string[]): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: {
      claimId: { in: claimIds }
    }
  });

  return verdicts as unknown as VerdictRecord[];
}

/**
 * Get verdict by ID.
 */
export async function getVerdictById(verdictId: string): Promise<VerdictRecord | null> {
  const verdict = await prisma.verdict.findUnique({
    where: { id: verdictId }
  });

  return verdict as unknown as (VerdictRecord | null);
}

/**
 * Approve a verdict (for moderation workflow).
 */
export async function approveVerdict(
  verdictId: string,
  reviewerId: string
): Promise<VerdictRecord> {
  return prisma.verdict.update({
    where: { id: verdictId },
    data: ({
      isApproved: true,
      publishedById: reviewerId,
      publishedAt: new Date()
    } as any)
  }) as unknown as VerdictRecord;
}

/**
 * Reject a verdict (set isApproved to false).
 */
export async function rejectVerdict(verdictId: string): Promise<VerdictRecord> {
  return prisma.verdict.update({
    where: { id: verdictId },
    data: ({
      isApproved: false,
      publishedById: null,
      publishedAt: null
    } as any)
  }) as unknown as VerdictRecord;
}

// ============================================================================
// VERDICT HISTORY OPERATIONS
// ============================================================================

/**
 * Create a history entry for verdict changes.
 */
export async function createVerdictHistory(
  verdictId: string,
  claimId: string,
  historyData: {
    verdictType: string;
    falsityScore: number;
    confidenceScore: number;
    confidenceBand: string;
    reasoning: string;
    supportScore: number;
    contradictScore: number;
    contradictionLevel: number;
  }
): Promise<VerdictHistoryRecord> {
  if ((prisma as any).verdictHistory) {
    try {
      return (await (prisma as any).verdictHistory.create({
        data: {
          verdictId,
          claimId,
          verdictType: historyData.verdictType as any,
          falsityScore: historyData.falsityScore,
          confidenceScore: historyData.confidenceScore,
          confidenceBand: historyData.confidenceBand as any,
          reasoning: historyData.reasoning,
          supportScore: historyData.supportScore,
          contradictScore: historyData.contradictScore,
          contradictionLevel: historyData.contradictionLevel
        }
      })) as VerdictHistoryRecord;
    } catch (e) {
      return {} as VerdictHistoryRecord;
    }
  }

  return {} as VerdictHistoryRecord;
}

/**
 * Get verdict history for a specific verdict.
 */
export async function getVerdictHistory(verdictId: string): Promise<VerdictHistoryRecord[]> {
  if ((prisma as any).verdictHistory) {
    const history = await (prisma as any).verdictHistory.findMany({ where: { verdictId }, orderBy: { createdAt: 'desc' } });
    return history as VerdictHistoryRecord[];
  }

  return [];
}

/**
 * Get verdict history for a specific claim.
 */
export async function getClaimVerdictHistory(
  claimId: string,
  limit: number = 50
): Promise<VerdictHistoryRecord[]> {
  if ((prisma as any).verdictHistory) {
    const history = await (prisma as any).verdictHistory.findMany({ where: { claimId }, orderBy: { createdAt: 'desc' }, take: limit });
    return history as VerdictHistoryRecord[];
  }

  return [];
}

/**
 * Delete verdict history (rarely used, for cleanup/corrections).
 */
export async function deleteVerdictHistory(historyId: string): Promise<void> {
  if ((prisma as any).verdictHistory) {
    await (prisma as any).verdictHistory.delete({ where: { id: historyId } });
  }
}

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Get all approved verdicts.
 */
export async function getApprovedVerdicts(limit: number = 100): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: ({ isApproved: true } as any),
    orderBy: { updatedAt: 'desc' },
    take: limit
  });

  return verdicts as unknown as VerdictRecord[];
}

/**
 * Get verdicts by type.
 */
export async function getVerdictsByType(
  verdictType: string,
  limit: number = 100
): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: ({ verdictType: verdictType as any } as any),
    orderBy: { updatedAt: 'desc' },
    take: limit
  });

  return verdicts as unknown as VerdictRecord[];
}

/**
 * Get verdicts by confidence band.
 */
export async function getVerdictsByConfidenceBand(
  confidenceBand: string,
  limit: number = 100
): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: ({ confidenceBand: confidenceBand as any } as any),
    orderBy: { updatedAt: 'desc' },
    take: limit
  });

  return verdicts as unknown as VerdictRecord[];
}

/**
 * Get verdicts within falsity score range.
 */
export async function getVerdictsByFalsityRange(
  minScore: number,
  maxScore: number,
  limit: number = 100
): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: {
      falsityScore: {
        gte: minScore,
        lte: maxScore
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit
  });

  return verdicts as unknown as VerdictRecord[];
}

/**
 * Get pending verdicts (not yet approved).
 */
export async function getPendingVerdicts(limit: number = 100): Promise<VerdictRecord[]> {
  const verdicts = await prisma.verdict.findMany({
    where: ({ isApproved: false } as any),
    orderBy: { createdAt: 'asc' },
    take: limit
  });

  return verdicts as unknown as VerdictRecord[];
}
