"use strict";
/**
 * Evidence Metadata Extraction Service
 * Extracts structured metadata from evidence sources.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDomain = extractDomain;
exports.extractMetadata = extractMetadata;
exports.calculateFreshnessScore = calculateFreshnessScore;
/**
 * Extract domain from URL.
 */
function extractDomain(sourceUrl) {
    try {
        const url = new URL(sourceUrl);
        return url.hostname;
    }
    catch {
        return undefined;
    }
}
/**
 * Extract metadata from a URL and optional metadata object.
 * Returns structured metadata with all fields nullable.
 */
function extractMetadata(sourceUrl, additionalMetadata) {
    const metadata = {};
    // Extract domain
    const domain = extractDomain(sourceUrl);
    if (domain) {
        metadata.domain = domain;
    }
    // Extract from additional metadata if provided
    if (additionalMetadata) {
        if (typeof additionalMetadata.publisher === 'string') {
            metadata.publisher = additionalMetadata.publisher;
        }
        if (typeof additionalMetadata.title === 'string') {
            metadata.title = additionalMetadata.title;
        }
        if (typeof additionalMetadata.author === 'string') {
            metadata.author = additionalMetadata.author;
        }
        if (typeof additionalMetadata.publicationDate === 'string') {
            try {
                metadata.publicationDate = new Date(additionalMetadata.publicationDate);
            }
            catch {
                // Ignore invalid dates
            }
        }
    }
    return metadata;
}
/**
 * Calculate freshness score based on publication date.
 * Returns 0-1 score where 1 is very recent.
 */
function calculateFreshnessScore(publicationDate) {
    if (!publicationDate) {
        return 0.5; // Neutral if unknown
    }
    const now = new Date();
    const daysSincePublication = (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60 * 24);
    // Score decay: newer is better
    // 0 days old: 1.0
    // 30 days old: 0.9
    // 90 days old: 0.7
    // 365 days old: 0.3
    // 2+ years old: 0.1
    if (daysSincePublication <= 0)
        return 1.0;
    if (daysSincePublication <= 30)
        return Math.max(0.9, 1.0 - daysSincePublication / 300);
    if (daysSincePublication <= 90)
        return Math.max(0.7, 1.0 - daysSincePublication / 300);
    if (daysSincePublication <= 365)
        return Math.max(0.3, 1.0 - daysSincePublication / 1000);
    return Math.max(0.1, 1.0 - daysSincePublication / 7000);
}
