import type { InvestigationViewModel } from '../../types/investigations';

export default function ConfidenceSummary({ investigation }: { investigation: InvestigationViewModel }) {
  const label = investigation.confidenceBand ?? 'UNKNOWN';
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-medium text-neutral-900">Confidence Summary</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">{label.replace(/_/g, ' ')}</div>
      <div className="mt-1 text-sm text-neutral-600">Backend-derived confidence band</div>
    </div>
  );
}
