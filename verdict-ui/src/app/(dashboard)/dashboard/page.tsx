"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState, useAuthRedirectPath } from '../../../hooks/use-auth';
import AuthLoadingScreen from '../../../components/auth/auth-loading-screen';

export default function DashboardHome() {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = useAuthState();
  const redirectPath = useAuthRedirectPath();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Redirect to role home path
    if (redirectPath) {
      router.replace(redirectPath);
    } else {
      router.replace('/dashboard');
    }
  }, [isHydrated, isAuthenticated, redirectPath, router]);

  if (!isHydrated) return <AuthLoadingScreen />;

  return null;
}

