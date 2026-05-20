import type { InvestigationViewModel } from '../../types/investigations';

export default function VerdictPreview({ investigation }: { investigation: InvestigationViewModel }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-sm font-medium text-neutral-900">Verdict Preview</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">{investigation.status.replace(/_/g, ' ')}</div>
      <div className="mt-1 text-sm text-neutral-600">Preview only. Final publication stays backend-owned.</div>
    </div>
  );
}
