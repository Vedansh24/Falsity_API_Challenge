"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewsApiArticles = fetchNewsApiArticles;
const source_http_client_1 = require("../http/source-http.client");
const BASE = 'https://newsapi.org/v2';
async function fetchNewsApiArticles(query, pageSize = 10) {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
        return { ok: false, error: { code: 'MISSING_API_KEY', message: 'Missing NEWSAPI_KEY' } };
    }
    const url = `${BASE}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&apiKey=${apiKey}`;
    const res = await (0, source_http_client_1.fetchWithRetry)(url, { method: 'GET' }, { timeoutMs: 8000, retries: 2 });
    if (!res.ok)
        return res;
    // Normalize to minimal article list
    const articles = (res.data?.articles || []).map((a) => ({
        title: a.title,
        content: a.content || a.description || '',
        publisher: a.source?.name || a.author || '',
        publishedAt: a.publishedAt,
        url: a.url
    }));
    return { ok: true, status: 200, data: articles };
}
