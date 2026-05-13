"use strict";
/**
 * Verdict recompute worker: handles async verdict recalculation.
 * Triggered when evidence is added/updated/deleted or manually enqueued.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeVerdictWorker = initializeVerdictWorker;
const bullmq_1 = require("bullmq");
const redis_client_1 = require("../../integrations/cache/redis.client");
async function processVerdictRecompute(job) {
    const { claimId } = job.data;
    try {
        // Import verdict service (avoid circular imports at startup)
        // @ts-expect-error - Dynamic import typed at runtime
        const { recomputeVerdictService } = await import('../../modules/verdict/verdict.service');
        console.log(`[VerdictWorker] Recomputing verdict for claim ${claimId}`);
        const result = await recomputeVerdictService(claimId);
        console.log(`[VerdictWorker] Completed for claim ${claimId}:`, result.verdict);
    }
    catch (err) {
        console.error(`[VerdictWorker] Error for claim ${claimId}:`, err);
        throw err;
    }
}
/**
 * Initialize verdict recompute worker.
 * Call during app startup.
 */
async function initializeVerdictWorker() {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            console.warn('[VerdictWorker] Redis unavailable; worker not started');
            return null;
        }
        const worker = new bullmq_1.Worker('verdict-recompute', processVerdictRecompute, {
            connection: redis,
            concurrency: 5
        });
        worker.on('completed', (job) => {
            console.log(`[VerdictWorker] Job completed: ${job.id}`);
        });
        worker.on('failed', (job, err) => {
            console.error(`[VerdictWorker] Job failed: ${job?.id}`, err);
        });
        console.log('[VerdictWorker] Started');
        return worker;
    }
    catch (err) {
        console.error('[VerdictWorker] Failed to initialize', err);
        return null;
    }
}
exports.default = { initializeVerdictWorker };
