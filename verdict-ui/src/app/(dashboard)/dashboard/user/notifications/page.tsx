"use client";

import Link from 'next/link';
import PageHeader from '../../../../../components/shared/page-header';
import Card from '../../../../../components/ui/card';
import Button from '../../../../../components/ui/button';
import { useNotificationsQuery, useMarkAllNotificationsReadMutation } from '../../../../../hooks/use-notifications';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

export default function UserNotificationsPage() {
  const notificationsQuery = useNotificationsQuery({ page: 1, pageSize: 100 } as any);
  const markAllRead = useMarkAllNotificationsReadMutation();

  const payload = asRecord((notificationsQuery.data as any)?.data);
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray((notificationsQuery.data as any)?.data)
      ? (notificationsQuery.data as any).data
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay informed about claim progress, review updates, and verdict publication events."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-neutral-600">{items.length} notifications</div>
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate(undefined)}
            disabled={markAllRead.isLoading}
          >
            {markAllRead.isLoading ? 'Updating…' : 'Mark all as read'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          {notificationsQuery.isLoading && <div className="text-sm text-neutral-600">Loading notifications…</div>}
          {!notificationsQuery.isLoading && items.length === 0 && <div className="text-sm text-neutral-600">You're all caught up.</div>}

          {!notificationsQuery.isLoading && items.map((item: any, index: number) => {
            const record = asRecord(item);
            const title = toStringValue(record.title || record.type || 'Update');
            const message = toStringValue(record.message || record.description || 'Operational update available.');
            const createdAt = toStringValue(record.createdAt);
            const claimId = toStringValue(record.claimId || asRecord(record.metadata).claimId);

            return (
              <div key={toStringValue(record.id) || String(index)} className="rounded-lg border border-neutral-200 p-3">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-sm text-neutral-600 mt-1">{message}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-neutral-500">{createdAt ? new Date(createdAt).toLocaleString() : 'Recent'}</div>
                  {claimId && (
                    <Link href={`/dashboard/user/claims/${claimId}`} className="text-xs underline">
                      View claim
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
