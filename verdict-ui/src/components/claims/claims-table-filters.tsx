"use client";

import type { ReactNode } from 'react';
import type { ClaimTablePublicationFilter, ClaimTableState } from '../../types/claims';
import { CLAIM_TABLE_SORT_FIELDS, CLAIM_VERDICTS, CLAIM_WORKFLOW_STATUSES } from '../../types/claims';

type FilterProps = {
  state: Pick<ClaimTableState, 'status' | 'verdict' | 'category' | 'analyst' | 'publication' | 'sortBy' | 'sortOrder'>;
  onChange: (next: Partial<ClaimTableState>) => void;
  categories: string[];
  analysts: string[];
  onReset?: () => void;
};

function Select({ value, onChange, children, ariaLabel }: { value: string; onChange: (value: string) => void; children: ReactNode; ariaLabel: string }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30"
    >
      {children}
    </select>
  );
}

export default function ClaimsTableFilters({ state, onChange, categories, analysts, onReset }: FilterProps) {
  const publicationOptions: Array<{ value: ClaimTablePublicationFilter; label: string }> = [
    { value: 'all', label: 'All publications' },
    { value: 'published', label: 'Published' },
    { value: 'unpublished', label: 'Unpublished' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm lg:grid-cols-3 xl:grid-cols-6">
      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Workflow</span>
        <Select value={state.status} onChange={(value) => onChange({ status: value, page: 1 })} ariaLabel="Filter by workflow status">
          <option value="">All statuses</option>
          {CLAIM_WORKFLOW_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Verdict</span>
        <Select value={state.verdict} onChange={(value) => onChange({ verdict: value, page: 1 })} ariaLabel="Filter by verdict">
          <option value="">All verdicts</option>
          {CLAIM_VERDICTS.map((verdict) => (
            <option key={verdict} value={verdict}>
              {verdict.replaceAll('_', ' ')}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Category</span>
        <Select value={state.category} onChange={(value) => onChange({ category: value, page: 1 })} ariaLabel="Filter by category">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Assigned analyst</span>
        <Select value={state.analyst} onChange={(value) => onChange({ analyst: value, page: 1 })} ariaLabel="Filter by analyst">
          <option value="">All analysts</option>
          {analysts.map((analyst) => (
            <option key={analyst} value={analyst}>
              {analyst}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Publication state</span>
        <Select value={state.publication} onChange={(value) => onChange({ publication: value as ClaimTablePublicationFilter, page: 1 })} ariaLabel="Filter by publication state">
          {publicationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Sort</span>
        <Select value={state.sortBy} onChange={(value) => onChange({ sortBy: value as ClaimTableState['sortBy'], page: 1 })} ariaLabel="Sort claims by field">
          {CLAIM_TABLE_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field.replaceAll('_', ' ')}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Direction</span>
        <Select value={state.sortOrder} onChange={(value) => onChange({ sortOrder: value as ClaimTableState['sortOrder'], page: 1 })} ariaLabel="Sort direction">
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </label>

      {onReset && (
        <div className="lg:col-span-3 xl:col-span-6 flex justify-end pt-1">
          <button type="button" onClick={onReset} className="text-sm font-medium text-neutral-700 underline underline-offset-4">
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
