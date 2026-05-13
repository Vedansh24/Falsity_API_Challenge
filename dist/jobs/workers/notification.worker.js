"use strict";
/**
 * Notification worker: handles async notification sending.
 * Triggered after workflow events or manual dispatch.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeNotificationWorker = initializeNotificationWorker;
const bullmq_1 = require("bullmq");
const redis_client_1 = require("../../integrations/cache/redis.client");
async function processNotification(job) {
    const { userId, type, title, message } = job.data;
    try {
        console.log(`[NotificationWorker] Sending notification to user ${userId}: ${title}`);
        // TODO: Implement notification delivery (email, webhook, push, etc.)
        // For now, log only.
        console.log(`[NotificationWorker] Notification sent to ${userId}`);
    }
    catch (err) {
        console.error(`[NotificationWorker] Error for user ${userId}:`, err);
        throw err;
    }
}
/**
 * Initialize notification worker.
 */
async function initializeNotificationWorker() {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            console.warn('[NotificationWorker] Redis unavailable; worker not started');
            return null;
        }
        const worker = new bullmq_1.Worker('notification', processNotification, {
            connection: redis,
            concurrency: 10
        });
        worker.on('completed', (job) => {
            console.log(`[NotificationWorker] Job completed: ${job.id}`);
        });
        worker.on('failed', (job, err) => {
            console.error(`[NotificationWorker] Job failed: ${job?.id}`, err);
        });
        console.log('[NotificationWorker] Started');
        return worker;
    }
    catch (err) {
        console.error('[NotificationWorker] Failed to initialize', err);
        return null;
    }
}
exports.default = { initializeNotificationWorker };
