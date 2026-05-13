import { prisma } from '../../plugins/prisma';

export interface EvidenceRecord {
  id: string;
  claimId: string;
  sourceType: string;
  sourceUrl: string;
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  reviewerConfidence: number;
  createdAt: Date;
}

export interface CreateEvidenceInput {
  claimId: string;
  sourceType: string;
  sourceUrl: string;
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  reviewerConfidence: number;
}

export interface UpdateEvidenceInput {
  sourceType?: string;
  stance?: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore?: number;
  relevanceScore?: number;
  freshnessScore?: number;
  reviewerConfidence?: number;
}

/**
 * Create a new evidence record in the database.
 */
export async function createEvidence(data: CreateEvidenceInput): Promise<EvidenceRecord> {
  const result = await prisma.evidence.create({
    data: {
      claimId: data.claimId,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      stance: data.stance,
      credibilityScore: data.credibilityScore,
      relevanceScore: data.relevanceScore,
      freshnessScore: data.freshnessScore,
      reviewerConfidence: data.reviewerConfidence,
      // qualityScore removed from DB schema; keep scoring in service layer only
    }
  });

  return result as EvidenceRecord;
}

/**
 * Find a single evidence record by ID.
 */
export async function findById(id: string): Promise<EvidenceRecord | null> {
  const result = await prisma.evidence.findUnique({
    where: { id }
  });

  return (result as EvidenceRecord) || null;
}

/**
 * Find all evidence records for a specific claim.
 */
export async function findByClaimId(claimId: string): Promise<EvidenceRecord[]> {
  const results = await prisma.evidence.findMany({
    where: { claimId },
    orderBy: { createdAt: 'desc' }
  });

  return results as EvidenceRecord[];
}

/**
 * Update an evidence record.
 */
export async function updateEvidence(id: string, data: UpdateEvidenceInput): Promise<EvidenceRecord> {
  const result = await prisma.evidence.update({
    where: { id },
    data: data as any
  });

  return result as EvidenceRecord;
}

/**
 * Delete an evidence record.
 */
export async function deleteEvidence(id: string): Promise<boolean> {
  try {
    await prisma.evidence.delete({
      where: { id }
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Count evidence records for a claim.
 */
export async function countByClaimId(claimId: string): Promise<number> {
  return prisma.evidence.count({
    where: { claimId }
  });
}
