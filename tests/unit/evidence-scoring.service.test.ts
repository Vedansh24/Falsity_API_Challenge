import { calculateQualityScore, getQualityTier } from '../../src/modules/evidence/services/evidence-scoring.service';

describe('evidence scoring service', () => {
  it('gives GOVERNMENT source higher credibility than SOCIAL_MEDIA', () => {
    const gov = calculateQualityScore({
      sourceType: 'GOVERNMENT',
      credibilityScore: 0.7,
      relevanceScore: 0.7,
      freshnessScore: 0.7,
      reviewerConfidence: 0.7,
      isDuplicate: false
    });

    const social = calculateQualityScore({
      sourceType: 'SOCIAL_MEDIA',
      credibilityScore: 0.7,
      relevanceScore: 0.7,
      freshnessScore: 0.7,
      reviewerConfidence: 0.7,
      isDuplicate: false
    });

    expect(gov.breakdown.credibility).toBeGreaterThan(social.breakdown.credibility);
    expect(gov.score).toBeGreaterThan(social.score);
  });

  it('applies duplicate evidence penalty', () => {
    const unique = calculateQualityScore({
      sourceType: 'NEWS',
      isDuplicate: false
    });
    const duplicate = calculateQualityScore({
      sourceType: 'NEWS',
      isDuplicate: true
    });

    expect(duplicate.breakdown.duplicationPenalty).toBeLessThan(0);
    expect(duplicate.score).toBeLessThan(unique.score);
  });

  it('scores freshness and relevance into total score', () => {
    const low = calculateQualityScore({
      sourceType: 'RESEARCH_PAPER',
      freshnessScore: 0.1,
      relevanceScore: 0.1,
      reviewerConfidence: 0.5
    });
    const high = calculateQualityScore({
      sourceType: 'RESEARCH_PAPER',
      freshnessScore: 0.9,
      relevanceScore: 0.9,
      reviewerConfidence: 0.5
    });

    expect(high.breakdown.freshness).toBeGreaterThan(low.breakdown.freshness);
    expect(high.breakdown.relevance).toBeGreaterThan(low.breakdown.relevance);
    expect(high.score).toBeGreaterThan(low.score);
  });

  it('maps score to quality tiers', () => {
    expect(getQualityTier(85)).toBe('EXCELLENT');
    expect(getQualityTier(65)).toBe('GOOD');
    expect(getQualityTier(45)).toBe('FAIR');
    expect(getQualityTier(25)).toBe('POOR');
    expect(getQualityTier(10)).toBe('VERY_POOR');
  });
});
