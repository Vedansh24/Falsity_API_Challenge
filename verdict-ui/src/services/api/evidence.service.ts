import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type EvidenceRecord = EntityRecord;

export const evidenceService = {
  list(params?: QueryParams) {
    return requestEnvelope<EvidenceRecord[]>({ method: 'GET', url: '/evidence', params });
  },
  detail(evidenceId: Id) {
    return apiRequest.get<EvidenceRecord>(`/evidence/${evidenceId}`);
  },
  byClaim(claimId: Id, params?: QueryParams) {
    return requestEnvelope<EvidenceRecord[]>({ method: 'GET', url: `/claims/${claimId}/evidence`, params });
  },
  create(payload: EntityRecord) {
    return apiRequest.post<EvidenceRecord, EntityRecord>('/evidence', payload);
  },
  update(evidenceId: Id, payload: EntityRecord) {
    return apiRequest.patch<EvidenceRecord, EntityRecord>(`/evidence/${evidenceId}`, payload);
  },
  remove(evidenceId: Id) {
    return apiRequest.delete<void>(`/evidence/${evidenceId}`);
  }
};
