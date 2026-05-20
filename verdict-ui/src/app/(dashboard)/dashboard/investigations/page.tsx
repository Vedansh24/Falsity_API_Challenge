'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '../../../../components/shared/page-header';
import Button from '../../../../components/ui/button';
import { useInvestigationsQuery } from '../../../../hooks/use-investigations';
import { normalizeInvestigations } from '../../../../types/investigations';
import type { InvestigationTableState } from '../../../../types/investigations';
import Badge from '../../../../components/ui/badge';
import { ChevronRight, Search, Filter } from 'lucide-react';
import Input from '../../../../components/ui/input';

const DEFAULT_VISIBLE_COLUMNS = {
  claimId: true,
  status: true,
  analyst: true,
  reviewer: true,
  verdictReadiness: true,
  evidenceCount: true,
  updated: true,
  actions: true
};

export default function InvestigationsPage() {
  const [state, setState] = useState<InvestigationTableState>({
    search: '',
    status: '',
    analyst: '',
    verdictReadiness: '',
    publication: 'all',
    reviewer: '',
    category: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20,
    visibleColumns: DEFAULT_VISIBLE_COLUMNS
  });

  const queryParams = useMemo(
    () => ({
      page: state.page,
      pageSize: state.pageSize
    }),
    [state.page, state.pageSize]
  );

  const investigationsQuery = useInvestigationsQuery(queryParams as any);
  const payload = (investigationsQuery.data as any)?.data;
  const investigations = normalizeInvestigations(payload?.items ?? []);
  const totalPages = payload?.totalPages ?? 1;
  const totalItems = payload?.total ?? 0;

  // Filter investigations client-side
  const filtered = useMemo(() => {
    let results = [...investigations];

    if (state.search) {
      const searchLower = state.search.toLowerCase();
      results = results.filter(
        (i) =>
          i.id.toLowerCase().includes(searchLower) ||
          i.claimId.toLowerCase().includes(searchLower) ||
          i.assignedAnalyst?.toLowerCase().includes(searchLower) ||
          i.reviewer?.toLowerCase().includes(searchLower)
      );
    }

    if (state.status) {
      results = results.filter((i) => i.status === state.status);
    }

    if (state.analyst) {
      results = results.filter((i) => i.assignedAnalystId === state.analyst);
    }

    if (state.verdictReadiness) {
      const threshold = parseInt(state.verdictReadiness);
      results = results.filter((i) => (i.verdictReadiness || 0) >= threshold);
    }

    return results;
  }, [investigations, state.search, state.status, state.analyst, state.verdictReadiness]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      AWAITING_EVIDENCE: 'bg-yellow-100 text-yellow-800',
      READY_FOR_REVIEW: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReadinessColor = (readiness?: number) => {
    if (!readiness) return 'text-gray-500';
    if (readiness >= 85) return 'text-green-600';
    if (readiness >= 50) return 'text-blue-600';
    if (readiness >= 25) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investigations queue"
        subtitle="Operational investigation workspace with analyst assignment, evidence tracking, and verdict readiness visibility."
      />

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search investigations..."
              value={state.search}
              onChange={(e) => setState({ ...state, search: e.target.value, page: 1 })}
              className="pl-10"
            />
          </div>

          <select
            value={state.status}
            onChange={(e) => setState({ ...state, status: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AWAITING_EVIDENCE">Awaiting Evidence</option>
            <option value="READY_FOR_REVIEW">Ready for Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={state.verdictReadiness}
            onChange={(e) => setState({ ...state, verdictReadiness: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Readiness</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
            <option value="75">75% or more</option>
            <option value="85">Ready (85%+)</option>
          </select>

          <Button className="flex items-center gap-2 border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50">
            <Filter className="w-4 h-4" />
            More
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filtered.length} of {totalItems} investigations
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium mb-1">No investigations found</p>
            <p className="text-sm">Adjust your filters or create a new investigation</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Investigation</th>
                {state.visibleColumns.status && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-32">Status</th>}
                {state.visibleColumns.analyst && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-32">Analyst</th>}
                {state.visibleColumns.reviewer && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-32">Reviewer</th>}
                {state.visibleColumns.verdictReadiness && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 w-24">Readiness</th>}
                {state.visibleColumns.evidenceCount && <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-20">Evidence</th>}
                {state.visibleColumns.updated && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 w-32">Updated</th>}
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.map((investigation) => (
                <tr key={investigation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{investigation.claimId}</div>
                      <div className="text-xs text-gray-500">{investigation.id}</div>
                    </div>
                  </td>

                  {state.visibleColumns.status && (
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(investigation.status)}>{investigation.status.replace(/_/g, ' ')}</Badge>
                    </td>
                  )}

                  {state.visibleColumns.analyst && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {investigation.assignedAnalyst || <span className="text-gray-400">Unassigned</span>}
                    </td>
                  )}

                  {state.visibleColumns.reviewer && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {investigation.reviewer || <span className="text-gray-400">—</span>}
                    </td>
                  )}

                  {state.visibleColumns.verdictReadiness && (
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${getReadinessColor(investigation.verdictReadiness)}`}>
                        {investigation.verdictReadiness || 0}%
                      </span>
                    </td>
                  )}

                  {state.visibleColumns.evidenceCount && (
                    <td className="px-4 py-3 text-center text-sm font-medium">{investigation.evidenceCount}</td>
                  )}

                  {state.visibleColumns.updated && (
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {investigation.updatedAt ? new Date(investigation.updatedAt).toLocaleDateString() : '—'}
                    </td>
                  )}

                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/investigations/${investigation.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {state.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              disabled={state.page === 1 || investigationsQuery.isLoading}
              className="border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              onClick={() => setState({ ...state, page: state.page - 1 })}
            >
              Previous
            </Button>
            <Button
              disabled={state.page >= totalPages || investigationsQuery.isLoading}
              className="border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              onClick={() => setState({ ...state, page: state.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
