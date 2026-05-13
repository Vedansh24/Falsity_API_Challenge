"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGNews = fetchGNews;
const source_http_client_1 = require("../http/source-http.client");
const BASE = 'https://gnews.io/api/v4';
async function fetchGNews(query, max = 10) {
    const apiKey = process.env.GNEWS_KEY;
    if (!apiKey) {
        return { ok: false, error: { code: 'MISSING_API_KEY', message: 'Missing GNEWS_KEY' } };
    }
    const url = `${BASE}/search?q=${encodeURIComponent(query)}&max=${max}&token=${apiKey}`;
    const res = await (0, source_http_client_1.fetchWithRetry)(url, { method: 'GET' }, { timeoutMs: 8000, retries: 2 });
    if (!res.ok)
        return res;
    const articles = (res.data?.articles || []).map((a) => ({
        title: a.title,
        content: a.description || a.content || '',
        publisher: a.source?.name || '',
        publishedAt: a.publishedAt,
        url: a.url
    }));
    return { ok: true, status: 200, data: articles };
}
