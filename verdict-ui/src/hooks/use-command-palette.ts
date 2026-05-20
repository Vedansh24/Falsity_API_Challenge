'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from './use-role';
import { useClaimsQuery } from './use-claims';
import { useInvestigationsQuery } from './use-investigations';
import { normalizeClaims } from '../types/claims';
import { normalizeInvestigations } from '../types/investigations';
import { useUiStore } from '../stores/ui.store';
import type { QueryParams } from '../types/api.types';
import type { Role } from '../config/roles';

export type CommandPaletteResult =
  | { kind: 'nav'; id: string; label: string; href: string }
  | { kind: 'claim'; id: string; label: string; href: string; subtitle?: string }
  | { kind: 'investigation'; id: string; label: string; href: string; subtitle?: string }
  | { kind: 'action'; id: string; label: string; href?: string; onSelect?: () => void };

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return text.toLowerCase().includes(q);
}

function navActions(role: Role | null): CommandPaletteResult[] {
  const base: CommandPaletteResult[] = [
    { kind: 'nav', id: 'nav-dashboard', label: 'Go to Dashboard', href: '/dashboard' },
    { kind: 'nav', id: 'nav-claims', label: 'Go to Claims', href: '/dashboard/claims' },
    { kind: 'nav', id: 'nav-investigations', label: 'Go to Investigations', href: '/dashboard/investigations' }
  ];
  if (role === 'REVIEWER' || role === 'ADMIN') {
    base.push({ kind: 'nav', id: 'nav-review', label: 'Go to Review queue', href: '/dashboard/review' });
  }
  if (role === 'ADMIN') {
    base.push({ kind: 'nav', id: 'nav-admin', label: 'Go to Admin', href: '/dashboard/admin' });
  }
  return base;
}

function workflowActions(role: Role | null, router: ReturnType<typeof useRouter>): CommandPaletteResult[] {
  const actions: CommandPaletteResult[] = [];
  if (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN') {
    actions.push({
      kind: 'action',
      id: 'wf-assign-queue',
      label: 'Assign investigation (open queue)',
      onSelect: () => router.push('/dashboard/investigations')
    });
  }
  if (role === 'ANALYST') {
    actions.push({
      kind: 'action',
      id: 'wf-mark-ready-hint',
      label: 'Mark Ready for Verdict (open investigation)',
      onSelect: () => router.push('/dashboard/investigations')
    });
  }
  if (role === 'REVIEWER' || role === 'ADMIN') {
    actions.push({
      kind: 'action',
      id: 'wf-publish-queue',
      label: 'Publish / review verdicts',
      onSelect: () => router.push('/dashboard/review')
    });
  }
  return actions;
}

export function useCommandPaletteIndex(open: boolean, debouncedQuery: string) {
  const role = useRole();
  const router = useRouter();
  const recentItems = useUiStore((s) => s.recentItems);

  const claimsQuery = useClaimsQuery({ page: 1, pageSize: 100 } as unknown as QueryParams, {
    enabled: open,
    staleTime: 30_000
  });
  const investigationsQuery = useInvestigationsQuery({ page: 1, pageSize: 100 } as unknown as QueryParams, {
    enabled: open,
    staleTime: 30_000
  });

  const claims = useMemo(() => {
    const payload = (claimsQuery.data as { data?: { items?: unknown[] } } | undefined)?.data;
    return normalizeClaims((payload?.items ?? []) as Array<Record<string, unknown>>);
  }, [claimsQuery.data]);

  const investigations = useMemo(() => {
    const payload = (investigationsQuery.data as { data?: { items?: unknown[] } } | undefined)?.data;
    return normalizeInvestigations((payload?.items ?? []) as Array<Record<string, unknown>>);
  }, [investigationsQuery.data]);

  return useMemo(() => {
    const q = debouncedQuery;
    const filteredClaims = claims.filter((c) => {
      if (role === 'USER') {
        if (c.status !== 'PUBLISHED' && !c.publishedAt) {
          return false;
        }
      }
      const text = `${c.title} ${c.statement} ${c.status} ${c.id}`;
      return fuzzyMatch(q, text);
    });

    const filteredInvestigations = investigations.filter((inv) => {
      const text = `${inv.id} ${inv.claimId} ${inv.status} ${inv.assignedAnalyst ?? ''}`;
      return fuzzyMatch(q, text);
    });

    const nav = navActions(role).filter((n) => fuzzyMatch(q, n.label));
    const actions = workflowActions(role, router).filter((a) => fuzzyMatch(q, a.label));

    const claimResults: CommandPaletteResult[] = filteredClaims.map((c) => ({
      kind: 'claim' as const,
      id: `claim-${c.id}`,
      label: c.title,
      href: `/dashboard/claims/${c.publicSlug ?? c.id}`,
      subtitle: c.status
    }));

    const invResults: CommandPaletteResult[] = filteredInvestigations.map((inv) => ({
      kind: 'investigation' as const,
      id: `inv-${inv.id}`,
      label: `Investigation ${inv.id}`,
      href: `/dashboard/investigations/${inv.id}`,
      subtitle: inv.status
    }));

    const recent: CommandPaletteResult[] = recentItems
      .filter((r) => fuzzyMatch(q, r.label))
      .map((r) => ({
        kind: 'nav' as const,
        id: `recent-${r.id}`,
        label: `Recent: ${r.label}`,
        href: r.href
      }));

    return {
      groups: [
        { title: 'Actions', items: actions },
        { title: 'Navigation', items: [...nav, ...recent] },
        { title: 'Claims', items: claimResults },
        { title: 'Investigations', items: invResults }
      ].filter((g) => g.items.length > 0),
      isLoading: claimsQuery.isFetching || investigationsQuery.isFetching
    };
  }, [
    claims,
    claimsQuery.isFetching,
    debouncedQuery,
    investigations,
    investigationsQuery.isFetching,
    recentItems,
    role,
    router
  ]);
}

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setDebounced(value), ms);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [value, ms]);

  return debounced;
}
