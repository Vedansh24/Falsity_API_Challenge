"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '../../../../components/shared/page-header';
import ClaimsTable from '../../../../components/claims/claims-table';
import AdvancedFilterPanel from '../../../../components/operational/advanced-filter-panel';
import { useClaimsQuery } from '../../../../hooks/use-claims';
import { useRole } from '../../../../hooks/use-role';
import type { ClaimTableState } from '../../../../types/claims';
import type { QueryParams } from '../../../../types/api.types';
import { normalizeClaims } from '../../../../types/claims';
import { claimTableStateToParams, paramsToClaimTablePatch } from '../../../../lib/claim-table-url';
import { useUiStore } from '../../../../stores/ui.store';
import type { SavedFilterView } from '../../../../stores/ui.store';

const DEFAULT_VISIBLE_COLUMNS = {
  title: true,
  status: true,
  verdict: true,
  category: true,
  analyst: true,
  confidence: true,
  publishedAt: true,
  updatedAt: false,
  actions: true
};

const TABLE_ID = 'claims-queue';

const DEFAULT_STATE: ClaimTableState = {
  search: '',
  status: '',
  verdict: '',
  category: '',
  analyst: '',
  publication: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
  visibleColumns: DEFAULT_VISIBLE_COLUMNS
};

function ClaimsPageInner() {
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipUrlWrite = useRef(true);

  const [state, setState] = useState<ClaimTableState>(DEFAULT_STATE);

  const savedFilterViews = useUiStore((s) => s.savedFilterViews);
  const addSavedFilterView = useUiStore((s) => s.addSavedFilterView);
  const removeSavedFilterView = useUiStore((s) => s.removeSavedFilterView);
  const setLastTableFilters = useUiStore((s) => s.setLastTableFilters);

  useEffect(() => {
    const patch = paramsToClaimTablePatch(searchParams, DEFAULT_STATE);
    skipUrlWrite.current = true;
    setState((s) => ({ ...s, ...patch }));
  }, [searchParams]);

  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    const q = claimTableStateToParams(state).toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [state, pathname, router]);

  const queryParams = useMemo(
    () => ({
      page: state.page,
      pageSize: state.pageSize,
      status: state.status || undefined,
      search: state.search || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      filters: {
        verdict: state.verdict || undefined,
        category: state.category || undefined,
        analyst: state.analyst || undefined,
        publication: state.publication === 'all' ? undefined : state.publication
      }
    }),
    [state]
  );

  const claimsQuery = useClaimsQuery(queryParams as unknown as QueryParams, {
    staleTime: 30_000,
    refetchOnWindowFocus: true
  });
  const payload = (claimsQuery.data as { data?: { items?: unknown[]; totalPages?: number; total?: number } } | undefined)?.data;
  const claims = normalizeClaims((payload?.items ?? []) as Array<Record<string, unknown>>);
  const totalPages = payload?.totalPages ?? 1;
  const totalItems = payload?.total ?? 0;

  const analystOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of claims) {
      if (c.currentAnalystId) {
        map.set(c.currentAnalystId, c.assignedAnalyst ?? c.currentAnalystId);
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [claims]);

  const categories = useMemo(
    () => Array.from(new Set(claims.map((c) => c.category).filter((x): x is string => Boolean(x)))),
    [claims]
  );
  const analysts = useMemo(
    () =>
      Array.from(
        new Set(claims.map((c) => c.assignedAnalyst ?? c.currentAnalystId ?? '').filter((x): x is string => Boolean(x)))
      ),
    [claims]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (state.search.trim()) n += 1;
    if (state.status) n += 1;
    if (state.verdict) n += 1;
    if (state.category) n += 1;
    if (state.analyst) n += 1;
    if (state.publication !== 'all') n += 1;
    return n;
  }, [state]);

  const onStateChange = (next: Partial<ClaimTableState>) => {
    setState((current) => {
      const merged = { ...current, ...next };
      setLastTableFilters(TABLE_ID, Object.fromEntries(claimTableStateToParams(merged).entries()));
      return merged;
    });
  };

  const onLoadView = (view: SavedFilterView) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(view.query)) {
      sp.set(k, String(v));
    }
    const patch = paramsToClaimTablePatch(sp, DEFAULT_STATE);
    setState((s) => ({ ...s, ...patch, visibleColumns: s.visibleColumns }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims queue"
        subtitle="Operational claim management with workflow-aware scanning, filtering, and queue actions."
      />

      <AdvancedFilterPanel
        state={state}
        onChange={onStateChange}
        categories={categories}
        analysts={analysts}
        savedViews={savedFilterViews}
        onSaveView={(name) => addSavedFilterView(name, Object.fromEntries(claimTableStateToParams(state).entries()))}
        onLoadView={onLoadView}
        onRemoveView={removeSavedFilterView}
        filterButtonLabel={activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
      />

      <ClaimsTable
        claims={claims}
        loading={claimsQuery.isLoading}
        error={claimsQuery.isError ? 'Unable to load claims.' : null}
        state={state}
        totalPages={totalPages}
        totalItems={totalItems}
        onStateChange={onStateChange}
        role={role}
        onRefresh={() => void claimsQuery.refetch()}
        showBulkBar
        analystOptions={analystOptions}
        showBasicFilters={false}
        onBulkComplete={() => void claimsQuery.refetch()}
      />
    </div>
  );
}

export default function DashboardClaimsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-neutral-600">Loading claims…</div>}>
      <ClaimsPageInner />
    </Suspense>
  );
}
