/**
 * PHASE 5 - ADVANCED VERDICT ENGINE
 * 
 * Implements sophisticated verdict calculation with:
 * - Falsity scoring (0-100)
 * - Weighted evidence logic
 * - Contradiction handling
 * - Confidence bands
 */

import type {
  EvidenceInput,
  FalsityScoreResult,
  ContradictionAnalysis,
  WeightedScoreResult,
  VerdictOutput,
  VerdictContext,
  ComputeVerdictResult,
  VerdictType,
  ConfidenceBand
} from './verdict.types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Evidence weighting factors based on source type and other attributes.
 * Higher values = more weight in verdict calculation.
 */
const SOURCE_TYPE_WEIGHTS: Record<string, number> = {
  'GOVERNMENT': 1.2,        // Highest credibility
  'RESEARCH_PAPER': 1.15,
  'NEWS': 0.95,
  'BLOG': 0.7,
  'SOCIAL_MEDIA': 0.5,      // Lowest credibility
  'INTERNAL_REPORT': 0.85,
  'UNKNOWN': 0.8
};

/**
 * Freshness score weight multiplier.
 * Recent evidence is weighted more heavily.
 */
const FRESHNESS_WEIGHT_MULTIPLIER = 0.2;

/**
 * Contradiction detection threshold.
 * When both support and contradict scores are above this, mark as contradictory.
 */
const CONTRADICTION_THRESHOLD = 0.3;

/**
 * Confidence thresholds for bands.
 */
const CONFIDENCE_BAND_THRESHOLDS = {
  'LOW': 0.3,
  'MEDIUM': 0.6,
  'HIGH': 0.8
};

// ============================================================================
// WEIGHTED EVIDENCE CALCULATION
// ============================================================================

/**
 * Calculate source type weight based on credibility.
 */
function getSourceTypeWeight(sourceType?: string): number {
  if (!sourceType) return SOURCE_TYPE_WEIGHTS['UNKNOWN'] as number;
  return (SOURCE_TYPE_WEIGHTS[sourceType as string] ?? SOURCE_TYPE_WEIGHTS['UNKNOWN']) as number;
}

/**
 * Calculate the overall quality weight for a piece of evidence.
 * Combines credibility, freshness, and reviewer confidence.
 */
function calculateEvidenceWeight(evidence: EvidenceInput): number {
  // Base credibility score (0-1)
  const credibility = evidence.credibilityScore;

  // Freshness bonus - recent evidence weighted more heavily
  const freshnessBonus = evidence.freshnessScore * FRESHNESS_WEIGHT_MULTIPLIER;

  // Reviewer confidence as modifier (0-1)
  const confidence = evidence.reviewerConfidence;

  // Relevance as multiplier
  const relevance = evidence.relevanceScore;

  // Source type adjustment
  const sourceWeight = getSourceTypeWeight(evidence.sourceType);

  // Calculate composite weight: (credibility + freshness bonus) * confidence * relevance * sourceWeight
  let compositeWeight = (credibility + freshnessBonus) * confidence * relevance * sourceWeight;

  // Normalize to reasonable range (0-2)
  return Math.min(compositeWeight, 2.0);
}

/**
 * Compute weighted support and contradict scores from evidence array.
 * Each evidence piece is weighted by its quality factors.
 */
export function computeWeightedScores(evidences: EvidenceInput[]): WeightedScoreResult {
  if (evidences.length === 0) {
    return {
      supportScore: 0,
      contradictScore: 0,
      averageCredibility: 0,
      averageFreshness: 0,
      effectiveEvidenceCount: 0
    };
  }

  let supportScore = 0;
  let contradictScore = 0;
  let totalWeight = 0;
  let totalCredibility = 0;
  let totalFreshness = 0;
  let effectiveCount = 0;

  for (const evidence of evidences) {
    const weight = calculateEvidenceWeight(evidence);

    if (weight > 0) {
      effectiveCount++;
      totalWeight += weight;
      totalCredibility += evidence.credibilityScore;
      totalFreshness += evidence.freshnessScore;

      if (evidence.stance === 'SUPPORTS') {
        supportScore += weight;
      } else if (evidence.stance === 'CONTRADICTS') {
        contradictScore += weight;
      }
      // NEUTRAL evidence contributes to neither side
    }
  }

  return {
    supportScore,
    contradictScore,
    averageCredibility: effectiveCount > 0 ? totalCredibility / effectiveCount : 0,
    averageFreshness: effectiveCount > 0 ? totalFreshness / effectiveCount : 0,
    effectiveEvidenceCount: effectiveCount
  };
}

// ============================================================================
// CONTRADICTION ANALYSIS
// ============================================================================

/**
 * Analyze contradictions in the evidence set.
 * Returns metrics about conflicting evidence.
 */
export function analyzeContradictions(
  evidences: EvidenceInput[],
  supportScore: number,
  contradictScore: number
): ContradictionAnalysis {
  const supportingEvidence = evidences.filter(e => e.stance === 'SUPPORTS');
  const contradictingEvidence = evidences.filter(e => e.stance === 'CONTRADICTS');

  const hasSupport = supportingEvidence.length > 0;
  const hasContradict = contradictingEvidence.length > 0;

  // Contradiction level: how much the scores cancel each other out
  // Range: 0-1, where 1 = equal contradiction and support
  const totalScore = supportScore + contradictScore;
  let contradictionLevel = 0;

  if (totalScore > 0) {
    const minScore = Math.min(supportScore, contradictScore);
    const maxScore = Math.max(supportScore, contradictScore);
    contradictionLevel = minScore / (maxScore || 1);
  }

  return {
    hasSupportingEvidence: hasSupport,
    hasContradictingEvidence: hasContradict,
    supportingCount: supportingEvidence.length,
    contradictingCount: contradictingEvidence.length,
    contradictionLevel: Math.min(contradictionLevel, 1.0)
  };
}

/**
 * Adjust confidence when contradictions are present.
 * High contradictions reduce confidence in the verdict.
 */
function applyContradictionPenalty(
  baseConfidence: number,
  contradictionLevel: number
): number {
  // If contradictions exist, reduce confidence
  // contradictionLevel=0 -> no penalty, contradictionLevel=1 -> 50% reduction
  const penaltyFactor = contradictionLevel * 0.5;
  return Math.max(baseConfidence * (1 - penaltyFactor), 0);
}

// ============================================================================
// FALSITY SCORE CALCULATION
// ============================================================================

/**
 * Calculate falsity score (0-100) based on support/contradict balance.
 * 
 * Mapping:
 * 0-20:  TRUE (strongly supporting)
 * 21-40: MISLEADING (more supporting than contradicting)
 * 41-60: PARTLY_FALSE (balanced, mixed signals)
 * 61-80: FALSE (more contradicting than supporting)
 * 81-100: SEVERELY_FALSE (strongly contradicting)
 */
export function calculateFalsityScore(
  supportScore: number,
  contradictScore: number
): FalsityScoreResult {
  const totalScore = supportScore + contradictScore;

  // Handle no evidence case
  if (totalScore === 0) {
    return {
      falsityScore: 50, // Neutral middle ground
      verdictType: 'UNVERIFIABLE'
    };
  }

  // Calculate falsity ratio: 0 = all support, 1 = all contradict
  const falsityRatio = contradictScore / totalScore;

  // Convert to 0-100 scale
  const falsityScore = Math.round(falsityRatio * 100);

  // Determine verdict type from falsity score
  let verdictType: VerdictType;
  if (falsityScore <= 20) {
    verdictType = 'TRUE';
  } else if (falsityScore <= 40) {
    verdictType = 'MISLEADING';
  } else if (falsityScore <= 60) {
    verdictType = 'PARTLY_FALSE';
  } else if (falsityScore <= 80) {
    verdictType = 'FALSE';
  } else {
    verdictType = 'SEVERELY_FALSE';
  }

  return {
    falsityScore,
    verdictType
  };
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence score (0-1) based on:
 * - Evidence strength (support + contradict scores)
 * - Evidence count
 * - Average credibility
 * - Contradiction level
 */
function calculateConfidenceScore(
  supportScore: number,
  contradictScore: number,
  evidenceCount: number,
  averageCredibility: number,
  contradictionLevel: number
): number {
  // Base confidence from evidence strength
  const totalScore = supportScore + contradictScore;
  const baseStrengthConfidence = Math.min(totalScore / 5, 1.0); // Normalize to 0-1

  // Evidence count confidence (more evidence = more confidence)
  const countConfidence = Math.min(evidenceCount / 10, 1.0); // 10+ pieces = max confidence

  // Credibility multiplier
  const credibilityConfidence = averageCredibility;

  // Combine all factors
  let confidence =
    (baseStrengthConfidence * 0.4 +
     countConfidence * 0.3 +
     credibilityConfidence * 0.3);

  // Apply contradiction penalty
  confidence = applyContradictionPenalty(confidence, contradictionLevel);

  return Math.min(Math.max(confidence, 0), 1);
}

/**
 * Map confidence score to a confidence band.
 */
function getConfidenceBand(confidenceScore: number): ConfidenceBand {
  if (confidenceScore < CONFIDENCE_BAND_THRESHOLDS['LOW']) {
    return 'LOW';
  } else if (confidenceScore < CONFIDENCE_BAND_THRESHOLDS['MEDIUM']) {
    return 'MEDIUM';
  } else if (confidenceScore < CONFIDENCE_BAND_THRESHOLDS['HIGH']) {
    return 'HIGH';
  } else {
    return 'VERY_HIGH';
  }
}

// ============================================================================
// REASONING GENERATION
// ============================================================================

/**
 * Generate human-readable reasoning for the verdict.
 */
function buildAdvancedReasoning(
  evidences: EvidenceInput[],
  context: VerdictContext,
  contradictionAnalysis: ContradictionAnalysis,
  falsityScore: number
): string {
  const {
    supportScore,
    contradictScore,
    verdict,
    contradictionLevel,
    averageCredibility
  } = context;

  // Edge case: no evidence
  if (!evidences.length) {
    return 'No evidence available to evaluate the claim. Unable to determine verdict.';
  }

  // Count evidences by stance
  const supportCount = evidences.filter(e => e.stance === 'SUPPORTS').length;
  const contradictCount = evidences.filter(e => e.stance === 'CONTRADICTS').length;
  const neutralCount = evidences.filter(e => e.stance === 'NEUTRAL').length;
  const total = evidences.length;

  // Build reasoning components
  const parts: string[] = [];

  // 1. Summary of analysis
  parts.push(
    `Analyzed ${total} piece${total !== 1 ? 's' : ''} of evidence: ` +
    `${supportCount} supporting, ${contradictCount} contradicting` +
    (neutralCount > 0 ? `, and ${neutralCount} neutral` : '') +
    '.'
  );

  // 2. Strength assessment
  if (supportScore > contradictScore) {
    const ratio = (supportScore / (supportScore + contradictScore) * 100).toFixed(0);
    parts.push(
      `Supporting evidence dominates with ${ratio}% weighted strength. ` +
      `Average credibility of sources: ${(averageCredibility * 100).toFixed(0)}%.`
    );
  } else if (contradictScore > supportScore) {
    const ratio = (contradictScore / (supportScore + contradictScore) * 100).toFixed(0);
    parts.push(
      `Contradicting evidence dominates with ${ratio}% weighted strength. ` +
      `Average credibility of sources: ${(averageCredibility * 100).toFixed(0)}%.`
    );
  } else {
    parts.push(
      `Support and contradict evidence have equal weighted strength. ` +
      `Mixed signals present. Average credibility: ${(averageCredibility * 100).toFixed(0)}%.`
    );
  }

  // 3. Contradiction warning
  if (contradictionAnalysis.hasSupportingEvidence && contradictionAnalysis.hasContradictingEvidence) {
    if (contradictionLevel > 0.7) {
      parts.push(
        '⚠️ SIGNIFICANT CONTRADICTION: Both strong supporting and contradicting ' +
        'evidence exist, reducing confidence in this verdict.'
      );
    } else if (contradictionLevel > 0.4) {
      parts.push(
        'Note: Some contradictory evidence exists, moderately affecting confidence.'
      );
    }
  }

  // 4. Falsity score explanation
  let falsityExplanation = '';
  if (falsityScore <= 20) {
    falsityExplanation = 'The claim appears to be TRUE based on evidence.';
  } else if (falsityScore <= 40) {
    falsityExplanation = 'The claim is MISLEADING—mostly true but contains inaccuracies.';
  } else if (falsityScore <= 60) {
    falsityExplanation = 'The claim is PARTLY_FALSE—balanced mix of accurate and inaccurate elements.';
  } else if (falsityScore <= 80) {
    falsityExplanation = 'The claim is FALSE—predominantly contradicted by evidence.';
  } else {
    falsityExplanation = 'The claim is SEVERELY_FALSE—strongly contradicted across multiple sources.';
  }
  parts.push(falsityExplanation);

  // 5. Final determination
  let finalLine = '';
  switch (verdict) {
    case 'TRUE':
      finalLine = '✓ Verdict: TRUE - The claim is supported by available evidence.';
      break;
    case 'MISLEADING':
      finalLine = '◐ Verdict: MISLEADING - The claim contains elements of truth mixed with inaccuracies.';
      break;
    case 'PARTLY_FALSE':
      finalLine = '◑ Verdict: PARTLY_FALSE - The claim contains both accurate and inaccurate components.';
      break;
    case 'FALSE':
      finalLine = '✗ Verdict: FALSE - The claim is contradicted by available evidence.';
      break;
    case 'SEVERELY_FALSE':
      finalLine = '✗✗ Verdict: SEVERELY_FALSE - The claim is strongly contradicted across multiple reliable sources.';
      break;
    case 'UNVERIFIABLE':
      finalLine = '? Verdict: UNVERIFIABLE - Insufficient evidence to make a determination.';
      break;
  }
  parts.push(finalLine);

  return parts.join(' ');
}

// ============================================================================
// MAIN VERDICT COMPUTATION
// ============================================================================

/**
 * Advanced verdict computation engine combining all Phase 5 features.
 * 
 * @param evidences Array of evidence with full scoring
 * @returns Complete verdict with falsity score, confidence band, and reasoning
 */
export function computeAdvancedVerdict(evidences: EvidenceInput[]): ComputeVerdictResult {
  // STEP 1: Calculate weighted scores
  const weighted = computeWeightedScores(evidences);
  const { supportScore, contradictScore, averageCredibility, averageFreshness, effectiveEvidenceCount } = weighted;

  // STEP 2: Analyze contradictions
  const contradictionAnalysis = analyzeContradictions(
    evidences,
    supportScore,
    contradictScore
  );

  // STEP 3: Calculate falsity score and determine verdict type
  const { falsityScore, verdictType } = calculateFalsityScore(supportScore, contradictScore);

  // STEP 4: Calculate confidence score
  const baseConfidence = calculateConfidenceScore(
    supportScore,
    contradictScore,
    evidences.length,
    averageCredibility,
    contradictionAnalysis.contradictionLevel
  );

  // STEP 5: Assign confidence band
  const confidenceBand = getConfidenceBand(baseConfidence);

  // STEP 6: Calculate final score (-1 to 1 scale)
  const totalScore = supportScore + contradictScore;
  const finalScore = totalScore > 0
    ? (supportScore - contradictScore) / totalScore
    : 0;

  // STEP 7: Generate reasoning
  const context: VerdictContext = {
    supportScore,
    contradictScore,
    finalScore,
    verdict: verdictType,
    contradictionLevel: contradictionAnalysis.contradictionLevel,
    averageCredibility
  };

  const reasoning = buildAdvancedReasoning(
    evidences,
    context,
    contradictionAnalysis,
    falsityScore
  );

  // STEP 8: Return complete verdict
  return {
    verdict: verdictType,
    verdictType,
    falsityScore,
    confidenceScore: baseConfidence,
    confidenceBand,
    supportScore,
    contradictScore,
    contradictionLevel: contradictionAnalysis.contradictionLevel,
    reasoning,
    evidenceCount: evidences.length
  };
}
