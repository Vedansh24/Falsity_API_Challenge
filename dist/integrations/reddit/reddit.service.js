"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRedditPosts = fetchRedditPosts;
const source_http_client_1 = require("../http/source-http.client");
const BASE = 'https://www.reddit.com';
async function fetchRedditPosts(query, limit = 10) {
    // Use Reddit public search endpoint (JSON)
    const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await (0, source_http_client_1.fetchWithRetry)(url, { method: 'GET', headers: { 'User-Agent': 'falsity-api/1.0' } }, { timeoutMs: 8000, retries: 2 });
    if (!res.ok)
        return res;
    const posts = (res.data?.data?.children || []).map((c) => {
        const d = c.data || {};
        return {
            title: d.title,
            content: d.selftext || d.title || '',
            publisher: d.subreddit_name_prefixed || d.author || '',
            publishedAt: new Date((d.created_utc || 0) * 1000).toISOString(),
            url: `${BASE}${d.permalink}`
        };
    });
    return { ok: true, status: 200, data: posts };
}
