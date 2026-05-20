import type { VerdictViewModel } from '../../types/review';

export default function ReviewerSummary({ verdict }: { verdict: VerdictViewModel }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold text-neutral-900">Reviewer Summary</div>
      <div className="mt-2 text-sm text-neutral-600">Current decision: {verdict.verdictType.replaceAll('_', ' ')}</div>
    </div>
  );
}
