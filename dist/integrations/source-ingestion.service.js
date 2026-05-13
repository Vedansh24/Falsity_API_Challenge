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
exports.ingestSourcesForClaim = ingestSourcesForClaim;
const newsapi_service_1 = require("./newsapi/newsapi.service");
const gnews_service_1 = require("./gnews/gnews.service");
const reddit_service_1 = require("./reddit/reddit.service");
const youtube_service_1 = require("./youtube/youtube.service");
const wikipedia_service_1 = require("./wikipedia/wikipedia.service");
const source_normalizer_service_1 = require("./source-normalizer.service");
const cache_service_1 = require("./cache/cache.service");
const evidence_duplicate_service_1 = require("../modules/evidence/services/evidence-duplicate.service");
const evidenceService = __importStar(require("../modules/evidence/evidence.service"));
const verdict_service_1 = require("../modules/verdict/verdict.service");
async function ingestSourcesForClaim(opts) {
    const { query, claimId, maxPerProvider = 5 } = opts;
    // Step A: Try cache first for external fetches
    const cacheKey = `ingest:${claimId}:${Buffer.from(query).toString('base64')}`;
    const cached = await (0, cache_service_1.cacheGet)(cacheKey);
    if (cached)
        return { ok: true, cached: true, data: cached };
    // Step B: Trigger providers in parallel (best-effort)
    const tasks = [
        (0, newsapi_service_1.fetchNewsApiArticles)(query, maxPerProvider),
        (0, gnews_service_1.fetchGNews)(query, maxPerProvider),
        (0, reddit_service_1.fetchRedditPosts)(query, maxPerProvider),
        (0, youtube_service_1.fetchYouTubeVideos)(query, maxPerProvider),
        (0, wikipedia_service_1.fetchWikipediaSummary)(query)
    ];
    const settled = await Promise.allSettled(tasks);
    const results = [];
    for (const s of settled) {
        if (s.status === 'fulfilled') {
            const val = s.value;
            if (val && val.ok && ('data' in val)) {
                results.push(val.data);
            }
        }
    }
    // Flatten results
    const flattened = results.flat();
    // Normalize and deduplicate by URL
    const normalized = [];
    const seen = new Set();
    for (const raw of flattened) {
        try {
            const norm = (0, source_normalizer_service_1.normalizeExternalSource)(raw);
            const id = (norm.url || norm.title || '');
            if (!id)
                continue;
            const nid = id.trim().toLowerCase();
            if (seen.has(nid))
                continue;
            seen.add(nid);
            // Skip duplicates already in DB
            const isDup = await (0, evidence_duplicate_service_1.checkDuplicate)(claimId, norm.url || '');
            if (isDup)
                continue;
            normalized.push(norm);
        }
        catch (err) {
            // ignore malformed entries
            continue;
        }
    }
    // Score and persist evidence (reuse existing service)
    const created = [];
    for (const n of normalized) {
        try {
            const evidenceInput = (0, source_normalizer_service_1.toEvidenceInput)(n);
            // Map normalized content into evidence body
            const body = {
                sourceType: n.sourceType,
                sourceUrl: n.url || '',
                stance: 'NEUTRAL',
                credibilityScore: evidenceInput.credibilityScore,
                relevanceScore: evidenceInput.relevanceScore,
                freshnessScore: evidenceInput.freshnessScore,
                reviewerConfidence: evidenceInput.reviewerConfidence
            };
            const ev = await evidenceService.addEvidence(claimId, body);
            created.push(ev);
        }
        catch (err) {
            // Log and continue
            console.error('Failed to create evidence', err);
            continue;
        }
    }
    // Cache the ingestion result for a short period
    await (0, cache_service_1.cacheSet)(cacheKey, { createdCount: created.length, normalizedCount: normalized.length }, { ttlSec: 60 * 5 });
    // Trigger verdict recomputation
    try {
        await (0, verdict_service_1.recomputeVerdictService)(claimId);
    }
    catch (err) {
        console.error('Failed to recompute verdict after ingestion', err);
    }
    return { ok: true, cached: false, data: { createdCount: created.length, normalizedCount: normalized.length } };
}
