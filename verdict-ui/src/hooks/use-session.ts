"use client";

import { useEffect } from 'react';
import useAuthStore from '../stores/auth.store';
import { authService } from '../services/api/auth.service';
import { queryKeys } from '../lib/query-keys';
import { useApiQuery } from './use-api-query';
import type { ApiError } from '../types/error.types';

export function useSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const logout = useAuthStore((state) => state.logout);

  const query = useApiQuery(queryKeys.auth.me(), () => authService.getCurrentUser(), {
    enabled: isHydrated && Boolean(accessToken) && isAuthenticated,
    retry: false,
    staleTime: 1000 * 300,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    setLoading(query.isFetching || query.isLoading);
  }, [query.isFetching, query.isLoading, setLoading]);

  useEffect(() => {
    if (query.data) {
      setCurrentUser(query.data);
    }
  }, [query.data, setCurrentUser]);

  useEffect(() => {
    const error = query.error as ApiError | undefined;

    if (query.isError && error?.isAuthError) {
      logout();
    }
  }, [logout, query.error, query.isError]);

  return {
    ...query,
    isReady: isHydrated,
    isAuthenticated
  };
}
