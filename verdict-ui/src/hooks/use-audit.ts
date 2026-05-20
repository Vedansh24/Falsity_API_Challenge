import { queryKeys } from '../lib/query-keys';
import { useApiQuery } from './use-api-query';
import { auditService } from '../services/api/audit.service';
import type { Id } from '../types/common.types';
import type { QueryParams } from '../types/api.types';

export function useAuditQuery(params?: QueryParams) {
  return useApiQuery([...queryKeys.audit.lists(), params ?? {}], () => auditService.list(params), {
    keepPreviousData: true
  });
}

export function useAuditRecordQuery(recordId?: Id) {
  return useApiQuery(queryKeys.audit.detail(String(recordId ?? '')), () => auditService.detail(String(recordId)), {
    enabled: Boolean(recordId)
  });
}
