"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidence = createEvidence;
exports.findByClaimId = findByClaimId;
exports.findById = findById;
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
            reviewerConfidence: data.reviewerConfidence
        }
    });
    return result;
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
 * Find a single evidence record by ID.
 */
async function findById(id) {
    const result = await prisma_1.prisma.evidence.findUnique({
        where: { id }
    });
    return result || null;
}
