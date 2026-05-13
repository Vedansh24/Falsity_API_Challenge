/**
 * Notification worker: handles async notification sending.
 * Triggered after workflow events or manual dispatch.
 */

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../../integrations/cache/redis.client';

interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

async function processNotification(job: Job<NotificationJobData>): Promise<void> {
  const { userId, type, title, message } = job.data;

  try {
    console.log(`[NotificationWorker] Sending notification to user ${userId}: ${title}`);

    // TODO: Implement notification delivery (email, webhook, push, etc.)
    // For now, log only.

    console.log(`[NotificationWorker] Notification sent to ${userId}`);
  } catch (err) {
    console.error(`[NotificationWorker] Error for user ${userId}:`, err);
    throw err;
  }
}

/**
 * Initialize notification worker.
 */
export async function initializeNotificationWorker(): Promise<Worker | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('[NotificationWorker] Redis unavailable; worker not started');
      return null;
    }

    const worker = new Worker<NotificationJobData>('notification', processNotification, {
      connection: redis as any,
      concurrency: 10
    });

    try {
      const client = await import('../bullmq.client.js');
      client.registerWorker(worker);
    } catch (e) {
      // ignore
    }

    worker.on('completed', (job) => {
      console.log(`[NotificationWorker] Job completed: ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[NotificationWorker] Job failed: ${job?.id}`, err);
    });

    console.log('[NotificationWorker] Started');
    return worker;
  } catch (err) {
    console.error('[NotificationWorker] Failed to initialize', err);
    return null;
  }
}

export default { initializeNotificationWorker };
