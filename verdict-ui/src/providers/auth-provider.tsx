"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import useAuthStore from '../stores/auth.store';
import { useSession } from '../hooks/use-session';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  useSession();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return <>{children}</>;
}
