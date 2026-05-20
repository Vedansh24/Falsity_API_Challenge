"use client";

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../stores/auth.store';
import { authService } from '../services/api/auth.service';
import { queryKeys } from '../lib/query-keys';
import { useApiMutation } from './use-api-mutation';
import type { LoginPayload, SignupPayload, AuthSession } from '../types/auth.types';
import type { User } from '../types/user.types';
import { getRoleHomePath } from '../config/roles';

export function useAuthState() {
  return useAuthStore((state) => ({
    accessToken: state.accessToken,
    user: state.user,
    role: state.role,
    isAuthenticated: state.isAuthenticated,
    isHydrated: state.isHydrated,
    isLoading: state.isLoading
  }));
}

export function useAuthActions() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMemo(
    () => ({
      logout: async () => {
        logout();
        queryClient.clear();
      }
    }),
    [logout, queryClient]
  );
}

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useApiMutation(async (payload: LoginPayload): Promise<AuthSession> => {
    const loginResult = await authService.login(payload);
    setSession({
      accessToken: loginResult.accessToken,
      user: null,
      role: null,
      expiresIn: loginResult.expiresIn
    });

    const currentUser = await authService.getCurrentUser();
    const session: AuthSession = {
      accessToken: loginResult.accessToken,
      user: currentUser,
      role: currentUser.role,
      expiresIn: loginResult.expiresIn
    };

    setSession(session);
    return session;
  }, {
    invalidate: [queryKeys.auth.all]
  });
}

export function useSignupMutation() {
  return useApiMutation(async (payload: SignupPayload): Promise<User> => authService.signup(payload), {
    invalidate: [queryKeys.auth.all]
  });
}

export function useLogoutMutation() {
  const { logout } = useAuthActions();

  return useApiMutation(async () => {
    await authService.logout();
    await logout();
  }, {
    invalidate: [queryKeys.auth.all]
  });
}

export function useAuthRedirectPath() {
  const role = useAuthStore((state) => state.role);

  return getRoleHomePath(role);
}
