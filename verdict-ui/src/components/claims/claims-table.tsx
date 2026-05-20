"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '../workflow/status-badge';
import VerdictBadge from '../workflow/verdict-badge';
import ConfidenceIndicator from '../workflow/confidence-indicator';
import ClaimsTableToolbar from './claims-table-toolbar';
import ClaimsTableFilters from './claims-table-filters';
import ClaimsPagination from './claims-pagination';
import ClaimListItem from './claim-list-item';
import ClaimsLoading from './claims-loading';
import ClaimsEmpty from './claims-empty';
import ClaimsError from './claims-error';
import ClaimBulkActionBar from '../operational/claim-bulk-action-bar';
import ClaimsRowActions from './claims-row-actions';
import type { ClaimTableState, ClaimViewModel } from '../../types/claims';
import { getClaimSearchableText } from '../../types/claims';
import type { Role } from '../../config/roles';

type Props = {
  claims: ClaimViewModel[];
  loading?: boolean;
  error?: string | null;
  state: ClaimTableState;
  totalPages: number;
  totalItems: number;
  onStateChange: (next: Partial<ClaimTableState>) => void;
  role?: Role | null;
  onRefresh?: () => void;
  /** When true, floating bulk actions use claim update / verdict publish services */
  showBulkBar?: boolean;
  analystOptions?: { value: string; label: string }[];
  onBulkComplete?: () => void;
  /** When false, toolbar row filters are hidden (e.g. when advanced filter panel is used on the page). */
  showBasicFilters?: boolean;
};

const DEFAULT_COLUMNS: Record<string, boolean> = {
  title: true,
  status: true,
  verdict: true,
  category: true,
  analyst: true,
  confidence: true,
  publishedAt: true,
  updatedAt: false,
  actions: true
};

function sortClaims(claims: ClaimViewModel[], field: ClaimTableState['sortBy'], direction: ClaimTableState['sortOrder']) {
  const sorted = [...claims].sort((left, right) => {
    const leftValue = field === 'confidence' ? left.confidence ?? 0 : field === 'publishedAt' ? left.publishedAt ?? '' : field === 'createdAt' ? left.createdAt ?? '' : field === 'updatedAt' ? left.updatedAt ?? '' : left.title;
    const rightValue = field === 'confidence' ? right.confidence ?? 0 : field === 'publishedAt' ? right.publishedAt ?? '' : field === 'createdAt' ? right.createdAt ?? '' : field === 'updatedAt' ? right.updatedAt ?? '' : right.title;

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return leftValue - rightValue;
    }

    return String(leftValue).localeCompare(String(rightValue));
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}

export default function ClaimsTable({
  claims,
  loading = false,
  error = null,
  state,
  totalPages,
  totalItems,
  onStateChange,
  role,
  onRefresh,
  showBulkBar = false,
  analystOptions = [],
  onBulkComplete,
  showBasicFilters = true
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleColumns = state.visibleColumns && Object.keys(state.visibleColumns).length > 0 ? state.visibleColumns : DEFAULT_COLUMNS;
  const filteredClaims = useMemo(() => {
    const normalizedSearch = state.search.trim().toLowerCase();

    const filtered = claims.filter((claim) => {
      if (state.status && claim.status !== state.status) {
        return false;
      }

      if (state.verdict && (claim.verdict ?? '') !== state.verdict) {
        return false;
      }

      if (state.category && (claim.category ?? '').toLowerCase() !== state.category.toLowerCase()) {
        return false;
      }

      if (state.analyst) {
        const assignedAnalyst = (claim.assignedAnalyst ?? claim.currentAnalystId ?? '').toLowerCase();
        if (assignedAnalyst !== state.analyst.toLowerCase()) {
          return false;
        }
      }

      if (state.publication !== 'all') {
        const publicationState = claim.archivedAt ? 'archived' : claim.publishedAt ? 'published' : 'unpublished';
        if (publicationState !== state.publication) {
          return false;
        }
      }

      if (normalizedSearch) {
        return getClaimSearchableText(claim).includes(normalizedSearch);
      }

      return true;
    });

    return sortClaims(filtered, state.sortBy, state.sortOrder);
  }, [claims, state.analyst, state.category, state.publication, state.search, state.sortBy, state.sortOrder, state.status, state.verdict]);

  const categories = useMemo(() => Array.from(new Set(claims.map((claim) => claim.category).filter((category): category is string => Boolean(category)))), [claims]);
  const analysts = useMemo(() => Array.from(new Set(claims.map((claim) => claim.assignedAnalyst).filter((analyst): analyst is string => Boolean(analyst)))), [claims]);

  const allColumnsVisible = Object.values(visibleColumns).every(Boolean);
  const allRowsSelected = filteredClaims.length > 0 && filteredClaims.every((claim) => selectedIds.includes(claim.id));

  const toggleColumn = (key: string) => {
    onStateChange({ visibleColumns: { ...visibleColumns, [key]: !visibleColumns[key] } });
  };

  const toggleAllColumns = () => {
    const nextValue = !allColumnsVisible;
    const nextColumns = Object.keys(visibleColumns).reduce<Record<string, boolean>>((accumulator, key) => {
      accumulator[key] = nextValue;
      return accumulator;
    }, {});

    onStateChange({ visibleColumns: nextColumns });
  };

  const resetFilters = () => {
    onStateChange({
      search: '',
      status: '',
      verdict: '',
      category: '',
      analyst: '',
      publication: 'all',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      page: 1,
      pageSize: state.pageSize,
      visibleColumns
    });
  };

  if (loading) {
    return <ClaimsLoading />;
  }

  if (error) {
    return <ClaimsError message={error} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-4">
      <ClaimsTableToolbar
        state={state}
        onChange={onStateChange}
        selectedCount={selectedIds.length}
        totalCount={totalItems}
        role={role}
        onReset={resetFilters}
        onToggleAllColumns={toggleAllColumns}
        onToggleColumn={toggleColumn}
        visibleColumns={visibleColumns}
      />

      {showBasicFilters ? (
        <ClaimsTableFilters
          state={state}
          onChange={onStateChange}
          categories={categories}
          analysts={analysts}
          onReset={resetFilters}
        />
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm text-neutral-600">
          Showing <span className="font-medium text-neutral-900">{filteredClaims.length}</span> filtered claims on this page
        </div>

        {filteredClaims.length === 0 ? (
          <div className="p-4">
            <ClaimsEmpty onReset={resetFilters} />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                      <input
                        type="checkbox"
                        aria-label="Select all visible claims"
                        checked={allRowsSelected}
                        onChange={() => setSelectedIds(allRowsSelected ? [] : filteredClaims.map((claim) => claim.id))}
                      />
                    </th>
                    {visibleColumns.title !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Claim</th>}
                    {visibleColumns.status !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Workflow</th>}
                    {visibleColumns.verdict !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Verdict</th>}
                    {visibleColumns.category !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Category</th>}
                    {visibleColumns.analyst !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Analyst</th>}
                    {visibleColumns.confidence !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Confidence</th>}
                    {visibleColumns.publishedAt !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Published</th>}
                    {visibleColumns.updatedAt !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Updated</th>}
                    {visibleColumns.actions !== false && <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {filteredClaims.map((claim) => {
                    const checked = selectedIds.includes(claim.id);
                    return (
                      <tr key={claim.id} className={checked ? 'bg-neutral-50' : ''}>
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            aria-label={`Select claim ${claim.title}`}
                            checked={checked}
                            onChange={() =>
                              setSelectedIds((current) =>
                                current.includes(claim.id) ? current.filter((value) => value !== claim.id) : [...current, claim.id]
                              )
                            }
                          />
                        </td>
                        {visibleColumns.title !== false && (
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <Link href={`/dashboard/claims/${claim.publicSlug ?? claim.id}`} className="block font-medium text-neutral-900 hover:underline">
                                {claim.title}
                              </Link>
                              <p className="max-w-2xl text-sm text-neutral-600 line-clamp-2">{claim.statement}</p>
                            </div>
                          </td>
                        )}
                        {visibleColumns.status !== false && (
                          <td className="px-4 py-4 align-top">
                            <StatusBadge status={claim.status} />
                          </td>
                        )}
                        {visibleColumns.verdict !== false && (
                          <td className="px-4 py-4 align-top">
                            {claim.verdict ? <VerdictBadge verdict={claim.verdict} /> : <span className="text-sm text-neutral-500">Not set</span>}
                          </td>
                        )}
                        {visibleColumns.category !== false && <td className="px-4 py-4 align-top text-sm text-neutral-700">{claim.category ?? '—'}</td>}
                        {visibleColumns.analyst !== false && <td className="px-4 py-4 align-top text-sm text-neutral-700">{claim.assignedAnalyst ?? 'Unassigned'}</td>}
                        {visibleColumns.confidence !== false && (
                          <td className="px-4 py-4 align-top min-w-40">
                            <div className="space-y-2">
                              <ConfidenceIndicator value={typeof claim.confidence === 'number' ? claim.confidence / 100 : 0} />
                              <div className="text-xs text-neutral-500">{typeof claim.confidence === 'number' ? `${Math.round(claim.confidence)}%` : 'Unavailable'}</div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.publishedAt !== false && (
                          <td className="px-4 py-4 align-top text-sm text-neutral-700">{claim.publishedAt ? new Date(claim.publishedAt).toLocaleDateString() : '—'}</td>
                        )}
                        {visibleColumns.updatedAt !== false && (
                          <td className="px-4 py-4 align-top text-sm text-neutral-700">{claim.updatedAt ? new Date(claim.updatedAt).toLocaleDateString() : '—'}</td>
                        )}
                        {visibleColumns.actions !== false && (
                          <td className="px-4 py-4 align-top">
                            <ClaimsRowActions claimId={claim.id} claimSlug={claim.publicSlug} role={role} />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {filteredClaims.map((claim) => (
                <ClaimListItem key={claim.id} claim={claim} role={role} />
              ))}
            </div>
          </>
        )}
      </div>

      <ClaimsPagination
        page={state.page}
        totalPages={totalPages}
        pageSize={state.pageSize}
        totalItems={totalItems}
        onPageChange={(page) => onStateChange({ page })}
        onPageSizeChange={(pageSize) => onStateChange({ pageSize, page: 1 })}
      />

      {showBulkBar && role && (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN') ? (
        <ClaimBulkActionBar
          role={role}
          selectedIds={selectedIds}
          analystOptions={analystOptions}
          onClearSelection={() => setSelectedIds([])}
          onComplete={() => {
            setSelectedIds([]);
            onBulkComplete?.();
          }}
        />
      ) : null}
    </div>
  );
}
