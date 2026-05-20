import type { EvidenceViewModel } from '../../types/investigations';

export default function EvidenceStrengthSummary({ evidence }: { evidence: EvidenceViewModel[] }) {
  const averageCredibility = evidence.length
    ? evidence.reduce((sum, item) => sum + item.scoring.credibilityScore, 0) / evidence.length
    : 0;

  const averageRelevance = evidence.length
    ? evidence.reduce((sum, item) => sum + item.scoring.relevanceScore, 0) / evidence.length
    : 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-medium text-neutral-900">Evidence Strength</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-neutral-50 p-3">
          <div className="text-neutral-500 text-xs">Credibility</div>
          <div className="font-semibold text-neutral-900">{Math.round(averageCredibility * 100)}%</div>
        </div>
        <div className="rounded-md bg-neutral-50 p-3">
          <div className="text-neutral-500 text-xs">Relevance</div>
          <div className="font-semibold text-neutral-900">{Math.round(averageRelevance * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
