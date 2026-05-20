"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './loading-screen';
import { ROUTES } from '../../config/routes';
import { useAuthState } from '../../hooks/use-auth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading } = useAuthState();

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.replace(ROUTES.UNAUTHORIZED);
    }
  }, [isAuthenticated, isHydrated, isLoading, router]);

  if (!isHydrated || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
