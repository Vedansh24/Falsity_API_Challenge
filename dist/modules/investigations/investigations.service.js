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
exports.assignAnalystService = assignAnalystService;
exports.requestMoreEvidenceService = requestMoreEvidenceService;
exports.readyForVerdictService = readyForVerdictService;
exports.publishVerdictService = publishVerdictService;
exports.archiveClaimService = archiveClaimService;
const app_error_1 = require("../../common/errors/app-error");
const state_machine_1 = require("../../common/workflow/state-machine");
const claims_repository_1 = require("../claims/claims.repository");
const investigations_repository_1 = require("./investigations.repository");
const investigations_policy_service_1 = require("./investigations-policy.service");
const prisma_1 = require("../../plugins/prisma");
const audit = __importStar(require("../audit/services/audit-log.service"));
/**
 * Assign an analyst to investigate a claim.
 * Claim transitions from SUBMITTED → UNDER_REVIEW.
 */
async function assignAnalystService(claimId, analystId, requester) {
    // Get the claim
    const claim = await (0, claims_repository_1.findById)(claimId);
    if (!claim) {
        throw new app_error_1.AppError(404, 'Claim not found', 'NOT_FOUND');
    }
    // Validate policy
    (0, investigations_policy_service_1.validateAnalystAssignment)(claim, requester);
    // Verify analyst exists and is an analyst
    const analyst = await prisma_1.prisma.user.findUnique({
        where: { id: analystId }
    });
    if (!analyst) {
        throw new app_error_1.AppError(404, 'Analyst not found', 'NOT_FOUND');
    }
    if (analyst.role !== 'ANALYST' && analyst.role !== 'REVIEWER' && analyst.role !== 'ADMIN') {
        throw new app_error_1.AppError(400, 'User is not an analyst, reviewer, or admin', 'INVALID_ANALYST');
    }
    // Check for existing active investigation
    const existingInvestigation = await (0, investigations_repository_1.findInvestigationByClaim)(claimId);
    if (existingInvestigation && !existingInvestigation.completedAt) {
        throw new app_error_1.AppError(409, 'An active investigation already exists for this claim', 'INVESTIGATION_EXISTS');
    }
    // Validate transition
    (0, state_machine_1.assertTransition)(claim.status, 'UNDER_REVIEW');
    // Update claim status and analyst via Prisma directly to handle all fields
    const updated = (await prisma_1.prisma.claim.update({
        where: { id: claimId },
        data: {
            status: 'UNDER_REVIEW',
            currentAnalystId: analystId
        }
    }));
    // Create or update investigation
    if (existingInvestigation) {
        await (0, investigations_repository_1.updateInvestigation)(existingInvestigation.id, {
            investigatorId: analystId,
            startedAt: new Date()
        });
    }
    else {
        await (0, investigations_repository_1.createInvestigation)({
            claimId,
            investigatorId: analystId,
            status: 'ACTIVE',
            startedAt: new Date()
        });
    }
    // Audit analyst assignment
    await audit.log({
        action: 'ANALYST_ASSIGNED',
        entityType: 'CLAIM',
        entityId: claimId,
        performedById: requester.userId,
        metadata: { analystId }
    });
    return updated;
}
/**
 * Request more evidence for a claim.
 * Claim transitions from UNDER_REVIEW → NEEDS_MORE_EVIDENCE.
 */
async function requestMoreEvidenceService(claimId, notes, requester) {
    // Get the claim
    const claim = await (0, claims_repository_1.findById)(claimId);
    if (!claim) {
        throw new app_error_1.AppError(404, 'Claim not found', 'NOT_FOUND');
    }
    // Validate policy
    (0, investigations_policy_service_1.validateRequestMoreEvidence)(claim, requester);
    // Validate transition
    (0, state_machine_1.assertTransition)(claim.status, 'NEEDS_MORE_EVIDENCE');
    // Update claim
    const updated = await (0, claims_repository_1.updateClaim)(claimId, {
        status: 'NEEDS_MORE_EVIDENCE'
    });
    // Update investigation notes if provided
    const investigation = await (0, investigations_repository_1.findInvestigationByClaim)(claimId);
    if (investigation && notes) {
        await (0, investigations_repository_1.updateInvestigation)(investigation.id, {
            notes
        });
    }
    return updated;
}
/**
 * Mark claim as ready for verdict.
 * Claim transitions from UNDER_REVIEW → READY_FOR_VERDICT.
 */
async function readyForVerdictService(claimId, requester) {
    // Get the claim
    const claim = await (0, claims_repository_1.findById)(claimId);
    if (!claim) {
        throw new app_error_1.AppError(404, 'Claim not found', 'NOT_FOUND');
    }
    // Validate policy
    (0, investigations_policy_service_1.validateReadyForVerdict)(claim, requester);
    // Validate transition
    (0, state_machine_1.assertTransition)(claim.status, 'READY_FOR_VERDICT');
    // Update claim
    const updated = await (0, claims_repository_1.updateClaim)(claimId, {
        status: 'READY_FOR_VERDICT'
    });
    return updated;
}
/**
 * Publish a verdict for a claim.
 * Claim transitions from READY_FOR_VERDICT → PUBLISHED.
 * Creates/updates Verdict record.
 */
async function publishVerdictService(claimId, data, requester) {
    // Get the claim
    const claim = await (0, claims_repository_1.findById)(claimId);
    if (!claim) {
        throw new app_error_1.AppError(404, 'Claim not found', 'NOT_FOUND');
    }
    // Validate policy
    (0, investigations_policy_service_1.validatePublishVerdict)(claim, requester);
    // Validate transition
    (0, state_machine_1.assertTransition)(claim.status, 'PUBLISHED');
    // Create or update verdict
    const existingVerdict = await prisma_1.prisma.verdict.findFirst({
        where: { claimId }
    });
    const verdictData = {
        verdict: data.verdict,
        falsityScore: data.falsityScore ?? undefined,
        confidenceScore: data.confidenceScore ?? undefined,
        reasoning: data.reasoning ?? undefined,
        publishedById: requester.userId,
        publishedAt: new Date()
    };
    if (existingVerdict) {
        await prisma_1.prisma.verdict.update({
            where: { id: existingVerdict.id },
            data: verdictData
        });
    }
    else {
        await prisma_1.prisma.verdict.create({
            data: {
                claimId,
                ...verdictData
            }
        });
    }
    // Update claim with workflow fields via Prisma directly
    const updated = (await prisma_1.prisma.claim.update({
        where: { id: claimId },
        data: {
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    }));
    // Mark investigation as completed
    const investigation = await (0, investigations_repository_1.findInvestigationByClaim)(claimId);
    if (investigation) {
        await (0, investigations_repository_1.updateInvestigation)(investigation.id, {
            status: 'COMPLETED',
            completedAt: new Date()
        });
    }
    // Audit publish
    await audit.log({
        action: 'VERDICT_PUBLISHED',
        entityType: 'CLAIM',
        entityId: claimId,
        performedById: requester.userId,
        metadata: { verdict: data.verdict }
    });
    return updated;
}
/**
 * Archive a published claim.
 * Claim transitions from PUBLISHED → ARCHIVED (or other valid terminal states).
 */
async function archiveClaimService(claimId, requester) {
    // Get the claim
    const claim = await (0, claims_repository_1.findById)(claimId);
    if (!claim) {
        throw new app_error_1.AppError(404, 'Claim not found', 'NOT_FOUND');
    }
    // Validate policy
    (0, investigations_policy_service_1.validateArchive)(claim, requester);
    // Update claim with workflow fields via Prisma directly
    const updated = (await prisma_1.prisma.claim.update({
        where: { id: claimId },
        data: {
            status: 'ARCHIVED',
            archivedAt: new Date()
        }
    }));
    await audit.log({
        action: 'CLAIM_ARCHIVED',
        entityType: 'CLAIM',
        entityId: claimId,
        performedById: requester.userId,
        metadata: {}
    });
    return updated;
}
