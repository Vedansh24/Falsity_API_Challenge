import { prisma } from '../../../plugins/prisma';
import * as verdictService from '../../verdict/verdict.service';

/**
 * Timeline aggregates audit logs, comments, and verdict history into a chronological feed.
 */
export async function getClaimTimeline(claimId: string, options: { limit?: number; page?: number; type?: string } = {}) {
  const limit = options.limit ?? 50;
  const page = options.page ?? 1;
  const offset = (page - 1) * limit;

  // Fetch audit logs
  const audits = await prisma.auditLog.findMany({
    where: { entityType: 'CLAIM', entityId: claimId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  // Fetch comments
  const comments = await prisma.comment.findMany({
    where: { claimId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  // Fetch verdict history via service (already normalized)
  const verdictHistory = await verdictService.getVerdictHistoryService(claimId, limit);

  // Normalize items into unified shape
  type TimelineItem = {
    id: string;
    type: string;
    performedBy?: { id: string } | null;
    timestamp: Date;
    description?: string;
    metadata?: unknown;
  };

  const items: TimelineItem[] = [];

  for (const a of audits) {
    items.push({
      id: a.id,
      type: a.action,
      performedBy: a.userId ? { id: a.userId } : null,
      timestamp: a.createdAt,
      metadata: a.metadata
    });
  }

  for (const c of comments) {
    items.push({
      id: c.id,
      type: 'COMMENT',
      performedBy: { id: c.userId },
      timestamp: c.createdAt,
      description: c.content,
      metadata: { visibility: (c as any).visibility }
    });
  }

  for (const v of verdictHistory) {
    items.push({
      id: v.id,
      type: 'VERDICT_HISTORY',
      // Verdict history shape can vary depending on Prisma client version; be defensive.
      performedBy: (v as any).publishedById ? { id: (v as any).publishedById } : null,
      timestamp: (v as any).createdAt ?? new Date(),
      description: `${(v as any).verdictType || (v as any).verdict || 'VERDICT'} (${(v as any).falsityScore ?? ''})`,
      metadata: v
    });
  }

  // Sort chronologically desc
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Optional filtering by type
  const filtered = options.type ? items.filter((i) => i.type === options.type) : items;

  // Simple pagination already applied at DB level; return slice up to limit
  return filtered.slice(0, limit);
}
