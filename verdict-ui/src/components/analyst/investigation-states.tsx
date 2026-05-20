'use client';

import { AlertCircle, FileSearch, Loader2 } from 'lucide-react';
import Button from '../ui/button';

export function InvestigationLoadingState({ message = 'Loading investigation workspace...' }: { message?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-500" />
      <p className="mt-3 text-sm text-neutral-600">{message}</p>
    </div>
  );
}

export function InvestigationErrorState({
  message = 'Unable to load this investigation right now.',
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">Investigation unavailable</p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry ? (
            <Button className="mt-4" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InvestigationEmptyState({
  title = 'No assigned investigations',
  description = 'New investigations assigned to you will appear here.'
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
      <FileSearch className="mx-auto h-8 w-8 text-neutral-400" />
      <p className="mt-4 text-base font-medium text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}
