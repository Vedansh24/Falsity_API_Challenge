import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type ClaimRecord = EntityRecord;

export const claimsService = {
  list(params?: QueryParams) {
    return requestEnvelope<ClaimRecord[]>({ method: 'GET', url: '/claims', params });
  },
  detail(claimId: Id) {
    return apiRequest.get<ClaimRecord>(`/claims/${claimId}`);
  },
  create(payload: EntityRecord) {
    return apiRequest.post<ClaimRecord, EntityRecord>('/claims', payload);
  },
  update(claimId: Id, payload: EntityRecord) {
    return apiRequest.patch<ClaimRecord, EntityRecord>(`/claims/${claimId}`, payload);
  },
  remove(claimId: Id) {
    return apiRequest.delete<void>(`/claims/${claimId}`);
  },
  evidence(claimId: Id, params?: QueryParams) {
    return requestEnvelope<EntityRecord[]>({ method: 'GET', url: `/claims/${claimId}/evidence`, params });
  }
};
