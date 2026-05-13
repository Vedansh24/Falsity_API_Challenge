import { prisma } from '../../../plugins/prisma';

export type AuditAction =
  | 'CLAIM_CREATED'
  | 'CLAIM_SUBMITTED'
  | 'ANALYST_ASSIGNED'
  | 'EVIDENCE_ADDED'
  | 'EVIDENCE_UPDATED'
  | 'EVIDENCE_DELETED'
  | 'VERDICT_RECOMPUTED'
  | 'VERDICT_PUBLISHED'
  | 'WORKFLOW_STATE_CHANGED'
  | 'ROLE_CHANGED'
  | 'COMMENT_ADDED'
  | 'CLAIM_ARCHIVED';

interface CreateAuditInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  performedById?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Centralized audit logging service.
 * All modules should call `log` to record important events.
 * Failures are safe: errors are caught so audit failures won't crash workflows.
 */
export async function log(input: CreateAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.performedById ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        // Prisma JSON typing is strict; cast to any to avoid type incompatibilities at compile time.
        metadata: input.metadata as any
      }
    });
  } catch (err) {
    // Non-fatal: audit failures must not interrupt business logic.
    // Log to console for visibility in server logs.
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log', { err, input });
  }
}

export default { log };
