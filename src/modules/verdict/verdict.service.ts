import { computeVerdict } from './verdict.engine';
import { findByClaimId } from '../evidence/evidence.repository';

export async function getVerdictService(claimId: string) {
  const evidences = await findByClaimId(claimId);

  if (!evidences.length) {
    return {
      verdict: 'INCONCLUSIVE',
      confidenceScore: 0,
      supportScore: 0,
      contradictScore: 0,
      reasoning: 'No evidence available'
    };
  }

  const formatted = evidences.map((e) => ({
    stance: e.stance,
    credibilityScore: e.credibilityScore,
    relevanceScore: e.relevanceScore,
    freshnessScore: e.freshnessScore
  }));

  const result = computeVerdict(formatted);

  return result;
}
