"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthState } from '../../../../hooks/use-auth';
import { useRole } from '../../../../hooks/use-role';

export default function UserWorkspaceLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = useAuthState();
  const role = useRole();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (role !== 'USER') {
      router.replace('/access-denied');
    }
  }, [isHydrated, isAuthenticated, role, router]);

  if (!isHydrated) {
    return <div className="p-8 text-sm text-neutral-600">Loading workspace…</div>;
  }

  if (!isAuthenticated || role !== 'USER') {
    return null;
  }

  return <>{children}</>;
}
