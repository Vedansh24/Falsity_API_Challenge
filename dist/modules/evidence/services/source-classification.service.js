"use strict";
/**
 * Source Classification Service
 * Maps source URLs to predefined source types based on domain patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifySource = classifySource;
exports.getSourceCredibilityTier = getSourceCredibilityTier;
const classifiers = [
    // Government domains
    { pattern: /\.gov(\.)?/, type: 'GOVERNMENT' },
    { pattern: /\.gov\.uk/, type: 'GOVERNMENT' },
    { pattern: /parliament\.uk/, type: 'GOVERNMENT' },
    { pattern: /whitehouse\.gov/, type: 'GOVERNMENT' },
    { pattern: /census\.gov/, type: 'GOVERNMENT' },
    // Academic/Research
    { pattern: /arxiv\.org/, type: 'RESEARCH_PAPER' },
    { pattern: /scholar\.google/, type: 'RESEARCH_PAPER' },
    { pattern: /researchgate\.net/, type: 'RESEARCH_PAPER' },
    { pattern: /academic\.com/, type: 'RESEARCH_PAPER' },
    { pattern: /\.edu\//, type: 'RESEARCH_PAPER' },
    // News outlets
    { pattern: /bbc\.com/, type: 'NEWS' },
    { pattern: /cnn\.com/, type: 'NEWS' },
    { pattern: /reuters\.com/, type: 'NEWS' },
    { pattern: /apnews\.com/, type: 'NEWS' },
    { pattern: /guardian\.com/, type: 'NEWS' },
    { pattern: /nytimes\.com/, type: 'NEWS' },
    { pattern: /theguardian\.com/, type: 'NEWS' },
    // Social Media
    { pattern: /twitter\.com/, type: 'SOCIAL_MEDIA' },
    { pattern: /x\.com/, type: 'SOCIAL_MEDIA' },
    { pattern: /facebook\.com/, type: 'SOCIAL_MEDIA' },
    { pattern: /instagram\.com/, type: 'SOCIAL_MEDIA' },
    { pattern: /reddit\.com/, type: 'SOCIAL_MEDIA' },
    { pattern: /tiktok\.com/, type: 'SOCIAL_MEDIA' },
    // Blogs
    { pattern: /medium\.com/, type: 'BLOG' },
    { pattern: /substack\.com/, type: 'BLOG' },
    { pattern: /wordpress\.com/, type: 'BLOG' },
    { pattern: /blogspot\.com/, type: 'BLOG' }
];
/**
 * Classify a source URL based on domain patterns.
 * Returns INTERNAL_REPORT if no pattern matches.
 */
function classifySource(sourceUrl) {
    try {
        const url = new URL(sourceUrl);
        const hostname = url.hostname.toLowerCase();
        for (const classifier of classifiers) {
            if (classifier.pattern.test(hostname)) {
                return classifier.type;
            }
        }
        // Default: unknown/internal report
        return 'INTERNAL_REPORT';
    }
    catch {
        // If URL parsing fails, default to internal
        return 'INTERNAL_REPORT';
    }
}
/**
 * Get the credibility tier for a source type.
 * Used for default scoring.
 */
function getSourceCredibilityTier(sourceType) {
    const tiers = {
        GOVERNMENT: 0.95,
        RESEARCH_PAPER: 0.85,
        NEWS: 0.7,
        BLOG: 0.5,
        SOCIAL_MEDIA: 0.3,
        INTERNAL_REPORT: 0.6
    };
    return tiers[sourceType];
}
