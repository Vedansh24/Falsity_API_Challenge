"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidence = createEvidence;
exports.findById = findById;
exports.findByClaimId = findByClaimId;
exports.updateEvidence = updateEvidence;
exports.deleteEvidence = deleteEvidence;
exports.countByClaimId = countByClaimId;
const prisma_1 = require("../../plugins/prisma");
/**
 * Create a new evidence record in the database.
 */
async function createEvidence(data) {
    const result = await prisma_1.prisma.evidence.create({
        data: {
            claimId: data.claimId,
            sourceType: data.sourceType,
            sourceUrl: data.sourceUrl,
            stance: data.stance,
            credibilityScore: data.credibilityScore,
            relevanceScore: data.relevanceScore,
            freshnessScore: data.freshnessScore,
            reviewerConfidence: data.reviewerConfidence,
            // qualityScore removed from DB schema; keep scoring in service layer only
        }
    });
    return result;
}
/**
 * Find a single evidence record by ID.
 */
async function findById(id) {
    const result = await prisma_1.prisma.evidence.findUnique({
        where: { id }
    });
    return result || null;
}
/**
 * Find all evidence records for a specific claim.
 */
async function findByClaimId(claimId) {
    const results = await prisma_1.prisma.evidence.findMany({
        where: { claimId },
        orderBy: { createdAt: 'desc' }
    });
    return results;
}
/**
 * Update an evidence record.
 */
async function updateEvidence(id, data) {
    const result = await prisma_1.prisma.evidence.update({
        where: { id },
        data: data
    });
    return result;
}
/**
 * Delete an evidence record.
 */
async function deleteEvidence(id) {
    try {
        await prisma_1.prisma.evidence.delete({
            where: { id }
        });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Count evidence records for a claim.
 */
async function countByClaimId(claimId) {
    return prisma_1.prisma.evidence.count({
        where: { claimId }
    });
}
