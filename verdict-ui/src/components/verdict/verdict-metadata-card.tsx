import type { VerdictViewModel } from '../../types/review';

export default function VerdictMetadataCard({ verdict }: { verdict: VerdictViewModel }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-medium text-neutral-900">Verdict Metadata</div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-neutral-500">ID</dt><dd className="font-mono text-neutral-900">{verdict.id}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-neutral-500">Claim</dt><dd className="font-mono text-neutral-900">{verdict.claimId}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-neutral-500">Band</dt><dd className="text-neutral-900">{verdict.confidenceBand}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-neutral-500">Created</dt><dd className="text-neutral-900">{verdict.createdAt ? new Date(verdict.createdAt).toLocaleString() : 'Unknown'}</dd></div>
      </dl>
    </div>
  );
}
