import { queryKeys } from '../lib/query-keys';
import { useApiMutation } from './use-api-mutation';
import { useApiQuery } from './use-api-query';
import { notificationsService } from '../services/api/notifications.service';
import type { QueryParams } from '../types/api.types';
import type { Id } from '../types/common.types';

export function useNotificationsQuery(params?: QueryParams) {
  return useApiQuery([...queryKeys.notifications.lists(), params ?? {}], () => notificationsService.list(params), {
    keepPreviousData: true
  });
}

export function useMarkNotificationReadMutation(notificationId: Id) {
  return useApiMutation(() => notificationsService.markRead(notificationId), {
    invalidate: [queryKeys.notifications.all]
  });
}

export function useMarkAllNotificationsReadMutation() {
  return useApiMutation(() => notificationsService.markAllRead(), {
    invalidate: [queryKeys.notifications.all]
  });
}
