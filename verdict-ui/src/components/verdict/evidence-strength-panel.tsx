import type { EvidenceViewModel } from '../../types/investigations';

export default function EvidenceStrengthPanel({ evidence }: { evidence: EvidenceViewModel[] }) {
  const avg = evidence.length
    ? evidence.reduce((sum, item) => sum + item.scoring.credibilityScore + item.scoring.relevanceScore + item.scoring.freshnessScore, 0) / (evidence.length * 3)
    : 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-medium text-neutral-900">Evidence Strength</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">{Math.round(avg * 100)}%</div>
      <div className="mt-1 text-sm text-neutral-600">Aggregated backend scoring</div>
    </div>
  );
}
