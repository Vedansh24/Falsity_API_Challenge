import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

export const queryInvalidation = {
  afterVerdictPublished(queryClient: QueryClient, claimId: string, investigationId?: string) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.detail(claimId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(claimId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.all }),
      investigationId ? queryClient.invalidateQueries({ queryKey: queryKeys.investigations.detail(investigationId) }) : Promise.resolve()
    ]);
  },
  afterEvidenceAdded(queryClient: QueryClient, claimId: string, investigationId?: string) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.evidence.byClaim(claimId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.evidence(claimId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.detail(claimId) }),
      investigationId ? queryClient.invalidateQueries({ queryKey: queryKeys.investigations.detail(investigationId) }) : Promise.resolve()
    ]);
  },
  afterAuthChange(queryClient: QueryClient) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.investigations.all })
    ]);
  }
};
