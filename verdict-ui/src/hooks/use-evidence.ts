import { queryKeys } from '../lib/query-keys';
import { queryInvalidation } from '../lib/query-invalidation';
import { queryClient } from '../lib/query-client';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { evidenceService } from '../services/api/evidence.service';
import type { EntityRecord, Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';

export function useEvidenceQuery(params?: QueryParams) {
  return useApiQuery([...queryKeys.evidence.lists(), params ?? {}], () => evidenceService.list(params), {
    keepPreviousData: true
  });
}

export function useEvidenceDetailQuery(evidenceId?: Id) {
  return useApiQuery(queryKeys.evidence.detail(String(evidenceId ?? '')), () => evidenceService.detail(String(evidenceId)), {
    enabled: Boolean(evidenceId)
  });
}

export function useClaimEvidenceQuery(claimId?: Id, params?: QueryParams) {
  return useApiQuery([...queryKeys.evidence.byClaim(String(claimId ?? '')), params ?? {}], () => evidenceService.byClaim(String(claimId), params), {
    enabled: Boolean(claimId),
    keepPreviousData: true
  });
}

export function useCreateEvidenceMutation(claimId?: Id, investigationId?: Id) {
  return useApiMutation((payload: EntityRecord) => evidenceService.create(payload), {
    onSuccess: async () => {
      if (claimId) {
        await queryInvalidation.afterEvidenceAdded(queryClient, String(claimId), investigationId ? String(investigationId) : undefined);
      }
    }
  });
}

export function useUpdateEvidenceMutation(evidenceId: Id, claimId?: Id) {
  return useApiMutation((payload: EntityRecord) => evidenceService.update(evidenceId, payload), {
    invalidate: [queryKeys.evidence.all, queryKeys.evidence.detail(evidenceId), queryKeys.claims.evidence(String(claimId ?? ''))]
  });
}

export function useDeleteEvidenceMutation(evidenceId: Id, claimId?: Id) {
  return useApiMutation(() => evidenceService.remove(evidenceId), {
    invalidate: [queryKeys.evidence.all, queryKeys.claims.evidence(String(claimId ?? ''))]
  });
}
