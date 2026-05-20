import { QueryClient } from '@tanstack/react-query';
import { shouldRetryApiError } from '../services/api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      cacheTime: 1000 * 60 * 10,
      retry: (failureCount, error) => shouldRetryApiError(error) && failureCount < 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: false
    }
  }
});
