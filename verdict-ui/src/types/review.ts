import type { EntityRecord } from './common.types';
import type { ClaimViewModel } from './claims';

export const VERDICT_WORKSPACE_TYPES = ['TRUE', 'FALSE', 'MIXED', 'UNVERIFIABLE'] as const;
export type VerdictWorkspaceType = (typeof VERDICT_WORKSPACE_TYPES)[number];

export const REVIEW_READINESS_STATES = ['pending', 'ready', 'approved', 'published', 'rejected'] as const;
export type ReviewReadinessState = (typeof REVIEW_READINESS_STATES)[number];

export interface VerdictHistoryEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  type: 'assignment' | 'evidence_update' | 'transition' | 'reviewer_action' | 'readiness' | 'publication' | 'archive';
  metadata?: Record<string, unknown>;
}

export interface VerdictViewModel {
  id: string;
  claimId: string;
  verdictType: VerdictWorkspaceType | string;
  falsityScore: number;
  confidenceScore: number;
  confidenceBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | string;
  reasoning?: string;
  supportScore?: number;
  contradictScore?: number;
  contradictionLevel?: number;
  isApproved?: boolean;
  publishedById?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  claim?: ClaimViewModel;
  history: VerdictHistoryEvent[];
  metadata: Record<string, unknown>;
}

export interface ReviewQueueState {
  search: string;
  status: string;
  reviewer: string;
  verdictReadiness: string;
  confidenceRange: string;
  evidenceStrength: string;
  publicationState: string;
  category: string;
  analyst: string;
  sortBy: 'updatedAt' | 'createdAt' | 'falsityScore' | 'confidenceScore';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function toMetadata(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function buildVerdictTimeline(record: Pick<VerdictViewModel, 'createdAt' | 'publishedAt' | 'isApproved'>): VerdictHistoryEvent[] {
  return [
    {
      id: 'created',
      title: 'Verdict generated',
      description: 'Backend verdict engine produced the moderation draft.',
      date: record.createdAt,
      type: 'transition'
    },
    {
      id: 'ready',
      title: 'Ready for moderation',
      description: 'Verdict can be reviewed for approval or rejection.',
      type: 'readiness'
    },
    {
      id: 'approved',
      title: 'Reviewed status',
      description: record.isApproved ? 'Verdict approved for publication.' : 'Verdict still awaiting moderation.',
      date: record.publishedAt,
      type: record.isApproved ? 'publication' : 'reviewer_action'
    }
  ];
}

export function normalizeVerdict(record: Record<string, unknown> | EntityRecord): VerdictViewModel {
  const source = isRecord(record) ? record : {};
  const createdAt = toStringValue(source.createdAt) || undefined;
  const updatedAt = toStringValue(source.updatedAt) || undefined;
  const publishedAt = toStringValue(source.publishedAt) || undefined;

  return {
    id: toStringValue(source.id, 'unknown-verdict'),
    claimId: toStringValue(source.claimId, ''),
    verdictType: toStringValue(source.verdictType ?? source.verdict, 'UNVERIFIABLE'),
    falsityScore: toNumberValue(source.falsityScore, 0),
    confidenceScore: toNumberValue(source.confidenceScore, 0),
    confidenceBand: toStringValue(source.confidenceBand, 'LOW'),
    reasoning: toStringValue(source.reasoning) || undefined,
    supportScore: toNumberValue(source.supportScore, 0),
    contradictScore: toNumberValue(source.contradictScore, 0),
    contradictionLevel: toNumberValue(source.contradictionLevel, 0),
    isApproved: Boolean(source.isApproved),
    publishedById: toStringValue(source.publishedById) || undefined,
    publishedAt,
    createdAt,
    updatedAt,
    history: buildVerdictTimeline({ createdAt, publishedAt, isApproved: Boolean(source.isApproved) }),
    metadata: toMetadata(source.metadata)
  };
}

export function normalizeVerdicts(records: Array<Record<string, unknown> | EntityRecord>): VerdictViewModel[] {
  return records.map(normalizeVerdict);
}

export function getVerdictSearchableText(verdict: VerdictViewModel): string {
  return [
    verdict.id,
    verdict.claimId,
    verdict.verdictType,
    verdict.reasoning,
    verdict.confidenceBand,
    verdict.publishedById,
    ...Object.values(verdict.metadata)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
