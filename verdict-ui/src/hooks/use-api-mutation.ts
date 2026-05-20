import { useMutation, useQueryClient, type MutationFunction, type QueryKey, type UseMutationOptions } from '@tanstack/react-query';

export function useApiMutation<TData, TVariables, TError = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidate?: QueryKey[] | ((data: TData, variables: TVariables) => QueryKey[]);
  }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context) => {
      const invalidationTargets = typeof options?.invalidate === 'function' ? options.invalidate(data, variables) : options?.invalidate;

      if (invalidationTargets) {
        await Promise.all(invalidationTargets.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      }

      await options?.onSuccess?.(data, variables, context);
    }
  });
}
