import { queryKeys } from '../lib/query-keys';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { commentsService } from '../services/api/comments.service';
import type { EntityRecord, Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';

export function useCommentsQuery(params?: QueryParams) {
  return useApiQuery([...queryKeys.comments.lists(), params ?? {}], () => commentsService.list(params), {
    keepPreviousData: true
  });
}

export function useClaimCommentsQuery(claimId?: Id, params?: QueryParams) {
  return useApiQuery([...queryKeys.comments.byClaim(String(claimId ?? '')), params ?? {}], () => commentsService.byClaim(String(claimId), params), {
    enabled: Boolean(claimId),
    keepPreviousData: true
  });
}

export function useCreateCommentMutation(claimId?: Id) {
  return useApiMutation((payload: EntityRecord) => commentsService.create(String(claimId), payload), {
    invalidate: [queryKeys.comments.all, queryKeys.comments.byClaim(String(claimId ?? '')), queryKeys.claims.detail(String(claimId ?? ''))]
  });
}

export function useDeleteCommentMutation(commentId: Id, claimId?: Id) {
  return useApiMutation(() => commentsService.remove(commentId), {
    invalidate: [queryKeys.comments.all, queryKeys.comments.byClaim(String(claimId ?? ''))]
  });
}
