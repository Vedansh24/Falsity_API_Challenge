import { queryKeys } from '../lib/query-keys';
import { queryInvalidation } from '../lib/query-invalidation';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { claimsService } from '../services/api/claims.service';
import type { EntityRecord, Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';
import type { UseQueryOptions } from '@tanstack/react-query';

export function useClaimsQuery(
  params?: QueryParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof claimsService.list>>, unknown>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery([...queryKeys.claims.lists(), params ?? {}], () => claimsService.list(params), {
    keepPreviousData: true,
    ...options
  });
}

export function useClaimQuery(
  claimId?: Id,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof claimsService.detail>>, unknown>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery(queryKeys.claims.detail(String(claimId ?? '')), () => claimsService.detail(String(claimId)), {
    enabled: Boolean(claimId),
    ...options
  });
}

export function useClaimEvidenceQuery(
  claimId?: Id,
  params?: QueryParams,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof claimsService.evidence>>, unknown>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery([...queryKeys.claims.evidence(String(claimId ?? '')), params ?? {}], () => claimsService.evidence(String(claimId), params), {
    enabled: Boolean(claimId),
    keepPreviousData: true,
    ...options
  });
}

export function useCreateClaimMutation() {
  return useApiMutation((payload: EntityRecord) => claimsService.create(payload), {
    invalidate: [queryKeys.claims.all]
  });
}

export function useUpdateClaimMutation(claimId: Id) {
  return useApiMutation((payload: EntityRecord) => claimsService.update(claimId, payload), {
    invalidate: [queryKeys.claims.all, queryKeys.claims.detail(claimId)]
  });
}

export function useDeleteClaimMutation(claimId: Id) {
  return useApiMutation(() => claimsService.remove(claimId), {
    invalidate: [queryKeys.claims.all]
  });
}

export function useClaimInvalidation() {
  return queryInvalidation;
}
