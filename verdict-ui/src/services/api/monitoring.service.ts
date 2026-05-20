import { apiRequest } from './request';
import type { EntityRecord } from '../../types/common.types';

export type MonitoringMetric = EntityRecord;

export const monitoringService = {
  health() {
    return apiRequest.get<MonitoringMetric>('/monitoring/health');
  },
  metrics() {
    return apiRequest.get<MonitoringMetric[]>('/monitoring/metrics');
  }
};
