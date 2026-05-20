'use client';

import { useState } from 'react';
import type { ClaimTableState } from '../../types/claims';
import Button from '../ui/button';
import Input from '../ui/input';
import type { SavedFilterView } from '../../stores/ui.store';

type Props = {
  state: ClaimTableState;
  onChange: (next: Partial<ClaimTableState>) => void;
  categories: string[];
  analysts: string[];
  savedViews: SavedFilterView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedFilterView) => void;
  onRemoveView: (id: string) => void;
  filterButtonLabel: string;
};

export default function AdvancedFilterPanel({
  state,
  onChange,
  categories,
  analysts,
  savedViews,
  onSaveView,
  onLoadView,
  onRemoveView,
  filterButtonLabel
}: Props) {
  const [saveName, setSaveName] = useState('');
  const [open, setOpen] = useState(false);

  const activeChips: { key: keyof ClaimTableState | string; label: string; onRemove: () => void }[] = [];
  if (state.status) {
    activeChips.push({
      key: 'status',
      label: `Status: ${state.status}`,
      onRemove: () => onChange({ status: '', page: 1 })
    });
  }
  if (state.verdict) {
    activeChips.push({
      key: 'verdict',
      label: `Verdict: ${state.verdict}`,
      onRemove: () => onChange({ verdict: '', page: 1 })
    });
  }
  if (state.category) {
    activeChips.push({
      key: 'category',
      label: `Category: ${state.category}`,
      onRemove: () => onChange({ category: '', page: 1 })
    });
  }
  if (state.analyst) {
    activeChips.push({
      key: 'analyst',
      label: `Analyst: ${state.analyst}`,
      onRemove: () => onChange({ analyst: '', page: 1 })
    });
  }
  if (state.publication !== 'all') {
    activeChips.push({
      key: 'publication',
      label: `Publication: ${state.publication}`,
      onRemove: () => onChange({ publication: 'all', page: 1 })
    });
  }
  if (state.search.trim()) {
    activeChips.push({
      key: 'search',
      label: `Search: ${state.search}`,
      onRemove: () => onChange({ search: '', page: 1 })
    });
  }

  const clearAll = () => {
    onChange({
      search: '',
      status: '',
      verdict: '',
      category: '',
      analyst: '',
      publication: 'all',
      page: 1
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {filterButtonLabel}
        </Button>
        <label className="text-xs text-neutral-600">
          My views
          <select
            className="ml-2 rounded border border-neutral-300 px-2 py-1 text-sm"
            onChange={(e) => {
              const v = savedViews.find((s) => s.id === e.target.value);
              if (v) onLoadView(v);
              e.target.selectedIndex = 0;
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Load saved…
            </option>
            {savedViews.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {savedViews.length > 0 ? (
          <ul className="flex flex-wrap gap-2 text-xs text-neutral-600" aria-label="Saved views">
            {savedViews.map((s) => (
              <li key={s.id} className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1">
                <button type="button" className="hover:underline" onClick={() => onLoadView(s)}>
                  {s.name}
                </button>
                <button type="button" className="text-red-700 hover:underline" onClick={() => onRemoveView(s.id)} aria-label={`Remove saved view ${s.name}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {open && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-medium text-neutral-600">
              Status
              <select
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-2 text-sm"
                value={state.status}
                onChange={(e) => onChange({ status: e.target.value, page: 1 })}
              >
                <option value="">Any</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under review</option>
                <option value="NEEDS_MORE_EVIDENCE">Needs more evidence</option>
                <option value="READY_FOR_VERDICT">Ready for verdict</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label className="text-xs font-medium text-neutral-600">
              Verdict
              <Input
                className="mt-1"
                value={state.verdict}
                onChange={(e) => onChange({ verdict: e.target.value, page: 1 })}
                placeholder="TRUE, FALSE…"
              />
            </label>
            <label className="text-xs font-medium text-neutral-600">
              Category
              <select
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-2 text-sm"
                value={state.category}
                onChange={(e) => onChange({ category: e.target.value, page: 1 })}
              >
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-neutral-600">
              Analyst
              <select
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-2 text-sm"
                value={state.analyst}
                onChange={(e) => onChange({ analyst: e.target.value, page: 1 })}
              >
                <option value="">Any</option>
                {analysts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-neutral-600">
              Publication
              <select
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-2 text-sm"
                value={state.publication}
                onChange={(e) =>
                  onChange({ publication: e.target.value as ClaimTableState['publication'], page: 1 })
                }
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
            <Input placeholder="Name this view" value={saveName} onChange={(e) => setSaveName(e.target.value)} className="max-w-xs" />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!saveName.trim()) return;
                onSaveView(saveName.trim());
                setSaveName('');
              }}
            >
              Save current filters
            </Button>
            <Button type="button" variant="outline" onClick={clearAll}>
              Clear all filters
            </Button>
          </div>
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Active filters">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-800"
              onClick={chip.onRemove}
            >
              {chip.label}
              <span aria-hidden>×</span>
            </button>
          ))}
          <Button type="button" className="text-xs" variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
