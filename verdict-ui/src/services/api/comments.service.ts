import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type CommentRecord = EntityRecord;

export const commentsService = {
  list(params?: QueryParams) {
    return requestEnvelope<CommentRecord[]>({ method: 'GET', url: '/comments', params });
  },
  byClaim(claimId: Id, params?: QueryParams) {
    return requestEnvelope<CommentRecord[]>({ method: 'GET', url: `/claims/${claimId}/comments`, params });
  },
  create(claimId: Id, payload: EntityRecord) {
    return apiRequest.post<CommentRecord, EntityRecord>(`/claims/${claimId}/comments`, payload);
  },
  remove(commentId: Id) {
    return apiRequest.delete<void>(`/comments/${commentId}`);
  }
};
