"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthState } from '../../../../hooks/use-auth';
import { usePermissions } from '../../../../hooks/use-permissions';

export default function AnalystWorkspaceLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = useAuthState();
  const { hasAtLeastRole } = usePermissions();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasAtLeastRole('ANALYST')) {
      router.replace('/access-denied');
    }
  }, [isHydrated, isAuthenticated, hasAtLeastRole, router]);

  if (!isHydrated) {
    return <div className="p-8 text-sm text-neutral-600">Loading workspace...</div>;
  }

  if (!isAuthenticated || !hasAtLeastRole('ANALYST')) {
    return null;
  }

  return <>{children}</>;
}
