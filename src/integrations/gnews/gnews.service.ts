import { fetchWithRetry } from '../http/source-http.client';

const BASE = 'https://gnews.io/api/v4';

export async function fetchGNews(query: string, max = 10) {
  const apiKey = process.env.GNEWS_KEY;
  if (!apiKey) {
    return { ok: false, error: { code: 'MISSING_API_KEY', message: 'Missing GNEWS_KEY' } };
  }

  const url = `${BASE}/search?q=${encodeURIComponent(query)}&max=${max}&token=${apiKey}`;

  const res = await fetchWithRetry(url, { method: 'GET' }, { timeoutMs: 8000, retries: 2 });

  if (!res.ok) return res;

  const articles = (res.data?.articles || []).map((a: any) => ({
    title: a.title,
    content: a.description || a.content || '',
    publisher: a.source?.name || '',
    publishedAt: a.publishedAt,
    url: a.url
  }));

  return { ok: true, status: 200, data: articles };
}
