"use client";

import Button from '../ui/button';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export default function ClaimsError({ title = 'Unable to load claims', message = 'The queue could not be loaded right now. Check your connection and try again.', onRetry }: Props) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-900 shadow-sm">
      <div className="text-base font-semibold">{title}</div>
      <p className="mt-2 text-red-800/90">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button type="button" onClick={onRetry} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
