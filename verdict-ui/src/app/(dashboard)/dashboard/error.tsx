'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/ui/button';
import ErrorState from '../../../components/system/error-state';
import { logger } from '../../../lib/logger';

export default function DashboardRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error('DashboardRouteError', error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12">
      <ErrorState
        severity="page"
        title="This dashboard page failed to load"
        description={error.message || 'We could not retrieve this data.'}
        retry={reset}
      />
      <div className="mt-6 text-center">
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
