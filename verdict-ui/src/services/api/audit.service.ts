import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type AuditRecord = EntityRecord;

export const auditService = {
  list(params?: QueryParams) {
    return requestEnvelope<AuditRecord[]>({ method: 'GET', url: '/audit', params });
  },
  detail(recordId: Id) {
    return apiRequest.get<AuditRecord>(`/audit/${recordId}`);
  }
};
