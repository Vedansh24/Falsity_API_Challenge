// ============================================================================
// VERDICT TYPES & ENUMS
// ============================================================================

export type VerdictType = 'TRUE' | 'MISLEADING' | 'PARTLY_FALSE' | 'FALSE' | 'SEVERELY_FALSE' | 'UNVERIFIABLE';
export type ConfidenceBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

// ============================================================================
// EVIDENCE & SCORING INPUT
// ============================================================================

export type EvidenceInput = {
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  reviewerConfidence: number;
  sourceType?: string;
};

export type WeightedEvidenceScore = {
  score: number;
  weight: number;
  isDuplicate: boolean;
};

export type ScoreInput = {
  supportScore: number;
  contradictScore: number;
};

// ============================================================================
// VERDICT CALCULATION RESULTS
// ============================================================================

export type FalsityScoreResult = {
  falsityScore: number; // 0-100, where 0=TRUE, 100=SEVERELY_FALSE
  verdictType: VerdictType;
};

export type ContradictionAnalysis = {
  hasSupportingEvidence: boolean;
  hasContradictingEvidence: boolean;
  supportingCount: number;
  contradictingCount: number;
  contradictionLevel: number; // 0-1, where 1 = maximum contradiction
};

export type WeightedScoreResult = {
  supportScore: number;
  contradictScore: number;
  averageCredibility: number;
  averageFreshness: number;
  effectiveEvidenceCount: number;
};

export type VerdictOutput = {
  verdict: VerdictType;
  verdictType: VerdictType;
  falsityScore: number; // 0-100
  confidenceScore: number; // 0-1
  confidenceBand: ConfidenceBand;
  finalScore: number; // -1 to 1
};

export type VerdictContext = {
  supportScore: number;
  contradictScore: number;
  finalScore: number;
  verdict: VerdictType;
  contradictionLevel: number;
  averageCredibility: number;
};

export type ComputeVerdictResult = {
  verdict: VerdictType;
  verdictType: VerdictType;
  falsityScore: number;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  supportScore: number;
  contradictScore: number;
  contradictionLevel: number;
  reasoning: string;
  evidenceCount: number;
};

// ============================================================================
// DATABASE PERSISTENCE MODELS
// ============================================================================

export type VerdictRecord = {
  id: string;
  claimId: string;
  verdictType: VerdictType;
  falsityScore: number;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  reasoning: string;
  supportScore: number;
  contradictScore: number;
  contradictionLevel: number;
  isApproved: boolean;
  publishedById?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type VerdictHistoryRecord = {
  id: string;
  verdictId: string;
  claimId: string;
  verdictType: VerdictType;
  falsityScore: number;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  reasoning: string;
  supportScore: number;
  contradictScore: number;
  contradictionLevel: number;
  createdAt: Date;
};