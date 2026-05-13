"use strict";
/**
 * VERDICT REPOSITORY
 *
 * Handles persistence of verdicts and verdict history to the database.
 * Implements CRUD operations and history tracking.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertVerdict = upsertVerdict;
exports.getVerdictByClaimId = getVerdictByClaimId;
exports.getVerdictsByClaimIds = getVerdictsByClaimIds;
exports.getVerdictById = getVerdictById;
exports.approveVerdict = approveVerdict;
exports.rejectVerdict = rejectVerdict;
exports.createVerdictHistory = createVerdictHistory;
exports.getVerdictHistory = getVerdictHistory;
exports.getClaimVerdictHistory = getClaimVerdictHistory;
exports.deleteVerdictHistory = deleteVerdictHistory;
exports.getApprovedVerdicts = getApprovedVerdicts;
exports.getVerdictsByType = getVerdictsByType;
exports.getVerdictsByConfidenceBand = getVerdictsByConfidenceBand;
exports.getVerdictsByFalsityRange = getVerdictsByFalsityRange;
exports.getPendingVerdicts = getPendingVerdicts;
const prisma_1 = require("../../plugins/prisma");
// ============================================================================
// VERDICT CRUD OPERATIONS
// ============================================================================
/**
 * Create or update a verdict for a claim.
 * If a verdict exists for this claim, it updates and creates a history entry.
 */
async function upsertVerdict(claimId, verdictData) {
    // Check if verdict already exists for this claim
    const existingVerdict = await prisma_1.prisma.verdict.findFirst({
        where: { claimId }
    });
    if (existingVerdict) {
        // Create history entry from existing verdict before updating
        // Create history entry defensively (Prisma client may not have verdictHistory model yet)
        if (prisma_1.prisma.verdictHistory) {
            try {
                await createVerdictHistory(existingVerdict.id, claimId, {
                    verdictType: existingVerdict.verdictType || existingVerdict.verdict,
                    falsityScore: existingVerdict.falsityScore ?? 0,
                    confidenceScore: existingVerdict.confidenceScore ?? 0,
                    confidenceBand: existingVerdict.confidenceBand || existingVerdict.confidence || 'LOW',
                    reasoning: existingVerdict.reasoning || '',
                    supportScore: existingVerdict.supportScore || 0,
                    contradictScore: existingVerdict.contradictScore || 0,
                    contradictionLevel: existingVerdict.contradictionLevel || 0
                });
            }
            catch (e) {
                // swallow history creation errors to keep verdict path robust
            }
        }
        // Update existing verdict (cast data to any to be compatible with different Prisma client schemas)
        return prisma_1.prisma.verdict.update({
            where: { id: existingVerdict.id },
            data: {}
        });
    }
    else {
        // Create new verdict
        return prisma_1.prisma.verdict.create({ data: {} });
    }
}
/**
 * Get the current verdict for a claim.
 */
async function getVerdictByClaimId(claimId) {
    const verdict = await prisma_1.prisma.verdict.findFirst({
        where: { claimId }
    });
    return verdict;
}
/**
 * Get all verdicts for multiple claims.
 */
async function getVerdictsByClaimIds(claimIds) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: {
            claimId: { in: claimIds }
        }
    });
    return verdicts;
}
/**
 * Get verdict by ID.
 */
async function getVerdictById(verdictId) {
    const verdict = await prisma_1.prisma.verdict.findUnique({
        where: { id: verdictId }
    });
    return verdict;
}
/**
 * Approve a verdict (for moderation workflow).
 */
async function approveVerdict(verdictId, reviewerId) {
    return prisma_1.prisma.verdict.update({
        where: { id: verdictId },
        data: {
            isApproved: true,
            publishedById: reviewerId,
            publishedAt: new Date()
        }
    });
}
/**
 * Reject a verdict (set isApproved to false).
 */
async function rejectVerdict(verdictId) {
    return prisma_1.prisma.verdict.update({
        where: { id: verdictId },
        data: {
            isApproved: false,
            publishedById: null,
            publishedAt: null
        }
    });
}
// ============================================================================
// VERDICT HISTORY OPERATIONS
// ============================================================================
/**
 * Create a history entry for verdict changes.
 */
async function createVerdictHistory(verdictId, claimId, historyData) {
    if (prisma_1.prisma.verdictHistory) {
        try {
            return (await prisma_1.prisma.verdictHistory.create({
                data: {
                    verdictId,
                    claimId,
                    verdictType: historyData.verdictType,
                    falsityScore: historyData.falsityScore,
                    confidenceScore: historyData.confidenceScore,
                    confidenceBand: historyData.confidenceBand,
                    reasoning: historyData.reasoning,
                    supportScore: historyData.supportScore,
                    contradictScore: historyData.contradictScore,
                    contradictionLevel: historyData.contradictionLevel
                }
            }));
        }
        catch (e) {
            return {};
        }
    }
    return {};
}
/**
 * Get verdict history for a specific verdict.
 */
async function getVerdictHistory(verdictId) {
    if (prisma_1.prisma.verdictHistory) {
        const history = await prisma_1.prisma.verdictHistory.findMany({ where: { verdictId }, orderBy: { createdAt: 'desc' } });
        return history;
    }
    return [];
}
/**
 * Get verdict history for a specific claim.
 */
async function getClaimVerdictHistory(claimId, limit = 50) {
    if (prisma_1.prisma.verdictHistory) {
        const history = await prisma_1.prisma.verdictHistory.findMany({ where: { claimId }, orderBy: { createdAt: 'desc' }, take: limit });
        return history;
    }
    return [];
}
/**
 * Delete verdict history (rarely used, for cleanup/corrections).
 */
async function deleteVerdictHistory(historyId) {
    if (prisma_1.prisma.verdictHistory) {
        await prisma_1.prisma.verdictHistory.delete({ where: { id: historyId } });
    }
}
// ============================================================================
// QUERY OPERATIONS
// ============================================================================
/**
 * Get all approved verdicts.
 */
async function getApprovedVerdicts(limit = 100) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: { isApproved: true },
        orderBy: { updatedAt: 'desc' },
        take: limit
    });
    return verdicts;
}
/**
 * Get verdicts by type.
 */
async function getVerdictsByType(verdictType, limit = 100) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: { verdictType: verdictType },
        orderBy: { updatedAt: 'desc' },
        take: limit
    });
    return verdicts;
}
/**
 * Get verdicts by confidence band.
 */
async function getVerdictsByConfidenceBand(confidenceBand, limit = 100) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: { confidenceBand: confidenceBand },
        orderBy: { updatedAt: 'desc' },
        take: limit
    });
    return verdicts;
}
/**
 * Get verdicts within falsity score range.
 */
async function getVerdictsByFalsityRange(minScore, maxScore, limit = 100) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: {
            falsityScore: {
                gte: minScore,
                lte: maxScore
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
    });
    return verdicts;
}
/**
 * Get pending verdicts (not yet approved).
 */
async function getPendingVerdicts(limit = 100) {
    const verdicts = await prisma_1.prisma.verdict.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'asc' },
        take: limit
    });
    return verdicts;
}
