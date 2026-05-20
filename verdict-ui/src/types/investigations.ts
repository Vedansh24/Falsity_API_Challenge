import type { EntityRecord } from './common.types';
import type { ClaimViewModel } from './claims';

// Investigation workflow states based on claim status
export const INVESTIGATION_WORKFLOW_STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'AWAITING_EVIDENCE',
  'READY_FOR_REVIEW',
  'COMPLETED',
  'ARCHIVED'
] as const;

export type InvestigationWorkflowStatus = (typeof INVESTIGATION_WORKFLOW_STATUSES)[number];

// Evidence source types
export const EVIDENCE_SOURCE_TYPES = [
  'GOVERNMENT',
  'NEWS',
  'RESEARCH_PAPER',
  'BLOG',
  'SOCIAL_MEDIA',
  'INTERNAL_REPORT'
] as const;

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

// Evidence stance
export const EVIDENCE_STANCES = ['SUPPORTS', 'CONTRADICTS', 'NEUTRAL'] as const;
export type EvidenceStance = (typeof EVIDENCE_STANCES)[number];

// Confidence bands
export const CONFIDENCE_BANDS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as const;
export type ConfidenceBand = (typeof CONFIDENCE_BANDS)[number];

export interface EvidenceScoring {
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  reviewerConfidence: number;
  qualityScore?: number;
}

export interface EvidenceTimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  type: 'evidence_added' | 'evidence_updated' | 'evidence_removed';
}

export interface EvidenceViewModel {
  id: string;
  claimId: string;
  sourceType: EvidenceSourceType | string;
  sourceUrl: string;
  stance: EvidenceStance | string;
  scoring: EvidenceScoring;
  qualityScore?: number;
  qualityIndicator?: 'low' | 'medium' | 'good' | 'excellent';
  isNovelty: boolean;
  isDuplicate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags: string[];
}

export interface InvestigationTimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  type: 'created' | 'assigned' | 'evidence_added' | 'evidence_requested' | 'status_changed' | 'verdict_ready' | 'published' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface InvestigationViewModel {
  id: string;
  claimId: string;
  claim?: ClaimViewModel;
  status: InvestigationWorkflowStatus;
  assignedAnalystId?: string;
  assignedAnalyst?: string;
  reviewerId?: string;
  reviewer?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  evidenceCount: number;
  verdictReadiness?: number; // 0-100 percentage
  confidenceBand?: ConfidenceBand;
  isPublished?: boolean;
  timeline: InvestigationTimelineEvent[];
  metadata: Record<string, unknown>;
}

export interface InvestigationTableState {
  search: string;
  status: string;
  analyst: string;
  verdictReadiness: string;
  publication: 'all' | 'published' | 'unpublished';
  reviewer: string;
  category: string;
  sortBy: 'assignedAt' | 'createdAt' | 'updatedAt' | 'confidence';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  visibleColumns: Record<string, boolean>;
}

export interface EvidenceTableState {
  search: string;
  sourceType: string;
  stance: string;
  sortBy: 'createdAt' | 'credibility' | 'relevance' | 'freshness';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Helper functions

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

function normalizeSourceType(value: unknown): EvidenceSourceType | string {
  const sourceType = toStringValue(value);
  if (EVIDENCE_SOURCE_TYPES.includes(sourceType as EvidenceSourceType)) {
    return sourceType as EvidenceSourceType;
  }
  return sourceType || 'UNKNOWN';
}

function normalizeStance(value: unknown): EvidenceStance | string {
  const stance = toStringValue(value);
  if (EVIDENCE_STANCES.includes(stance as EvidenceStance)) {
    return stance as EvidenceStance;
  }
  return stance || 'NEUTRAL';
}

function getSourceTypeLabel(sourceType: string): string {
  const labels: Record<string, string> = {
    GOVERNMENT: 'Government Source',
    NEWS: 'News Article',
    RESEARCH_PAPER: 'Research Paper',
    BLOG: 'Blog Post',
    SOCIAL_MEDIA: 'Social Media',
    INTERNAL_REPORT: 'Internal Report'
  };
  return labels[sourceType] || sourceType;
}

function calculateQualityIndicator(scoring: EvidenceScoring): 'low' | 'medium' | 'good' | 'excellent' {
  const average = (scoring.credibilityScore + scoring.relevanceScore + scoring.freshnessScore) / 3;
  const confidence = scoring.reviewerConfidence;
  const combined = (average * 0.7 + confidence * 0.3) * 100;

  if (combined >= 80) return 'excellent';
  if (combined >= 60) return 'good';
  if (combined >= 40) return 'medium';
  return 'low';
}

function buildInvestigationTimeline(investigation: Pick<InvestigationViewModel, 'createdAt' | 'startedAt' | 'completedAt' | 'status'>): InvestigationTimelineEvent[] {
  const timeline: InvestigationTimelineEvent[] = [
    {
      id: 'created',
      title: 'Investigation created',
      description: 'Investigation workspace was established.',
      date: investigation.createdAt,
      type: 'created'
    },
    {
      id: 'assigned',
      title: 'Analyst assigned',
      description: 'Analyst began investigation.',
      date: investigation.startedAt,
      type: 'assigned'
    },
    {
      id: 'in_progress',
      title: 'Investigation in progress',
      description: 'Evidence being gathered and analyzed.',
      type: 'status_changed'
    },
    {
      id: 'verdict_ready',
      title: 'Verdict ready',
      description: 'Investigation complete and ready for reviewer decision.',
      type: 'verdict_ready'
    },
    {
      id: 'completed',
      title: 'Investigation completed',
      description: 'Investigation workflow concluded.',
      date: investigation.completedAt,
      type: 'published'
    }
  ];

  return timeline;
}

export function normalizeEvidence(record: Record<string, unknown> | EntityRecord): EvidenceViewModel {
  const source = isRecord(record) ? record : {};

  const scoring: EvidenceScoring = {
    credibilityScore: toNumberValue(source.credibilityScore, 0.5) || 0.5,
    relevanceScore: toNumberValue(source.relevanceScore, 0.5) || 0.5,
    freshnessScore: toNumberValue(source.freshnessScore, 0.5) || 0.5,
    reviewerConfidence: toNumberValue(source.reviewerConfidence, 0.5) || 0.5
  };

  const qualityScore = (scoring.credibilityScore + scoring.relevanceScore + scoring.freshnessScore) / 3;
  const qualityIndicator = calculateQualityIndicator(scoring);

  return {
    id: toStringValue(source.id, 'unknown-evidence'),
    claimId: toStringValue(source.claimId, ''),
    sourceType: normalizeSourceType(source.sourceType),
    sourceUrl: toStringValue(source.sourceUrl, ''),
    stance: normalizeStance(source.stance),
    scoring,
    qualityScore,
    qualityIndicator,
    isNovelty: Boolean(source.isNovelty),
    isDuplicate: Boolean(source.isDuplicate),
    createdAt: toStringValue(source.createdAt) || undefined,
    updatedAt: toStringValue(source.updatedAt) || undefined,
    tags: toStringArray(source.tags)
  };
}

export function normalizeEvidenceList(records: Array<Record<string, unknown> | EntityRecord>): EvidenceViewModel[] {
  return records.map(normalizeEvidence);
}

export function normalizeInvestigation(record: Record<string, unknown> | EntityRecord): InvestigationViewModel {
  const source = isRecord(record) ? record : {};
  const startedAt = toStringValue(source.startedAt) || undefined;
  const completedAt = toStringValue(source.completedAt) || undefined;
  const createdAt = toStringValue(source.createdAt) || undefined;
  const updatedAt = toStringValue(source.updatedAt) || undefined;

  const status = toStringValue(source.status, 'PENDING').toUpperCase();
  const normalizedStatus = INVESTIGATION_WORKFLOW_STATUSES.includes(status as InvestigationWorkflowStatus)
    ? (status as InvestigationWorkflowStatus)
    : 'PENDING';

  // Calculate verdict readiness (0-100)
  let verdictReadiness = 0;
  if (normalizedStatus === 'IN_PROGRESS') verdictReadiness = 30;
  if (normalizedStatus === 'AWAITING_EVIDENCE') verdictReadiness = 50;
  if (normalizedStatus === 'READY_FOR_REVIEW') verdictReadiness = 85;
  if (normalizedStatus === 'COMPLETED') verdictReadiness = 100;

  return {
    id: toStringValue(source.id, 'unknown-investigation'),
    claimId: toStringValue(source.claimId, ''),
    status: normalizedStatus,
    assignedAnalystId: toStringValue(source.investigatorId || source.assignedAnalystId) || undefined,
    assignedAnalyst: toStringValue(source.investigatorName || source.assignedAnalyst) || undefined,
    reviewerId: toStringValue(source.reviewerId) || undefined,
    reviewer: toStringValue(source.reviewerName) || undefined,
    notes: toStringValue(source.notes) || undefined,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
    evidenceCount: toNumberValue(source.evidenceCount, 0) || 0,
    verdictReadiness,
    confidenceBand: normalizeConfidenceBand(toNumberValue(source.confidenceScore), source.confidenceBand),
    isPublished: Boolean(source.isPublished),
    timeline: buildInvestigationTimeline({
      status: normalizedStatus,
      createdAt,
      startedAt,
      completedAt
    }),
    metadata: toMetadata(source.metadata)
  };
}

function normalizeConfidenceBand(confidenceScore?: number, bandValue?: unknown): ConfidenceBand | undefined {
  // If explicit band is provided, use it
  if (bandValue && CONFIDENCE_BANDS.includes(toStringValue(bandValue) as ConfidenceBand)) {
    return toStringValue(bandValue) as ConfidenceBand;
  }

  // Otherwise derive from score
  if (confidenceScore !== undefined) {
    if (confidenceScore >= 0.75) return 'VERY_HIGH';
    if (confidenceScore >= 0.55) return 'HIGH';
    if (confidenceScore >= 0.35) return 'MEDIUM';
    return 'LOW';
  }

  return undefined;
}

export function normalizeInvestigations(records: Array<Record<string, unknown> | EntityRecord>): InvestigationViewModel[] {
  return records.map(normalizeInvestigation);
}

export function getInvestigationSearchableText(investigation: InvestigationViewModel): string {
  return [
    investigation.id,
    investigation.claimId,
    investigation.assignedAnalyst,
    investigation.reviewer,
    investigation.status,
    investigation.notes,
    ...Object.values(investigation.metadata)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getEvidenceSearchableText(evidence: EvidenceViewModel): string {
  return [evidence.sourceUrl, evidence.sourceType, evidence.stance, ...evidence.tags, getSourceTypeLabel(evidence.sourceType as string)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
