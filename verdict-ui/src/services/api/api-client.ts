import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getEnv } from '../../config/env';
import useAuthStore from '../../stores/auth.store';
import { queryClient } from '../../lib/query-client';
import { normalizeApiError } from './api-error';

const baseURL = getEnv().NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  withCredentials: false
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;

  if (token) {
    config.headers = config.headers ?? new axios.AxiosHeaders();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const normalized = normalizeApiError(error);

    if (normalized.isAuthError && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('verdict_session_expired', '1');
        sessionStorage.setItem('verdict_return_url', window.location.pathname + window.location.search);
      } catch {
        // ignore
      }
      useAuthStore.getState().logout();
      queryClient.clear();
    }

    return Promise.reject(normalized);
  }
);

export default apiClient;
