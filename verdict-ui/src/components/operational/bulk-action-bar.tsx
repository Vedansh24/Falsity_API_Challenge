'use client';

import type { ReactNode } from 'react';

type Props = {
  selectedCount: number;
  onClear: () => void;
  children: ReactNode;
};

export default function BulkActionBar({ selectedCount, onClear, children }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[var(--z-topbar)] flex -translate-x-1/2 items-center gap-4 rounded-full border border-neutral-200 bg-white px-6 py-3 shadow-lg"
      role="status"
      aria-live="polite"
      aria-label={`${selectedCount} rows selected`}
    >
      <span className="text-sm font-medium text-neutral-900">{selectedCount} selected</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        className="text-sm text-neutral-600 underline-offset-2 hover:underline"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
}
