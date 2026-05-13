"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.checkDuplicate = checkDuplicate;
exports.assertNoDuplicate = assertNoDuplicate;
const app_error_1 = require("../../../common/errors/app-error");
const prisma_1 = require("../../../plugins/prisma");
/**
 * Normalize a URL for comparison.
 * Removes trailing slashes, standardizes protocol.
 */
function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        // Return normalized URL without trailing slash
        let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized;
    }
    catch {
        // If URL parsing fails, return trimmed URL
        return url.trim().toLowerCase();
    }
}
/**
 * Check if evidence with the same source URL already exists for the claim.
 */
async function checkDuplicate(claimId, sourceUrl) {
    const normalizedInput = normalizeUrl(sourceUrl);
    // Find all evidence for this claim
    const existingEvidence = await prisma_1.prisma.evidence.findMany({
        where: { claimId },
        select: { id: true, sourceUrl: true }
    });
    // Check if any have matching normalized URL
    return existingEvidence.some((evidence) => normalizeUrl(evidence.sourceUrl) === normalizedInput);
}
/**
 * Assert that no duplicate evidence exists.
 * Throws if duplicate found.
 */
async function assertNoDuplicate(claimId, sourceUrl) {
    const isDuplicate = await checkDuplicate(claimId, sourceUrl);
    if (isDuplicate) {
        throw new app_error_1.AppError(409, 'Evidence from this source already exists for this claim', 'DUPLICATE_EVIDENCE');
    }
}
