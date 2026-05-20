'use client';

import Link from 'next/link';
import Button from '../ui/button';

export type ErrorSeverity = 'page' | 'section' | 'inline';

type Props = {
  title: string;
  description: string;
  severity?: ErrorSeverity;
  retry?: () => void;
  dashboardHref?: string;
};

export default function ErrorState({
  title,
  description,
  severity = 'section',
  retry,
  dashboardHref = '/dashboard'
}: Props) {
  if (severity === 'inline') {
    return (
      <p className="text-xs text-red-700" role="alert">
        {title}: {description}
      </p>
    );
  }

  const box =
    severity === 'page'
      ? 'rounded-xl border border-red-200 bg-red-50 p-8 text-center'
      : 'rounded-lg border border-red-200 bg-red-50 p-4';

  return (
    <div className={box} role="alert">
      <h3 className="text-sm font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-800">{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {retry ? (
          <Button type="button" onClick={retry}>
            Try again
          </Button>
        ) : null}
        {severity === 'page' ? (
          <Link href={dashboardHref} className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50">
            Go to Dashboard
          </Link>
        ) : null}
      </div>
    </div>
  );
}
