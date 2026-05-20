"use client";

import Button from '../ui/button';

type Props = {
  title?: string;
  subtitle?: string;
  onReset?: () => void;
};

export default function ClaimsEmpty({ title = 'No claims match the current filters', subtitle = 'Adjust the search or filters to return to the operational queue.', onReset }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center shadow-sm">
      <div className="text-lg font-semibold text-neutral-900">{title}</div>
      <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
      {onReset && (
        <div className="mt-4">
          <Button type="button" onClick={onReset} className="bg-transparent text-neutral-900 hover:bg-neutral-100 dark:bg-transparent dark:text-neutral-900 dark:hover:bg-neutral-100">
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
