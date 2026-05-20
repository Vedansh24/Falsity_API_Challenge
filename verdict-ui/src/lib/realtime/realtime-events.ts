/**
 * Realtime Event Types & Schemas
 * Defines all operational events that flow through the realtime system
 */

export enum RealtimeEventType {
  // Claim events
  CLAIM_CREATED = 'claim:created',
  CLAIM_UPDATED = 'claim:updated',
  CLAIM_ASSIGNED = 'claim:assigned',
  CLAIM_STATUS_CHANGED = 'claim:status_changed',
  CLAIM_ARCHIVED = 'claim:archived',

  // Evidence events
  EVIDENCE_ADDED = 'evidence:added',
  EVIDENCE_UPDATED = 'evidence:updated',
  EVIDENCE_SCORED = 'evidence:scored',

  // Investigation events
  INVESTIGATION_STARTED = 'investigation:started',
  INVESTIGATION_UPDATED = 'investigation:updated',
  INVESTIGATION_COMPLETED = 'investigation:completed',

  // Verdict events
  VERDICT_COMPUTED = 'verdict:computed',
  VERDICT_READY = 'verdict:ready',
  VERDICT_APPROVED = 'verdict:approved',
  VERDICT_REJECTED = 'verdict:rejected',
  VERDICT_PUBLISHED = 'verdict:published',
  VERDICT_RECOMPUTED = 'verdict:recomputed',

  // Moderation events
  MODERATION_STARTED = 'moderation:started',
  MODERATION_COMMENT_ADDED = 'moderation:comment_added',
  MODERATION_ACTION_TAKEN = 'moderation:action_taken',

  // System events
  SYSTEM_HEALTH_CHECK = 'system:health_check',
  CONNECTION_ESTABLISHED = 'connection:established',
  CONNECTION_LOST = 'connection:lost',
  CONNECTION_RECONNECTED = 'connection:reconnected'
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  timestamp: number;
  userId: string;
  userRole: string;
  payload: Record<string, any>;
  claimId?: string;
  investigationId?: string;
  verdictId?: string;
}

// Claim event payloads
export interface ClaimCreatedPayload {
  id: string;
  statement: string;
  source: string;
  createdBy: string;
}

export interface ClaimAssignedPayload {
  claimId: string;
  assignedTo: string;
  assignedBy: string;
  role: string;
}

export interface ClaimStatusChangedPayload {
  claimId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}

// Evidence event payloads
export interface EvidenceAddedPayload {
  claimId: string;
  evidenceId: string;
  type: string;
  source: string;
  addedBy: string;
}

export interface EvidenceScoredPayload {
  claimId: string;
  evidenceId: string;
  credibility: number;
  relevance: number;
  stance: string;
}

// Verdict event payloads
export interface VerdictComputedPayload {
  claimId: string;
  verdictType: string;
  falsityScore: number;
  confidenceScore: number;
  confidenceBand: string;
}

export interface VerdictPublishedPayload {
  claimId: string;
  verdictId: string;
  publishedBy: string;
  verdictType: string;
}

export interface VerdictApprovedPayload {
  claimId: string;
  verdictId: string;
  approvedBy: string;
  timestamp: number;
}

// Moderation event payloads
export interface ModerationActionPayload {
  claimId: string;
  verdictId: string;
  action: string;
  actionBy: string;
  timestamp: number;
}

// Event category groupings for filtering
export const EVENT_CATEGORIES = {
  CLAIMS: [
    RealtimeEventType.CLAIM_CREATED,
    RealtimeEventType.CLAIM_UPDATED,
    RealtimeEventType.CLAIM_ASSIGNED,
    RealtimeEventType.CLAIM_STATUS_CHANGED,
    RealtimeEventType.CLAIM_ARCHIVED
  ],
  EVIDENCE: [
    RealtimeEventType.EVIDENCE_ADDED,
    RealtimeEventType.EVIDENCE_UPDATED,
    RealtimeEventType.EVIDENCE_SCORED
  ],
  INVESTIGATIONS: [
    RealtimeEventType.INVESTIGATION_STARTED,
    RealtimeEventType.INVESTIGATION_UPDATED,
    RealtimeEventType.INVESTIGATION_COMPLETED
  ],
  VERDICTS: [
    RealtimeEventType.VERDICT_COMPUTED,
    RealtimeEventType.VERDICT_READY,
    RealtimeEventType.VERDICT_APPROVED,
    RealtimeEventType.VERDICT_REJECTED,
    RealtimeEventType.VERDICT_PUBLISHED,
    RealtimeEventType.VERDICT_RECOMPUTED
  ],
  MODERATION: [
    RealtimeEventType.MODERATION_STARTED,
    RealtimeEventType.MODERATION_COMMENT_ADDED,
    RealtimeEventType.MODERATION_ACTION_TAKEN
  ],
  SYSTEM: [
    RealtimeEventType.SYSTEM_HEALTH_CHECK,
    RealtimeEventType.CONNECTION_ESTABLISHED,
    RealtimeEventType.CONNECTION_LOST,
    RealtimeEventType.CONNECTION_RECONNECTED
  ]
} as const;

// Event role permissions (determines who sees what)
export const EVENT_ROLE_FILTERS: Record<string, RealtimeEventType[]> = {
  USER: [
    RealtimeEventType.VERDICT_PUBLISHED,
    RealtimeEventType.CLAIM_CREATED
  ],
  ANALYST: [
    RealtimeEventType.CLAIM_CREATED,
    RealtimeEventType.CLAIM_ASSIGNED,
    RealtimeEventType.CLAIM_STATUS_CHANGED,
    RealtimeEventType.EVIDENCE_ADDED,
    RealtimeEventType.EVIDENCE_UPDATED,
    RealtimeEventType.INVESTIGATION_STARTED,
    RealtimeEventType.INVESTIGATION_UPDATED,
    RealtimeEventType.VERDICT_READY,
    RealtimeEventType.VERDICT_PUBLISHED
  ],
  REVIEWER: [
    RealtimeEventType.CLAIM_CREATED,
    RealtimeEventType.CLAIM_ASSIGNED,
    RealtimeEventType.CLAIM_STATUS_CHANGED,
    RealtimeEventType.EVIDENCE_ADDED,
    RealtimeEventType.EVIDENCE_SCORED,
    RealtimeEventType.INVESTIGATION_STARTED,
    RealtimeEventType.INVESTIGATION_UPDATED,
    RealtimeEventType.VERDICT_COMPUTED,
    RealtimeEventType.VERDICT_READY,
    RealtimeEventType.VERDICT_APPROVED,
    RealtimeEventType.VERDICT_REJECTED,
    RealtimeEventType.VERDICT_PUBLISHED,
    RealtimeEventType.MODERATION_STARTED,
    RealtimeEventType.MODERATION_COMMENT_ADDED,
    RealtimeEventType.MODERATION_ACTION_TAKEN
  ],
  ADMIN: Object.values(RealtimeEventType)
};
