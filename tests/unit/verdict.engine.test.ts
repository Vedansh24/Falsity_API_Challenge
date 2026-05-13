import {
  analyzeContradictions,
  calculateFalsityScore,
  computeAdvancedVerdict,
  computeWeightedScores
} from '../../src/modules/verdict/advanced-verdict.engine';

describe('advanced verdict engine', () => {
  it('returns FALSE/SEVERELY_FALSE for highly credible contradicting evidence', () => {
    const result = computeAdvancedVerdict([
      {
        stance: 'CONTRADICTS',
        credibilityScore: 0.98,
        relevanceScore: 0.95,
        freshnessScore: 0.9,
        reviewerConfidence: 0.95,
        sourceType: 'GOVERNMENT'
      },
      {
        stance: 'CONTRADICTS',
        credibilityScore: 0.9,
        relevanceScore: 0.85,
        freshnessScore: 0.88,
        reviewerConfidence: 0.9,
        sourceType: 'RESEARCH_PAPER'
      }
    ]);

    expect(['FALSE', 'SEVERELY_FALSE']).toContain(result.verdictType);
    expect(result.falsityScore).toBeGreaterThan(60);
  });

  it('returns PARTLY_FALSE for contradictory true/false evidence (mixed signal)', () => {
    const result = computeAdvancedVerdict([
      {
        stance: 'SUPPORTS',
        credibilityScore: 0.85,
        relevanceScore: 0.85,
        freshnessScore: 0.8,
        reviewerConfidence: 0.85,
        sourceType: 'RESEARCH_PAPER'
      },
      {
        stance: 'CONTRADICTS',
        credibilityScore: 0.82,
        relevanceScore: 0.8,
        freshnessScore: 0.8,
        reviewerConfidence: 0.84,
        sourceType: 'NEWS'
      }
    ]);

    expect(result.verdictType).toBe('PARTLY_FALSE');
    expect(result.contradictionLevel).toBeGreaterThan(0);
  });

  it('assigns LOW confidence for weak evidence', () => {
    const result = computeAdvancedVerdict([
      {
        stance: 'SUPPORTS',
        credibilityScore: 0.2,
        relevanceScore: 0.2,
        freshnessScore: 0.1,
        reviewerConfidence: 0.2,
        sourceType: 'SOCIAL_MEDIA'
      }
    ]);

    expect(result.confidenceBand).toBe('LOW');
    expect(result.confidenceScore).toBeLessThan(0.3);
  });

  it('computes weighted scores and contradiction metrics deterministically', () => {
    const evidences = [
      {
        stance: 'SUPPORTS' as const,
        credibilityScore: 0.8,
        relevanceScore: 0.8,
        freshnessScore: 0.8,
        reviewerConfidence: 0.8,
        sourceType: 'GOVERNMENT'
      },
      {
        stance: 'CONTRADICTS' as const,
        credibilityScore: 0.7,
        relevanceScore: 0.7,
        freshnessScore: 0.7,
        reviewerConfidence: 0.7,
        sourceType: 'NEWS'
      }
    ];

    const weighted = computeWeightedScores(evidences);
    const contradiction = analyzeContradictions(evidences, weighted.supportScore, weighted.contradictScore);
    const falsity = calculateFalsityScore(weighted.supportScore, weighted.contradictScore);

    expect(weighted.effectiveEvidenceCount).toBe(2);
    expect(contradiction.hasSupportingEvidence).toBe(true);
    expect(contradiction.hasContradictingEvidence).toBe(true);
    expect(falsity.falsityScore).toBeGreaterThanOrEqual(0);
    expect(falsity.falsityScore).toBeLessThanOrEqual(100);
  });
});
