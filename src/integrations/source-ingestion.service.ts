import { fetchNewsApiArticles } from './newsapi/newsapi.service';
import { fetchGNews } from './gnews/gnews.service';
import { fetchRedditPosts } from './reddit/reddit.service';
import { fetchYouTubeVideos, fetchYouTubeTranscript } from './youtube/youtube.service';
import { fetchWikipediaSummary } from './wikipedia/wikipedia.service';
import { normalizeExternalSource, toEvidenceInput } from './source-normalizer.service';
import { cacheGet, cacheSet } from './cache/cache.service';
import { checkDuplicate } from '../modules/evidence/services/evidence-duplicate.service';
import * as evidenceService from '../modules/evidence/evidence.service';
import { recomputeVerdictService } from '../modules/verdict/verdict.service';

export type IngestOptions = {
  query: string;
  claimId: string;
  maxPerProvider?: number;
};

export async function ingestSourcesForClaim(opts: IngestOptions) {
  const { query, claimId, maxPerProvider = 5 } = opts;

  // Step A: Try cache first for external fetches
  const cacheKey = `ingest:${claimId}:${Buffer.from(query).toString('base64')}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ok: true, cached: true, data: cached };

  // Step B: Trigger providers in parallel (best-effort)
  const tasks = [
    fetchNewsApiArticles(query, maxPerProvider),
    fetchGNews(query, maxPerProvider),
    fetchRedditPosts(query, maxPerProvider),
    fetchYouTubeVideos(query, maxPerProvider),
    fetchWikipediaSummary(query)
  ];

  const settled = await Promise.allSettled(tasks);

  const results: any[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      const val: any = s.value;
      if (val && val.ok && ('data' in val)) {
        results.push(val.data);
      }
    }
  }

  // Flatten results
  const flattened = results.flat();

  // Normalize and deduplicate by URL
  const normalized: any[] = [];
  const seen = new Set<string>();

  for (const raw of flattened) {
    try {
      const norm = normalizeExternalSource(raw);
      const id = (norm.url || norm.title || '') as string;
      if (!id) continue;
      const nid = id.trim().toLowerCase();
      if (seen.has(nid)) continue;
      seen.add(nid);

      // Skip duplicates already in DB
      const isDup = await checkDuplicate(claimId, norm.url || '');
      if (isDup) continue;

      normalized.push(norm);
    } catch (err) {
      // ignore malformed entries
      continue;
    }
  }

  // Score and persist evidence (reuse existing service)
  const created: any[] = [];

  for (const n of normalized) {
    try {
      const evidenceInput = toEvidenceInput(n);
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

      // Sanitize source URL and other fields before creating evidence
      const { sanitizeUrl, sanitizeString } = await import('../common/utils/sanitize.js');
      body.sourceUrl = sanitizeUrl(body.sourceUrl) || '';
      body.sourceType = sanitizeString(body.sourceType);

      const ev = await evidenceService.addEvidence(claimId, body as any);
      created.push(ev);
    } catch (err) {
      // Log and continue
      console.error('Failed to create evidence', err);
      continue;
    }
  }

  // Cache the ingestion result for a short period
  await cacheSet(cacheKey, { createdCount: created.length, normalizedCount: normalized.length }, { ttlSec: 60 * 5 });

  // Trigger verdict recomputation
  try {
    await recomputeVerdictService(claimId);
  } catch (err) {
    console.error('Failed to recompute verdict after ingestion', err);
  }

  return { ok: true, cached: false, data: { createdCount: created.length, normalizedCount: normalized.length } };
}
