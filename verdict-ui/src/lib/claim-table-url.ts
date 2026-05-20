import type { ClaimTableState } from '../types/claims';

const KEYS: (keyof ClaimTableState)[] = [
  'search',
  'status',
  'verdict',
  'category',
  'analyst',
  'publication',
  'sortBy',
  'sortOrder',
  'page',
  'pageSize'
];

export function claimTableStateToParams(state: ClaimTableState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.search) p.set('search', state.search);
  if (state.status) p.set('status', state.status);
  if (state.verdict) p.set('verdict', state.verdict);
  if (state.category) p.set('category', state.category);
  if (state.analyst) p.set('analyst', state.analyst);
  if (state.publication && state.publication !== 'all') p.set('publication', state.publication);
  p.set('sortBy', state.sortBy);
  p.set('sortOrder', state.sortOrder);
  p.set('page', String(state.page));
  p.set('pageSize', String(state.pageSize));
  return p;
}

export function paramsToClaimTablePatch(params: URLSearchParams, _base: ClaimTableState): Partial<ClaimTableState> {
  const patch: Partial<ClaimTableState> = {};
  for (const key of KEYS) {
    const raw = params.get(key);
    if (raw === null) continue;
    if (key === 'page' || key === 'pageSize') {
      const n = Number.parseInt(raw, 10);
      if (!Number.isNaN(n)) {
        (patch as Record<string, unknown>)[key] = n;
      }
    } else if (key === 'publication') {
      if (raw === 'all' || raw === 'published' || raw === 'unpublished' || raw === 'archived') {
        patch.publication = raw;
      }
    } else if (key === 'sortOrder') {
      if (raw === 'asc' || raw === 'desc') patch.sortOrder = raw;
    } else if (key === 'sortBy') {
      patch.sortBy = raw as ClaimTableState['sortBy'];
    } else {
      (patch as Record<string, unknown>)[key] = raw;
    }
  }
  return patch;
}
