export type EvidenceInput = {
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
};

export type ScoreInput = {
  supportScore: number;
  contradictScore: number;
};

export type VerdictOutput = {
  verdict: 'TRUE' | 'FALSE' | 'INCONCLUSIVE';
  confidenceScore: number;
  finalScore: number;
};

export type VerdictContext = {
  supportScore: number;
  contradictScore: number;
  finalScore: number;
  verdict: 'TRUE' | 'FALSE' | 'INCONCLUSIVE';
};

export type ComputeVerdictResult = {
  verdict: 'TRUE' | 'FALSE' | 'INCONCLUSIVE';
  confidenceScore: number;
  supportScore: number;
  contradictScore: number;
  reasoning: string;
};