"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from './loading-screen';
import { ROUTES } from '../../config/routes';
import { hasAtLeastRole, type Role } from '../../config/roles';
import { useAuthState } from '../../hooks/use-auth';

export default function RoleGuard({ children, roles }: { children: ReactNode; roles: Role[] }) {
  const router = useRouter();
  const { role, isAuthenticated, isHydrated, isLoading } = useAuthState();

  const isAllowed = roles.some((requiredRole) => hasAtLeastRole(role, requiredRole));

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || isLoading) {
      return;
    }

    if (!isAllowed) {
      router.replace(ROUTES.FORBIDDEN);
    }
  }, [isAllowed, isAuthenticated, isHydrated, isLoading, router]);

  if (!isHydrated || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (!isAllowed) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
