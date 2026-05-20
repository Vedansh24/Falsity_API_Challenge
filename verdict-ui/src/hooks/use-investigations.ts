import { queryKeys } from '../lib/query-keys';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { investigationsService } from '../services/api/investigations.service';
import type { EntityRecord, Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';
import type { UseQueryOptions } from '@tanstack/react-query';

export function useInvestigationsQuery(
  params?: QueryParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof investigationsService.list>>, unknown>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery([...queryKeys.investigations.lists(), params ?? {}], () => investigationsService.list(params), {
    keepPreviousData: true,
    ...options
  });
}

export function useInvestigationQuery(
  investigationId?: Id,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof investigationsService.detail>>, unknown>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery(queryKeys.investigations.detail(String(investigationId ?? '')), () => investigationsService.detail(String(investigationId)), {
    enabled: Boolean(investigationId),
    ...options
  });
}

export function useCreateInvestigationMutation() {
  return useApiMutation((payload: EntityRecord) => investigationsService.create(payload), {
    invalidate: [queryKeys.investigations.all]
  });
}

export function useUpdateInvestigationMutation(investigationId: Id) {
  return useApiMutation((payload: EntityRecord) => investigationsService.update(investigationId, payload), {
    invalidate: [queryKeys.investigations.all, queryKeys.investigations.detail(investigationId)]
  });
}

export function useDeleteInvestigationMutation(investigationId: Id) {
  return useApiMutation(() => investigationsService.remove(investigationId), {
    invalidate: [queryKeys.investigations.all]
  });
}
