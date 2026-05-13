"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWikipediaSummary = fetchWikipediaSummary;
const source_http_client_1 = require("../http/source-http.client");
const WIKI_API = 'https://en.wikipedia.org/api/rest_v1';
async function fetchWikipediaSummary(query) {
    // Use opensearch to find a page, then fetch summary
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&search=${encodeURIComponent(query)}`;
    const sres = await (0, source_http_client_1.fetchWithRetry)(searchUrl, { method: 'GET' }, { timeoutMs: 6000, retries: 1 });
    if (!sres.ok)
        return sres;
    const title = sres.data?.[1]?.[0];
    if (!title)
        return { ok: false, error: { code: 'NOT_FOUND', message: 'No Wikipedia page found' } };
    const summaryUrl = `${WIKI_API}/page/summary/${encodeURIComponent(title)}`;
    const res = await (0, source_http_client_1.fetchWithRetry)(summaryUrl, { method: 'GET', headers: { 'User-Agent': 'falsity-api/1.0' } }, { timeoutMs: 6000, retries: 1 });
    if (!res.ok)
        return res;
    const data = res.data || {};
    const out = {
        title: data.title,
        content: data.extract || data.description || '',
        publisher: 'Wikipedia',
        publishedAt: data.timestamp || new Date().toISOString(),
        url: data.content_urls?.desktop?.page || ''
    };
    return { ok: true, status: 200, data: out };
}
