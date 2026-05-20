import type { VerdictViewModel } from '../../types/review';

export default function ModerationSummary({ verdict }: { verdict: VerdictViewModel }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-sm font-medium text-neutral-900">Moderation Summary</div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-neutral-500">Approved</dt><dd className="font-medium text-neutral-900">{verdict.isApproved ? 'Yes' : 'No'}</dd></div>
        <div><dt className="text-neutral-500">Published</dt><dd className="font-medium text-neutral-900">{verdict.publishedAt ? new Date(verdict.publishedAt).toLocaleDateString() : 'Not yet'}</dd></div>
        <div><dt className="text-neutral-500">Reviewer</dt><dd className="font-medium text-neutral-900">{verdict.publishedById || 'Unassigned'}</dd></div>
        <div><dt className="text-neutral-500">Confidence</dt><dd className="font-medium text-neutral-900">{Math.round(verdict.confidenceScore * 100)}%</dd></div>
      </dl>
    </div>
  );
}
