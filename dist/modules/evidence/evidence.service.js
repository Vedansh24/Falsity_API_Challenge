"use strict";
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
exports.addEvidence = addEvidence;
exports.getEvidenceForClaim = getEvidenceForClaim;
exports.getEvidenceById = getEvidenceById;
exports.updateEvidenceService = updateEvidenceService;
exports.deleteEvidenceService = deleteEvidenceService;
const app_error_1 = require("../../common/errors/app-error");
const repository = __importStar(require("./evidence.repository"));
const evidence_duplicate_service_1 = require("./services/evidence-duplicate.service");
const evidence_scoring_service_1 = require("./services/evidence-scoring.service");
const audit = __importStar(require("../audit/services/audit-log.service"));
/**
 * Create a new evidence record for a claim.
 * Validates duplicates and calculates quality score.
 */
async function addEvidence(claimId, data, requester) {
    // Check for duplicates
    await (0, evidence_duplicate_service_1.assertNoDuplicate)(claimId, data.sourceUrl);
    // Calculate quality score for internal use (not persisted in DB schema)
    const qualityScore = (0, evidence_scoring_service_1.calculateQualityScore)({
        sourceType: data.sourceType,
        credibilityScore: data.credibilityScore,
        relevanceScore: data.relevanceScore,
        freshnessScore: data.freshnessScore,
        reviewerConfidence: data.reviewerConfidence,
        isDuplicate: false
    });
    // Merge claimId into the data (DB schema doesn't include qualityScore)
    const evidenceData = {
        claimId,
        ...data
    };
    // Delegate to repository
    const created = await repository.createEvidence(evidenceData);
    // Audit
    await audit.log({
        action: 'EVIDENCE_ADDED',
        entityType: 'EVIDENCE',
        entityId: created.id,
        performedById: requester?.userId ?? null,
        metadata: { claimId, sourceUrl: created.sourceUrl, qualityScore: qualityScore.score }
    });
    return created;
}
/**
 * Retrieve all evidence records for a specific claim.
 */
async function getEvidenceForClaim(claimId) {
    return repository.findByClaimId(claimId);
}
/**
 * Get a single evidence record by ID.
 */
async function getEvidenceById(id) {
    const evidence = await repository.findById(id);
    if (!evidence) {
        throw new app_error_1.AppError(404, 'Evidence not found', 'NOT_FOUND');
    }
    return evidence;
}
/**
 * Update an evidence record.
 */
async function updateEvidenceService(id, data, requester) {
    // Verify evidence exists
    const existing = await getEvidenceById(id);
    // Recalculate quality score if any scoring fields changed
    let updatedData = { ...data };
    if (data.credibilityScore !== undefined ||
        data.relevanceScore !== undefined ||
        data.freshnessScore !== undefined ||
        data.reviewerConfidence !== undefined) {
        const qualityScore = (0, evidence_scoring_service_1.calculateQualityScore)({
            sourceType: (data.sourceType || existing.sourceType),
            credibilityScore: data.credibilityScore ?? existing.credibilityScore,
            relevanceScore: data.relevanceScore ?? existing.relevanceScore,
            freshnessScore: data.freshnessScore ?? existing.freshnessScore,
            reviewerConfidence: data.reviewerConfidence ?? existing.reviewerConfidence,
            isDuplicate: false
        });
        updatedData = { ...updatedData, qualityScore: qualityScore.score };
    }
    return repository.updateEvidence(id, updatedData);
}
/**
 * Delete an evidence record.
 */
async function deleteEvidenceService(id, requester) {
    // Verify evidence exists first
    await getEvidenceById(id);
    const deleted = await repository.deleteEvidence(id);
    if (!deleted) {
        throw new app_error_1.AppError(500, 'Failed to delete evidence', 'DELETE_FAILED');
    }
    await audit.log({
        action: 'EVIDENCE_DELETED',
        entityType: 'EVIDENCE',
        entityId: id,
        performedById: requester?.userId ?? null,
        metadata: { claimId: id }
    });
}
