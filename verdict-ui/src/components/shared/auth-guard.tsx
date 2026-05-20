"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './loading-screen';
import { useAuthState } from '../../hooks/use-auth';
import { getRoleHomePath } from '../../config/roles';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading, role } = useAuthState();

  useEffect(() => {
    if (isHydrated && !isLoading && isAuthenticated) {
      router.replace(getRoleHomePath(role));
    }
  }, [isAuthenticated, isHydrated, isLoading, role, router]);

  if (!isHydrated || isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
