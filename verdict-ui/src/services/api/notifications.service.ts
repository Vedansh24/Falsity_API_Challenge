import { apiRequest, requestEnvelope } from './request';
import type { EntityRecord, Id } from '../../types/common.types';
import type { QueryParams } from '../../types/api.types';

export type NotificationRecord = EntityRecord;

export const notificationsService = {
  list(params?: QueryParams) {
    return requestEnvelope<NotificationRecord[]>({ method: 'GET', url: '/notifications', params });
  },
  markRead(notificationId: Id) {
    return apiRequest.post<NotificationRecord>(`/notifications/${notificationId}/read`);
  },
  markAllRead() {
    return apiRequest.post<void>('/notifications/read-all');
  }
};
