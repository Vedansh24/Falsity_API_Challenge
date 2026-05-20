"use client";

import Link from 'next/link';
import Button from '../ui/button';
import ClaimsSearch from './claims-search';
import type { ClaimTableState } from '../../types/claims';
import type { Role } from '../../config/roles';

type Props = {
  state: ClaimTableState;
  onChange: (next: Partial<ClaimTableState>) => void;
  selectedCount: number;
  totalCount: number;
  role?: Role | null;
  onReset?: () => void;
  onToggleAllColumns: () => void;
  onToggleColumn: (key: string) => void;
  visibleColumns: Record<string, boolean>;
};

const columnLabels: Record<string, string> = {
  title: 'Title',
  status: 'Workflow',
  verdict: 'Verdict',
  category: 'Category',
  analyst: 'Analyst',
  confidence: 'Confidence',
  publishedAt: 'Published',
  updatedAt: 'Updated',
  actions: 'Actions'
};

export default function ClaimsTableToolbar({
  state,
  onChange,
  selectedCount,
  totalCount,
  role,
  onReset,
  onToggleAllColumns,
  onToggleColumn,
  visibleColumns
}: Props) {
  const canCreate = role === 'USER' || role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN';

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3 xl:max-w-2xl xl:flex-1">
          <ClaimsSearch value={state.search} onChange={(value) => onChange({ search: value, page: 1 })} />
          <div className="text-sm text-neutral-600">
            {selectedCount > 0 ? (
              <span>{selectedCount} selected</span>
            ) : (
              <span>
                Operational queue with <span className="font-medium text-neutral-900">{totalCount}</span> records
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <Button type="button" className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
              <Link href="/dashboard/claims/new">New claim</Link>
            </Button>
          )}
          <Button type="button" onClick={onToggleAllColumns} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
            Toggle columns
          </Button>
          {onReset && (
            <Button type="button" onClick={onReset} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
              Reset
            </Button>
          )}
        </div>
      </div>

      <details className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-neutral-800">Column visibility</summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(columnLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={visibleColumns[key] !== false} onChange={() => onToggleColumn(key)} />
              {label}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
