import type { EntityRecord } from './common.types';

export const CLAIM_WORKFLOW_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_MORE_EVIDENCE',
  'READY_FOR_VERDICT',
  'PUBLISHED',
  'ARCHIVED'
] as const;

export type ClaimWorkflowStatus = (typeof CLAIM_WORKFLOW_STATUSES)[number];

export const CLAIM_VERDICTS = [
  'TRUE',
  'MISLEADING',
  'PARTLY_FALSE',
  'FALSE',
  'SEVERELY_FALSE',
  'UNVERIFIABLE'
] as const;

export type ClaimVerdictType = (typeof CLAIM_VERDICTS)[number];

export const CLAIM_TABLE_SORT_FIELDS = ['updatedAt', 'createdAt', 'publishedAt', 'confidence', 'title'] as const;
export type ClaimTableSortField = (typeof CLAIM_TABLE_SORT_FIELDS)[number];

export type ClaimTablePublicationFilter = 'all' | 'published' | 'unpublished' | 'archived';

export interface ClaimTimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  status?: ClaimWorkflowStatus;
  completed?: boolean;
}

export interface ClaimViewModel {
  id: string;
  title: string;
  statement: string;
  status: ClaimWorkflowStatus;
  verdict?: ClaimVerdictType | string;
  confidence?: number;
  category?: string;
  publicSlug?: string;
  sourceUrl?: string;
  submittedAt?: string;
  publishedAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  currentAnalystId?: string;
  currentReviewerId?: string;
  evidenceCount?: number;
  assignedAnalyst?: string;
  assignedReviewer?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  timeline: ClaimTimelineEvent[];
}

export interface ClaimTableState {
  search: string;
  status: string;
  verdict: string;
  category: string;
  analyst: string;
  publication: ClaimTablePublicationFilter;
  sortBy: ClaimTableSortField;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  visibleColumns: Record<string, boolean>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function toNumberValue(value: unknown, fallback?: number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toMetadata(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }

  return {};
}

function normalizeStatus(value: unknown): ClaimWorkflowStatus {
  return CLAIM_WORKFLOW_STATUSES.includes(toStringValue(value) as ClaimWorkflowStatus)
    ? (toStringValue(value) as ClaimWorkflowStatus)
    : 'DRAFT';
}

function normalizeVerdict(value: unknown): ClaimVerdictType | string | undefined {
  const verdict = toStringValue(value);
  return verdict ? verdict : undefined;
}

function formatDateLabel(value?: string): string {
  return value ? new Date(value).toLocaleDateString() : 'Unknown date';
}

export function buildClaimTimeline(claim: Pick<ClaimViewModel, 'createdAt' | 'submittedAt' | 'publishedAt' | 'archivedAt' | 'status'>): ClaimTimelineEvent[] {
  const timeline: ClaimTimelineEvent[] = [
    {
      id: 'created',
      title: 'Claim created',
      description: 'Claim entered the operational queue.',
      date: claim.createdAt,
      status: 'DRAFT',
      completed: true
    },
    {
      id: 'submitted',
      title: 'Submitted',
      description: 'Claim is ready for operational review.',
      date: claim.submittedAt,
      status: 'SUBMITTED',
      completed: Boolean(claim.submittedAt)
    },
    {
      id: 'review',
      title: 'Under review',
      description: 'Analysts can inspect claim context and metadata.',
      status: 'UNDER_REVIEW',
      completed: ['UNDER_REVIEW', 'NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT', 'PUBLISHED', 'ARCHIVED'].includes(claim.status)
    },
    {
      id: 'evidence',
      title: 'Evidence checkpoint',
      description: 'Additional evidence may be requested before verdict readiness.',
      status: 'NEEDS_MORE_EVIDENCE',
      completed: ['NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT', 'PUBLISHED', 'ARCHIVED'].includes(claim.status)
    },
    {
      id: 'verdict',
      title: 'Verdict ready',
      description: 'Claim is prepared for publication when the workflow advances.',
      status: 'READY_FOR_VERDICT',
      completed: ['READY_FOR_VERDICT', 'PUBLISHED', 'ARCHIVED'].includes(claim.status)
    },
    {
      id: 'published',
      title: 'Published',
      description: 'Operational output is visible publicly.',
      date: claim.publishedAt,
      status: 'PUBLISHED',
      completed: Boolean(claim.publishedAt)
    },
    {
      id: 'archived',
      title: 'Archived',
      description: 'Closed claim lifecycle.',
      date: claim.archivedAt,
      status: 'ARCHIVED',
      completed: Boolean(claim.archivedAt)
    }
  ];

  return timeline.map((event) => ({
    ...event,
    description: event.date ? `${event.description} Updated ${formatDateLabel(event.date)}.` : event.description
  }));
}

export function normalizeClaim(record: Record<string, unknown> | EntityRecord): ClaimViewModel {
  const source = isRecord(record) ? record : {};
  const submittedAt = toStringValue(source.submittedAt) || undefined;
  const publishedAt = toStringValue(source.publishedAt) || undefined;
  const archivedAt = toStringValue(source.archivedAt) || undefined;
  const createdAt = toStringValue(source.createdAt) || undefined;
  const updatedAt = toStringValue(source.updatedAt) || undefined;

  return {
    id: toStringValue(source.id, 'unknown-id'),
    title: toStringValue(source.title, 'Untitled claim'),
    statement: toStringValue(source.statement, toStringValue(source.title, '')),
    status: normalizeStatus(source.status),
    verdict: normalizeVerdict(source.verdictType ?? source.verdict),
    confidence: toNumberValue(source.confidenceScore ?? source.confidence ?? source.reviewerConfidence ?? source.reviewConfidence),
    category: toStringValue(source.category) || undefined,
    publicSlug: toStringValue(source.publicSlug) || undefined,
    sourceUrl: toStringValue(source.sourceUrl) || undefined,
    submittedAt,
    publishedAt,
    archivedAt,
    createdAt,
    updatedAt,
    currentAnalystId: toStringValue(source.currentAnalystId) || undefined,
    currentReviewerId: toStringValue(source.currentReviewerId) || undefined,
    evidenceCount: toNumberValue(
      source.evidenceCount ??
        (Array.isArray(source.evidences) ? source.evidences.length : undefined) ??
        (Array.isArray(source.evidence) ? source.evidence.length : undefined)
    ),
    assignedAnalyst: toStringValue(source.currentAnalystName ?? source.currentAnalystId) || undefined,
    assignedReviewer: toStringValue(source.currentReviewerName ?? source.currentReviewerId) || undefined,
    tags: toStringArray(source.tags),
    metadata: toMetadata(source.metadata),
    timeline: buildClaimTimeline({
      status: normalizeStatus(source.status),
      createdAt,
      submittedAt,
      publishedAt,
      archivedAt
    })
  };
}

export function normalizeClaims(records: Array<Record<string, unknown> | EntityRecord>): ClaimViewModel[] {
  return records.map((record) => normalizeClaim(record));
}

export function getClaimSearchableText(claim: ClaimViewModel): string {
  return [claim.title, claim.statement, claim.category, claim.status, claim.verdict, claim.assignedAnalyst, claim.assignedReviewer, ...claim.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
