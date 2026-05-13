"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchYouTubeVideos = fetchYouTubeVideos;
exports.fetchYouTubeTranscript = fetchYouTubeTranscript;
const source_http_client_1 = require("../http/source-http.client");
const YT_API = 'https://www.googleapis.com/youtube/v3';
async function fetchYouTubeVideos(query, max = 5) {
    const apiKey = process.env.YOUTUBE_KEY;
    if (!apiKey) {
        return { ok: false, error: { code: 'MISSING_API_KEY', message: 'Missing YOUTUBE_KEY' } };
    }
    const url = `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${max}&key=${apiKey}`;
    const res = await (0, source_http_client_1.fetchWithRetry)(url, { method: 'GET' }, { timeoutMs: 8000, retries: 2 });
    if (!res.ok)
        return res;
    const items = (res.data?.items || []).map((it) => ({
        id: it.id?.videoId,
        title: it.snippet?.title,
        description: it.snippet?.description,
        publisher: it.snippet?.channelTitle,
        publishedAt: it.snippet?.publishedAt,
        url: `https://www.youtube.com/watch?v=${it.id?.videoId}`
    }));
    return { ok: true, status: 200, data: items };
}
// Attempt to fetch transcript via third-party attempt (best-effort). Fallback to description.
async function fetchYouTubeTranscript(videoId) {
    // Try jina.ai transcript proxy (best-effort). If unavailable, return null.
    try {
        const proxy = `https://r.jina.ai/http://www.youtube.com/watch?v=${videoId}`;
        const res = await (0, source_http_client_1.fetchWithRetry)(proxy, { method: 'GET' }, { timeoutMs: 8000, retries: 1 });
        if (!res.ok)
            return { ok: false, error: res.error };
        const text = res.data;
        if (text && typeof text === 'string' && text.trim().length > 0) {
            return { ok: true, status: 200, data: { transcript: text } };
        }
    }
    catch (err) {
        // ignore
    }
    return { ok: false, error: { code: 'NO_TRANSCRIPT', message: 'Transcript not available' } };
}
