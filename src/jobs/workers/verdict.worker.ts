/**
 * Verdict recompute worker: handles async verdict recalculation.
 * Triggered when evidence is added/updated/deleted or manually enqueued.
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../integrations/cache/redis.client';

interface VerdictRecomputeJobData {
  claimId: string;
  timestamp: string;
}

async function processVerdictRecompute(job: Job<VerdictRecomputeJobData>): Promise<void> {
  const { claimId } = job.data;

  try {
    // Import verdict service (avoid circular imports at startup)
    const { recomputeVerdictService } = await import('../../modules/verdict/verdict.service.js');

    console.log(`[VerdictWorker] Recomputing verdict for claim ${claimId}`);

    const result = await recomputeVerdictService(claimId);

    console.log(`[VerdictWorker] Completed for claim ${claimId}:`, result.verdict);
  } catch (err) {
    console.error(`[VerdictWorker] Error for claim ${claimId}:`, err);
    throw err;
  }
}

/**
 * Initialize verdict recompute worker.
 * Call during app startup.
 */
export async function initializeVerdictWorker(): Promise<Worker | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('[VerdictWorker] Redis unavailable; worker not started');
      return null;
    }

    const worker = new Worker<VerdictRecomputeJobData>('verdict-recompute', processVerdictRecompute, {
      connection: redis as any,
      concurrency: 5
    });

    try {
      const client = await import('../bullmq.client.js');
      client.registerWorker(worker);
    } catch (e) {
      // ignore
    }

    worker.on('completed', (job) => {
      console.log(`[VerdictWorker] Job completed: ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[VerdictWorker] Job failed: ${job?.id}`, err);
    });

    console.log('[VerdictWorker] Started');
    return worker;
  } catch (err) {
    console.error('[VerdictWorker] Failed to initialize', err);
    return null;
  }
}

export default { initializeVerdictWorker };
