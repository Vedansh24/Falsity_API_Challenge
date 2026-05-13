"use strict";
/**
 * Source fetch worker: handles background source ingestion.
 * Triggered when user requests external source ingestion for a claim.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSourceFetchWorker = initializeSourceFetchWorker;
const bullmq_1 = require("bullmq");
const redis_client_1 = require("../../integrations/cache/redis.client");
async function processSourceFetch(job) {
    const { claimId, query, maxPerProvider } = job.data;
    try {
        // Import the ingestion service (avoid circular imports at startup)
        // @ts-expect-error - Dynamic import typed at runtime
        const { ingestSourcesForClaim } = await import('../../integrations/source-ingestion.service');
        console.log(`[SourceFetchWorker] Processing ingest for claim ${claimId} with query: ${query}`);
        // Execute ingestion (returns to queue completion, not to HTTP client)
        const result = await ingestSourcesForClaim({ claimId, query, maxPerProvider });
        console.log(`[SourceFetchWorker] Completed for claim ${claimId}:`, result);
    }
    catch (err) {
        console.error(`[SourceFetchWorker] Error for claim ${claimId}:`, err);
        throw err; // BullMQ will retry on throw
    }
}
/**
 * Initialize source fetch worker.
 * Call during app startup.
 */
async function initializeSourceFetchWorker() {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            console.warn('[SourceFetchWorker] Redis unavailable; worker not started');
            return null;
        }
        const worker = new bullmq_1.Worker('source-fetch', processSourceFetch, {
            connection: redis,
            concurrency: 2
        });
        worker.on('completed', (job) => {
            console.log(`[SourceFetchWorker] Job completed: ${job.id}`);
        });
        worker.on('failed', (job, err) => {
            console.error(`[SourceFetchWorker] Job failed: ${job?.id}`, err);
        });
        console.log('[SourceFetchWorker] Started');
        return worker;
    }
    catch (err) {
        console.error('[SourceFetchWorker] Failed to initialize', err);
        return null;
    }
}
exports.default = { initializeSourceFetchWorker };
