'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import PageHeader from '../../../../../components/shared/page-header';
import Input from '../../../../../components/ui/input';
import Button from '../../../../../components/ui/button';
import Badge from '../../../../../components/ui/badge';
import { useInvestigationsQuery } from '../../../../../hooks/use-investigations';
import { useAuthState } from '../../../../../hooks/use-auth';
import { normalizeInvestigations } from '../../../../../types/investigations';
import { InvestigationEmptyState, InvestigationErrorState, InvestigationLoadingState } from '../../../../../components/analyst/investigation-states';

export default function AnalystInvestigationsPage() {
  const { user } = useAuthState();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const investigationsQuery = useInvestigationsQuery({ page, pageSize: 20 } as any);
  const payload = (investigationsQuery.data as any)?.data;
  const investigations = normalizeInvestigations(payload?.items ?? []);

  const assignedToMe = useMemo(() => {
    if (!user?.id) return investigations;
    return investigations.filter((item) => item.assignedAnalystId === user.id || item.assignedAnalyst?.toLowerCase() === user.name?.toLowerCase());
  }, [investigations, user?.id, user?.name]);

  const filtered = useMemo(() => {
    return assignedToMe.filter((item) => {
      const inSearch = search
        ? [item.id, item.claimId, item.assignedAnalyst, item.reviewer]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const inStatus = status ? item.status === status : true;
      return inSearch && inStatus;
    });
  }, [assignedToMe, search, status]);

  const getStatusClass = (value: string) => {
    if (value === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800';
    if (value === 'AWAITING_EVIDENCE') return 'bg-amber-100 text-amber-800';
    if (value === 'READY_FOR_REVIEW') return 'bg-emerald-100 text-emerald-800';
    if (value === 'COMPLETED') return 'bg-neutral-100 text-neutral-700';
    return 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned investigations"
        subtitle="Your active investigation queue with evidence readiness and workflow visibility."
      />

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search by claim, id, or teammate" />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="AWAITING_EVIDENCE">Awaiting evidence</option>
            <option value="READY_FOR_REVIEW">Ready for review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {investigationsQuery.isLoading && <InvestigationLoadingState message="Loading your analyst queue..." />}
      {investigationsQuery.isError && (
        <InvestigationErrorState
          message="Your queue could not be loaded."
          onRetry={() => {
            void investigationsQuery.refetch();
          }}
        />
      )}
      {!investigationsQuery.isLoading && !investigationsQuery.isError && filtered.length === 0 && (
        <InvestigationEmptyState description="No investigations in your current queue match these filters." />
      )}

      {!investigationsQuery.isLoading && !investigationsQuery.isError && filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Investigation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Readiness</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">Evidence</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Updated</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">Claim {item.claimId}</div>
                    <div className="text-xs text-neutral-500">{item.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusClass(item.status)}>{item.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-neutral-700">{item.verdictReadiness ?? 0}%</td>
                  <td className="px-4 py-3 text-center text-sm text-neutral-700">{item.evidenceCount}</td>
                  <td className="px-4 py-3 text-right text-sm text-neutral-600">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/analyst/investigations/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Page {page} of {payload?.totalPages ?? 1}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1 || investigationsQuery.isLoading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= (payload?.totalPages ?? 1) || investigationsQuery.isLoading}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
