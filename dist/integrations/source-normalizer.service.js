"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeExternalSource = normalizeExternalSource;
exports.toEvidenceInput = toEvidenceInput;
function mapProviderToSourceType(provider) {
    if (!provider)
        return 'UNKNOWN';
    const p = provider.toLowerCase();
    if (p.includes('wikipedia') || p.includes('gov') || p.includes('research'))
        return 'RESEARCH_PAPER';
    if (p.includes('news') || p.includes('nyt') || p.includes('cnn') || p.includes('bbc'))
        return 'NEWS';
    if (p.includes('reddit') || p.includes('youtube') || p.includes('twitter'))
        return 'SOCIAL_MEDIA';
    if (p.includes('blog'))
        return 'BLOG';
    return 'UNKNOWN';
}
function sanitizeText(input) {
    if (!input && input !== 0)
        return '';
    if (typeof input === 'string')
        return input.trim();
    try {
        return String(input).trim();
    }
    catch (err) {
        return '';
    }
}
function normalizeExternalSource(raw) {
    // Raw expected to include: title, content, publisher, publishedAt, url, provider
    const title = sanitizeText(raw.title || raw.headline || raw.name || '');
    const content = sanitizeText(raw.content || raw.description || raw.transcript || '');
    const publisher = sanitizeText(raw.publisher || raw.source || raw.publisherName || '');
    const publishedAt = raw.publishedAt ? new Date(String(raw.publishedAt)).toISOString() : null;
    const provider = sanitizeText(raw.provider || raw.publisher || publisher || raw.url || '');
    const sourceType = mapProviderToSourceType(provider);
    return {
        title,
        content,
        publisher,
        publishedAt,
        sourceType,
        url: raw.url
    };
}
function toEvidenceInput(normalized) {
    return {
        stance: 'NEUTRAL',
        credibilityScore: 0.6, // default prior
        relevanceScore: 0.6,
        freshnessScore: normalized.publishedAt ? 1 : 0.5,
        reviewerConfidence: 0.6,
        sourceType: normalized.sourceType
    };
}
