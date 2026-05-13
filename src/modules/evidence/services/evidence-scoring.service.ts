import type { SourceType } from './source-classification.service';
import { getSourceCredibilityTier } from './source-classification.service';

export interface ScoringBreakdown {
  credibility: number;
  freshness: number;
  relevance: number;
  directness: number;
  duplicationPenalty: number;
}

export interface QualityScore {
  score: number; // 0-100
  breakdown: ScoringBreakdown;
}

/**
 * Calculate evidence quality score.
 *
 * Factors:
 * - Source credibility (0-30)
 * - Freshness (0-20)
 * - Relevance (0-20)
 * - Directness (0-15)
 * - Duplication penalty (-5 to 0)
 *
 * Total: 0-100
 */
export function calculateQualityScore(input: {
  sourceType: SourceType;
  credibilityScore?: number;
  relevanceScore?: number;
  freshnessScore?: number;
  reviewerConfidence?: number;
  isDuplicate?: boolean;
}): QualityScore {
  const breakdown: ScoringBreakdown = {
    credibility: 0,
    freshness: 0,
    relevance: 0,
    directness: 0,
    duplicationPenalty: 0
  };

  // 1. Credibility (0-30)
  // Base on source type tier + manual credibility score
  const tierScore = getSourceCredibilityTier(input.sourceType) * 20;
  const credibilityInput = (input.credibilityScore ?? 0.5) * 10;
  breakdown.credibility = Math.min(30, tierScore + credibilityInput);

  // 2. Freshness (0-20)
  // Based on freshness score provided
  breakdown.freshness = Math.min(20, (input.freshnessScore ?? 0.5) * 20);

  // 3. Relevance (0-20)
  // Based on relevance score provided
  breakdown.relevance = Math.min(20, (input.relevanceScore ?? 0.5) * 20);

  // 4. Directness/Confidence (0-15)
  // Based on reviewer confidence or assumed high if not provided
  breakdown.directness = Math.min(15, (input.reviewerConfidence ?? 0.8) * 15);

  // 5. Duplication Penalty (-5 to 0)
  // Penalize if duplicate
  breakdown.duplicationPenalty = input.isDuplicate ? -5 : 0;

  // Calculate total score
  const totalScore =
    breakdown.credibility +
    breakdown.freshness +
    breakdown.relevance +
    breakdown.directness +
    breakdown.duplicationPenalty;

  // Ensure score is 0-100
  const score = Math.max(0, Math.min(100, totalScore));

  return {
    score: Math.round(score),
    breakdown
  };
}

/**
 * Get quality tier name for a score.
 */
export function getQualityTier(score: number): string {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  if (score >= 20) return 'POOR';
  return 'VERY_POOR';
}
