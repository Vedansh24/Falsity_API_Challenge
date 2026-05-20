import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

export function useApiQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError, TData, QueryKey>({
    queryKey,
    queryFn,
    ...options
  });
}
