/**
 * BullMQ queue client and initialization.
 * Manages background job processing for Phase 8.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from '../integrations/cache/redis.client';

export type JobType = 'source-fetch' | 'verdict-recompute' | 'notification' | 'timeline-refresh' | 'evidence-rescore';

interface QueueConfig {
  defaultJobOptions?: object;
  settings?: object;
}

const QUEUE_CONFIG: QueueConfig = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
};

// Queues registry
const queues = new Map<JobType, Queue>();

// Workers registry for graceful shutdown
const workers: Set<any> = new Set();

export function registerWorker(w: any) {
  if (w) workers.add(w);
}

export async function closeWorkers(): Promise<void> {
  try {
    for (const w of Array.from(workers)) {
      try {
        await w.close();
      } catch (err) {
        console.error('Failed to close worker', err);
      }
    }
    workers.clear();
  } catch (err) {
    console.error('Error closing workers', err);
  }
}

/**
 * Initialize all job queues.
 * Call this during app startup.
 */
export async function initializeQueues(): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('Redis not available; BullMQ queues disabled');
      return;
    }

    const jobTypes: JobType[] = ['source-fetch', 'verdict-recompute', 'notification', 'timeline-refresh', 'evidence-rescore'];

    for (const jobType of jobTypes) {
      const queue = new Queue(jobType, {
        connection: redis as any,
        ...QUEUE_CONFIG
      });

      queues.set(jobType, queue);
      console.log(`Queue initialized: ${jobType}`);
    }
  } catch (err) {
    console.error('Failed to initialize queues', err);
    // Non-fatal: app continues without queues
  }
}

/**
 * Get or create a queue by type.
 */
export function getQueue(jobType: JobType): Queue | null {
  const queue = queues.get(jobType);
  if (!queue) {
    console.warn(`Queue not found: ${jobType}`);
    return null;
  }
  return queue;
}

/**
 * Enqueue a job (safe: returns null if queues unavailable).
 */
export async function enqueueJob(jobType: JobType, data: any, opts?: any): Promise<string | null> {
  try {
    const queue = getQueue(jobType);
    if (!queue) {
      console.warn(`Cannot enqueue job; queue unavailable: ${jobType}`);
      return null;
    }

    const job = await queue.add(jobType, data, opts);
    return job.id || null;
  } catch (err) {
    console.error(`Failed to enqueue job: ${jobType}`, err);
    return null;
  }
}

/**
 * Close all queues (call during app shutdown).
 */
export async function closeQueues(): Promise<void> {
  try {
    for (const queue of queues.values()) {
      await queue.close();
    }
    queues.clear();
  } catch (err) {
    console.error('Failed to close queues', err);
  }
}

export { workers };

export default { initializeQueues, getQueue, enqueueJob, closeQueues };
