"use strict";
/**
 * BullMQ queue client and initialization.
 * Manages background job processing for Phase 8.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeQueues = initializeQueues;
exports.getQueue = getQueue;
exports.enqueueJob = enqueueJob;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
const redis_client_1 = require("../integrations/cache/redis.client");
const QUEUE_CONFIG = {
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
const queues = new Map();
/**
 * Initialize all job queues.
 * Call this during app startup.
 */
async function initializeQueues() {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            console.warn('Redis not available; BullMQ queues disabled');
            return;
        }
        const jobTypes = ['source-fetch', 'verdict-recompute', 'notification', 'timeline-refresh', 'evidence-rescore'];
        for (const jobType of jobTypes) {
            const queue = new bullmq_1.Queue(jobType, {
                connection: redis,
                ...QUEUE_CONFIG
            });
            queues.set(jobType, queue);
            console.log(`Queue initialized: ${jobType}`);
        }
    }
    catch (err) {
        console.error('Failed to initialize queues', err);
        // Non-fatal: app continues without queues
    }
}
/**
 * Get or create a queue by type.
 */
function getQueue(jobType) {
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
async function enqueueJob(jobType, data, opts) {
    try {
        const queue = getQueue(jobType);
        if (!queue) {
            console.warn(`Cannot enqueue job; queue unavailable: ${jobType}`);
            return null;
        }
        const job = await queue.add(jobType, data, opts);
        return job.id || null;
    }
    catch (err) {
        console.error(`Failed to enqueue job: ${jobType}`, err);
        return null;
    }
}
/**
 * Close all queues (call during app shutdown).
 */
async function closeQueues() {
    try {
        for (const queue of queues.values()) {
            await queue.close();
        }
        queues.clear();
    }
    catch (err) {
        console.error('Failed to close queues', err);
    }
}
exports.default = { initializeQueues, getQueue, enqueueJob, closeQueues };
