import { fetchWithRetry } from '../http/source-http.client';

const YT_API = 'https://www.googleapis.com/youtube/v3';

export async function fetchYouTubeVideos(query: string, max = 5) {
  const apiKey = process.env.YOUTUBE_KEY;
  if (!apiKey) {
    return { ok: false, error: { code: 'MISSING_API_KEY', message: 'Missing YOUTUBE_KEY' } };
  }

  const url = `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${max}&key=${apiKey}`;
  const res = await fetchWithRetry(url, { method: 'GET' }, { timeoutMs: 8000, retries: 2 });

  if (!res.ok) return res;

  const items = (res.data?.items || []).map((it: any) => ({
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
export async function fetchYouTubeTranscript(videoId: string) {
  // Try jina.ai transcript proxy (best-effort). If unavailable, return null.
  try {
    const proxy = `https://r.jina.ai/http://www.youtube.com/watch?v=${videoId}`;
    const res = await fetchWithRetry(proxy, { method: 'GET' }, { timeoutMs: 8000, retries: 1 });
    if (!res.ok) return { ok: false, error: res.error };
    const text = res.data;
    if (text && typeof text === 'string' && text.trim().length > 0) {
      return { ok: true, status: 200, data: { transcript: text } };
    }
  } catch (err) {
    // ignore
  }

  return { ok: false, error: { code: 'NO_TRANSCRIPT', message: 'Transcript not available' } };
}
