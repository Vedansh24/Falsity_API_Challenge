import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type VerdictRecord = EntityRecord;

export const verdictService = {
  list(params?: QueryParams) {
    return requestEnvelope<VerdictRecord[]>({ method: 'GET', url: '/verdicts', params });
  },
  detail(claimId: Id) {
    return apiRequest.get<VerdictRecord>(`/verdicts/${claimId}`);
  },
  history(claimId: Id, params?: QueryParams) {
    return requestEnvelope<VerdictRecord[]>({ method: 'GET', url: `/claims/${claimId}/verdict/history`, params });
  },
  publish(claimId: Id, payload?: EntityRecord) {
    return apiRequest.post<VerdictRecord, EntityRecord | undefined>(`/verdicts/${claimId}/publish`, payload);
  },
  recompute(claimId: Id) {
    return apiRequest.post<VerdictRecord>(`/verdicts/${claimId}/recompute`);
  },
  approve(verdictId: Id) {
    return apiRequest.post<VerdictRecord>(`/verdicts/${verdictId}/approve`);
  },
  reject(verdictId: Id) {
    return apiRequest.post<VerdictRecord>(`/verdicts/${verdictId}/reject`);
  }
};
