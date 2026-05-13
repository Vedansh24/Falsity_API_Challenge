"use strict";
/**
 * Queue service: coordinate background job enqueueing.
 * Provides high-level API for controllers/services to dispatch async work.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueSourceFetch = enqueueSourceFetch;
exports.enqueueVerdictRecompute = enqueueVerdictRecompute;
exports.enqueueNotification = enqueueNotification;
exports.enqueueTimelineRefresh = enqueueTimelineRefresh;
exports.enqueueEvidenceRescore = enqueueEvidenceRescore;
const bullmq_client_1 = require("./bullmq.client");
/**
 * Enqueue source fetching for a claim.
 * Called after evidence ingestion request.
 */
async function enqueueSourceFetch(claimId, query, maxPerProvider) {
    await (0, bullmq_client_1.enqueueJob)('source-fetch', {
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
async function enqueueVerdictRecompute(claimId) {
    await (0, bullmq_client_1.enqueueJob)('verdict-recompute', {
        claimId,
        timestamp: new Date().toISOString()
    });
}
/**
 * Enqueue notification sending.
 * Called after workflow events.
 */
async function enqueueNotification(userId, type, title, message) {
    await (0, bullmq_client_1.enqueueJob)('notification', {
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
async function enqueueTimelineRefresh(claimId) {
    await (0, bullmq_client_1.enqueueJob)('timeline-refresh', {
        claimId,
        timestamp: new Date().toISOString()
    });
}
/**
 * Enqueue evidence rescoring.
 * Called for batch updates or periodic maintenance.
 */
async function enqueueEvidenceRescore(claimId) {
    await (0, bullmq_client_1.enqueueJob)('evidence-rescore', {
        claimId,
        timestamp: new Date().toISOString()
    });
}
exports.default = {
    enqueueSourceFetch,
    enqueueVerdictRecompute,
    enqueueNotification,
    enqueueTimelineRefresh,
    enqueueEvidenceRescore
};
