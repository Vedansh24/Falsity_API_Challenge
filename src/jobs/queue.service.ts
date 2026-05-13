/**
 * Queue service: coordinate background job enqueueing.
 * Provides high-level API for controllers/services to dispatch async work.
 */

import { enqueueJob } from './bullmq.client';

/**
 * Enqueue source fetching for a claim.
 * Called after evidence ingestion request.
 */
export async function enqueueSourceFetch(claimId: string, query: string, maxPerProvider?: number): Promise<void> {
  await enqueueJob('source-fetch', {
    claimId,
    query,
    maxPerProvider: maxPerProvider ?? 5,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enqueue verdict recomputation.
 * Called after evidence changes.
 */
export async function enqueueVerdictRecompute(claimId: string): Promise<void> {
  await enqueueJob('verdict-recompute', {
    claimId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enqueue notification sending.
 * Called after workflow events.
 */
export async function enqueueNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  await enqueueJob('notification', {
    userId,
    type,
    title,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enqueue timeline refresh.
 * Called after claim/audit changes.
 */
export async function enqueueTimelineRefresh(claimId: string): Promise<void> {
  await enqueueJob('timeline-refresh', {
    claimId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enqueue evidence rescoring.
 * Called for batch updates or periodic maintenance.
 */
export async function enqueueEvidenceRescore(claimId: string): Promise<void> {
  await enqueueJob('evidence-rescore', {
    claimId,
    timestamp: new Date().toISOString()
  });
}

export default {
  enqueueSourceFetch,
  enqueueVerdictRecompute,
  enqueueNotification,
  enqueueTimelineRefresh,
  enqueueEvidenceRescore
};
