import { fetchWithRetry } from '../http/source-http.client';

const BASE = 'https://www.reddit.com';

export async function fetchRedditPosts(query: string, limit = 10) {
  // Use Reddit public search endpoint (JSON)
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetchWithRetry(url, { method: 'GET', headers: { 'User-Agent': 'falsity-api/1.0' } }, { timeoutMs: 8000, retries: 2 });

  if (!res.ok) return res;

  const posts = (res.data?.data?.children || []).map((c: any) => {
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
