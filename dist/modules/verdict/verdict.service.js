"use strict";
/**
 * VERDICT SERVICE
 *
 * Orchestrates verdict computation, persistence, and history tracking.
 * Uses the advanced verdict engine from Phase 5.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAndPersistVerdict = computeAndPersistVerdict;
exports.getVerdictService = getVerdictService;
exports.recomputeVerdictService = recomputeVerdictService;
exports.getVerdictHistoryService = getVerdictHistoryService;
exports.approveVerdictService = approveVerdictService;
exports.rejectVerdictService = rejectVerdictService;
exports.getVerdictStatsService = getVerdictStatsService;
const advanced_verdict_engine_1 = require("./advanced-verdict.engine");
const evidence_repository_1 = require("../evidence/evidence.repository");
const repository = __importStar(require("./verdict.repository"));
const audit = __importStar(require("../audit/services/audit-log.service"));
/**
 * Compute and persist verdict for a claim.
 * Automatically creates history entry if verdict changes.
 */
async function computeAndPersistVerdict(claimId) {
    // Fetch all evidence for the claim
    const evidences = await (0, evidence_repository_1.findByClaimId)(claimId);
    // Format evidence for the engine
    const formattedEvidence = evidences.map((e) => ({
        stance: e.stance,
        credibilityScore: e.credibilityScore,
        relevanceScore: e.relevanceScore,
        freshnessScore: e.freshnessScore,
        reviewerConfidence: e.reviewerConfidence,
        sourceType: e.sourceType
    }));
    // Compute advanced verdict
    const verdict = (0, advanced_verdict_engine_1.computeAdvancedVerdict)(formattedEvidence);
    // Persist to database (creates history entry if updating)
    const { evidenceCount, ...persistData } = verdict;
    await repository.upsertVerdict(claimId, persistData);
    return verdict;
}
/**
 * Get current verdict for a claim.
 * Returns persisted verdict without recomputation.
 */
async function getVerdictService(claimId) {
    const verdict = await repository.getVerdictByClaimId(claimId);
    if (!verdict) {
        // If no verdict exists, compute and persist it
        return computeAndPersistVerdict(claimId);
    }
    return {
        verdict: verdict.verdictType || verdict.verdict,
        verdictType: verdict.verdictType || verdict.verdict,
        falsityScore: verdict.falsityScore ?? 0,
        confidenceScore: verdict.confidenceScore ?? 0,
        confidenceBand: verdict.confidenceBand ?? verdict.confidence ?? 'LOW',
        supportScore: verdict.supportScore || 0,
        contradictScore: verdict.contradictScore || 0,
        contradictionLevel: verdict.contradictionLevel || 0,
        reasoning: verdict.reasoning || '',
        evidenceCount: 0 // Will be computed when fetching evidence
    };
}
/**
 * Recompute verdict for a claim.
 * Called when evidence is added/modified/deleted.
 */
async function recomputeVerdictService(claimId) {
    const result = await computeAndPersistVerdict(claimId);
    // Audit
    try {
        await audit.log({
            action: 'VERDICT_RECOMPUTED',
            entityType: 'CLAIM',
            entityId: claimId,
            performedById: null,
            metadata: { resultType: result.verdict }
        });
    }
    catch (e) {
        // ignore audit failures
    }
    return result;
}
/**
 * Get verdict history for a claim.
 */
async function getVerdictHistoryService(claimId, limit = 50) {
    return repository.getClaimVerdictHistory(claimId, limit);
}
/**
 * Approve a verdict (moderation workflow).
 */
async function approveVerdictService(verdictId, reviewerId) {
    return repository.approveVerdict(verdictId, reviewerId);
}
/**
 * Reject a verdict (moderation workflow).
 */
async function rejectVerdictService(verdictId) {
    return repository.rejectVerdict(verdictId);
}
/**
 * Get statistics about verdicts.
 */
async function getVerdictStatsService() {
    const approved = await repository.getApprovedVerdicts(1000);
    const pending = await repository.getPendingVerdicts(1000);
    const stats = {
        totalApproved: approved.length,
        totalPending: pending.length,
        byType: {
            TRUE: 0,
            MISLEADING: 0,
            PARTLY_FALSE: 0,
            FALSE: 0,
            SEVERELY_FALSE: 0,
            UNVERIFIABLE: 0
        },
        byConfidenceBand: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            VERY_HIGH: 0
        },
        averageFalsityScore: 0
    };
    let totalFalsityScore = 0;
    for (const verdict of approved) {
        stats.byType[verdict.verdictType]++;
        stats.byConfidenceBand[verdict.confidenceBand]++;
        totalFalsityScore += verdict.falsityScore;
    }
    if (approved.length > 0) {
        stats.averageFalsityScore = totalFalsityScore / approved.length;
    }
    return stats;
}
