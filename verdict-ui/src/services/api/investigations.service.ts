import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type InvestigationRecord = EntityRecord;

export const investigationsService = {
  list(params?: QueryParams) {
    return requestEnvelope<InvestigationRecord[]>({ method: 'GET', url: '/investigations', params });
  },
  detail(investigationId: Id) {
    return apiRequest.get<InvestigationRecord>(`/investigations/${investigationId}`);
  },
  create(payload: EntityRecord) {
    return apiRequest.post<InvestigationRecord, EntityRecord>('/investigations', payload);
  },
  update(investigationId: Id, payload: EntityRecord) {
    return apiRequest.patch<InvestigationRecord, EntityRecord>(`/investigations/${investigationId}`, payload);
  },
  remove(investigationId: Id) {
    return apiRequest.delete<void>(`/investigations/${investigationId}`);
  }
};
