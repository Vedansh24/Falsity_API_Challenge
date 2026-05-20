'use client';

import { useState } from 'react';
import type { Role } from '../../config/roles';
import Button from '../ui/button';
import Input from '../ui/input';
import BulkActionBar from './bulk-action-bar';
import { claimsService } from '../../services/api/claims.service';
import { verdictService } from '../../services/api/verdict.service';
import { queryClient } from '../../lib/query-client';
import { queryKeys } from '../../lib/query-keys';
import { useNotificationStore } from '../../stores/realtime.store';

type AnalystOption = { value: string; label: string };

type Props = {
  role: Role | null;
  selectedIds: string[];
  analystOptions: AnalystOption[];
  onClearSelection: () => void;
  onComplete: () => void;
};

export default function ClaimBulkActionBar({ role, selectedIds, analystOptions, onClearSelection, onComplete }: Props) {
  const [busy, setBusy] = useState(false);
  const [assignTo, setAssignTo] = useState(analystOptions[0]?.value ?? '');

  const notify = useNotificationStore.getState().addNotification;

  const runSequential = async (tasks: Array<() => Promise<unknown>>) => {
    const results = await Promise.allSettled(tasks.map((t) => t()));
    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = results.length - failed;
    return { succeeded, failed };
  };

  const invalidateClaims = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
  };

  const onBulkAnalyst = async () => {
    if (!assignTo) {
      notify({ type: 'warning', title: 'Assign analyst', message: 'Pick an analyst first.', level: 'warning' });
      return;
    }
    setBusy(true);
    const { succeeded, failed } = await runSequential(
      selectedIds.map(
        (id) => () => claimsService.update(id, { assignedAnalystId: assignTo } as Record<string, unknown>)
      )
    );
    await invalidateClaims();
    setBusy(false);
    notify({
      type: 'bulk',
      title: 'Bulk assign complete',
      message: `${succeeded} succeeded, ${failed} failed`,
      level: failed ? 'warning' : 'success'
    });
    onClearSelection();
    onComplete();
  };

  const onBulkFlagEvidence = async () => {
    setBusy(true);
    const { succeeded, failed } = await runSequential(
      selectedIds.map((id) => () => claimsService.update(id, { status: 'NEEDS_MORE_EVIDENCE' } as Record<string, unknown>))
    );
    await invalidateClaims();
    setBusy(false);
    notify({
      type: 'bulk',
      title: 'Bulk flag complete',
      message: `${succeeded} succeeded, ${failed} failed`,
      level: failed ? 'warning' : 'success'
    });
    onClearSelection();
    onComplete();
  };

  const onBulkPublish = async () => {
    if (!window.confirm(`Publish verdict for ${selectedIds.length} claim(s)?`)) {
      return;
    }
    setBusy(true);
    const { succeeded, failed } = await runSequential(
      selectedIds.map((id) => () => verdictService.publish(id, undefined))
    );
    await queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.all });
    await invalidateClaims();
    setBusy(false);
    notify({
      type: 'bulk',
      title: 'Bulk publish complete',
      message: `${succeeded} succeeded, ${failed} failed`,
      level: failed ? 'warning' : 'success'
    });
    onClearSelection();
    onComplete();
  };

  const onBulkArchive = async () => {
    setBusy(true);
    const { succeeded, failed } = await runSequential(
      selectedIds.map((id) => () => claimsService.update(id, { status: 'ARCHIVED' } as Record<string, unknown>))
    );
    await invalidateClaims();
    setBusy(false);
    notify({
      type: 'bulk',
      title: 'Bulk archive complete',
      message: `${succeeded} succeeded, ${failed} failed`,
      level: failed ? 'warning' : 'success'
    });
    onClearSelection();
    onComplete();
  };

  const actions = () => {
    if (role === 'ANALYST') {
      return (
        <>
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            Analyst
            <select
              className="rounded border border-neutral-300 px-2 py-1 text-sm"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            >
              {analystOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" disabled={busy} onClick={() => void onBulkAnalyst()}>
            Assign
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => void onBulkFlagEvidence()}>
            Flag needs evidence
          </Button>
        </>
      );
    }
    if (role === 'REVIEWER') {
      return (
        <Button type="button" disabled={busy} onClick={() => void onBulkPublish()}>
          Publish verdicts
        </Button>
      );
    }
    if (role === 'ADMIN') {
      return (
        <>
          <Button type="button" variant="outline" disabled={busy} onClick={() => void onBulkArchive()}>
            Archive
          </Button>
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            Set status (bulk)
            <Input
              className="h-8 w-40 text-xs"
              placeholder="UNDER_REVIEW"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const v = (e.target as HTMLInputElement).value.trim();
                if (!v) return;
                void (async () => {
                  setBusy(true);
                  const { succeeded, failed } = await runSequential(
                    selectedIds.map((id) => () => claimsService.update(id, { status: v } as Record<string, unknown>))
                  );
                  await invalidateClaims();
                  setBusy(false);
                  notify({
                    type: 'bulk',
                    title: 'Bulk status',
                    message: `${succeeded} succeeded, ${failed} failed`,
                    level: failed ? 'warning' : 'success'
                  });
                  onClearSelection();
                  onComplete();
                })();
              }}
            />
          </label>
        </>
      );
    }
    return null;
  };

  return (
    <BulkActionBar selectedCount={selectedIds.length} onClear={onClearSelection}>
      {busy ? <span className="text-sm text-neutral-600">Working…</span> : actions()}
    </BulkActionBar>
  );
}
