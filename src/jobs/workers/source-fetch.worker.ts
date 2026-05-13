/**
 * Source fetch worker: handles background source ingestion.
 * Triggered when user requests external source ingestion for a claim.
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../integrations/cache/redis.client';

interface SourceFetchJobData {
  claimId: string;
  query: string;
  maxPerProvider: number;
  timestamp: string;
}

async function processSourceFetch(job: Job<SourceFetchJobData>): Promise<void> {
  const { claimId, query, maxPerProvider } = job.data;

  try {
    // Import the ingestion service (avoid circular imports at startup)
    const { ingestSourcesForClaim } = await import('../../integrations/source-ingestion.service.js');

    console.log(`[SourceFetchWorker] Processing ingest for claim ${claimId} with query: ${query}`);

    // Execute ingestion (returns to queue completion, not to HTTP client)
    const result = await ingestSourcesForClaim({ claimId, query, maxPerProvider });

    console.log(`[SourceFetchWorker] Completed for claim ${claimId}:`, result);
  } catch (err) {
    console.error(`[SourceFetchWorker] Error for claim ${claimId}:`, err);
    throw err; // BullMQ will retry on throw
  }
}

/**
 * Initialize source fetch worker.
 * Call during app startup.
 */
export async function initializeSourceFetchWorker(): Promise<Worker | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('[SourceFetchWorker] Redis unavailable; worker not started');
      return null;
    }

    const worker = new Worker<SourceFetchJobData>('source-fetch', processSourceFetch, {
      connection: redis as any,
      concurrency: 2
    });

    // register worker for graceful shutdown
    try {
      // dynamic import to avoid cycles
      const client = await import('../bullmq.client.js');
      client.registerWorker(worker);
    } catch (e) {
      // ignore
    }

    worker.on('completed', (job) => {
      console.log(`[SourceFetchWorker] Job completed: ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[SourceFetchWorker] Job failed: ${job?.id}`, err);
    });

    console.log('[SourceFetchWorker] Started');
    return worker;
  } catch (err) {
    console.error('[SourceFetchWorker] Failed to initialize', err);
    return null;
  }
}

export default { initializeSourceFetchWorker };
