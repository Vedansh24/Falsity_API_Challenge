'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '../../../../components/shared/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Badge from '../../../../components/ui/badge';
import { useClaimsQuery } from '../../../../hooks/use-claims';
import { useVerdictsQuery } from '../../../../hooks/use-verdicts';
import { normalizeClaims } from '../../../../types/claims';
import { normalizeVerdicts, type ReviewQueueState } from '../../../../types/review';
import ModerationLoading from '../../../../components/review/moderation-loading';

export default function ReviewQueuePage() {
  const [state, setState] = useState<ReviewQueueState>({
    search: '',
    status: '',
    reviewer: '',
    verdictReadiness: '',
    confidenceRange: '',
    evidenceStrength: '',
    publicationState: '',
    category: '',
    analyst: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20
  });

  const claimsQuery = useClaimsQuery({ page: state.page, limit: state.pageSize } as any);
  const verdictsQuery = useVerdictsQuery();

  const claims = normalizeClaims(((claimsQuery.data as any)?.data?.items ?? []) as any);
  const verdicts = normalizeVerdicts(((verdictsQuery.data as any)?.data ?? []) as any);
  const verdictByClaimId = useMemo(() => new Map(verdicts.map((verdict) => [verdict.claimId, verdict])), [verdicts]);

  const rows = useMemo(() => claims.map((claim) => ({ claim, verdict: verdictByClaimId.get(claim.id) })), [claims, verdictByClaimId]);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (state.search) {
      const q = state.search.toLowerCase();
      result = result.filter(({ claim, verdict }) => [claim.title, claim.statement, claim.category, claim.assignedAnalyst, claim.assignedReviewer, verdict?.reasoning, verdict?.verdictType].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    if (state.category) result = result.filter(({ claim }) => claim.category === state.category);
    if (state.analyst) result = result.filter(({ claim }) => claim.currentAnalystId === state.analyst || claim.assignedAnalyst === state.analyst);
    if (state.status) result = result.filter(({ claim }) => claim.status === state.status);
    if (state.publicationState === 'published') result = result.filter(({ claim }) => Boolean(claim.publishedAt));
    if (state.publicationState === 'unpublished') result = result.filter(({ claim }) => !claim.publishedAt);
    if (state.verdictReadiness === 'ready') result = result.filter(({ claim }) => claim.status === 'READY_FOR_VERDICT');
    if (state.confidenceRange) {
      const min = Number(state.confidenceRange);
      result = result.filter(({ verdict }) => (verdict?.confidenceScore ?? 0) * 100 >= min);
    }
    return result;
  }, [rows, state]);

  const loading = claimsQuery.isLoading || verdictsQuery.isLoading;

  if (loading) return <ModerationLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Review queue" subtitle="Reviewer moderation queue with verdict readiness, confidence, and publication signals." />

      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Input className="max-w-md" placeholder="Search moderation items" value={state.search} onChange={(e) => setState({ ...state, search: e.target.value })} />
          <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm" value={state.status} onChange={(e) => setState({ ...state, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="READY_FOR_VERDICT">Ready for verdict</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="NEEDS_MORE_EVIDENCE">Needs more evidence</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select className="rounded-md border border-neutral-300 px-3 py-2 text-sm" value={state.publicationState} onChange={(e) => setState({ ...state, publicationState: e.target.value })}>
            <option value="">Publication state</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <Button className="border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50">Filters</Button>
        </div>
      </div>

      <div className="text-sm text-neutral-600">{filtered.length} moderation items</div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Claim</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Falsity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map(({ claim, verdict }) => (
              <tr key={claim.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900">{claim.title}</div>
                  <div className="text-xs text-neutral-500">{claim.assignedAnalyst || 'Unassigned analyst'}</div>
                </td>
                <td className="px-4 py-3"><Badge>{verdict?.verdictType ?? 'PENDING'}</Badge></td>
                <td className="px-4 py-3 text-sm text-neutral-700">{Math.round((verdict?.confidenceScore ?? 0) * 100)}%</td>
                <td className="px-4 py-3 text-sm text-neutral-700">{Math.round(verdict?.falsityScore ?? 0)}%</td>
                <td className="px-4 py-3 text-sm text-neutral-700">{claim.status.replaceAll('_', ' ')}</td>
                <td className="px-4 py-3 text-right"><Link href={`/dashboard/review/${claim.id}`}><Button size="sm">Open</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
