import type { VerdictViewModel } from '../../types/review';

export default function VerdictPreviewPanel({ verdict }: { verdict: VerdictViewModel }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="text-sm font-medium text-neutral-900">Verdict Preview</div>
      <div className="mt-2 text-lg font-semibold text-neutral-900">{verdict.verdictType.replaceAll('_', ' ')}</div>
      <div className="mt-2 text-sm text-neutral-600">{verdict.reasoning || 'No reasoning supplied yet.'}</div>
    </div>
  );
}
