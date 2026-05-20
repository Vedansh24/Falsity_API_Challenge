import { queryKeys } from '../lib/query-keys';
import { queryInvalidation } from '../lib/query-invalidation';
import { queryClient } from '../lib/query-client';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { verdictService } from '../services/api/verdict.service';
import type { EntityRecord, Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';

export function useVerdictsQuery() {
  return useApiQuery(queryKeys.verdicts.lists(), () => verdictService.list(), {
    keepPreviousData: true
  });
}

export function useVerdictQuery(claimId?: Id) {
  return useApiQuery(queryKeys.verdicts.detail(String(claimId ?? '')), () => verdictService.detail(String(claimId)), {
    enabled: Boolean(claimId)
  });
}

export function useVerdictHistoryQuery(claimId?: Id, params?: QueryParams) {
  return useApiQuery([...queryKeys.verdicts.history(String(claimId ?? '')), params ?? {}], () => verdictService.history(String(claimId), params), {
    enabled: Boolean(claimId),
    keepPreviousData: true
  });
}

export function usePublishVerdictMutation(claimId?: Id, investigationId?: Id) {
  return useApiMutation((payload?: EntityRecord) => verdictService.publish(String(claimId), payload), {
    onSuccess: async () => {
      if (claimId) {
        await queryInvalidation.afterVerdictPublished(queryClient, String(claimId), investigationId ? String(investigationId) : undefined);
      }
    }
  });
}

export function useRecomputeVerdictMutation(claimId?: Id) {
  return useApiMutation(() => verdictService.recompute(String(claimId)), {
    invalidate: [queryKeys.verdicts.detail(String(claimId ?? '')), queryKeys.claims.detail(String(claimId ?? ''))]
  });
}

export function useApproveVerdictMutation(verdictId?: Id, claimId?: Id, investigationId?: Id) {
  return useApiMutation(() => verdictService.approve(String(verdictId)), {
    onSuccess: async () => {
      if (claimId) {
        await queryInvalidation.afterVerdictPublished(queryClient, String(claimId), investigationId ? String(investigationId) : undefined);
      }
    }
  });
}

export function useRejectVerdictMutation(verdictId?: Id) {
  return useApiMutation(() => verdictService.reject(String(verdictId)), {
    invalidate: [queryKeys.verdicts.all]
  });
}
