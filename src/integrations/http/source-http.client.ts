export type HttpClientOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  headers?: Record<string, string>;
};

export type HttpResponse<T = any> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: { code?: string; message: string };
  headers?: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry<T = any>(
  url: string,
  opts: RequestInit = {},
  clientOpts: HttpClientOptions = {}
): Promise<HttpResponse<T>> {
  const timeoutMs = clientOpts.timeoutMs ?? 8000;
  const retries = clientOpts.retries ?? 2;
  const retryDelayMs = clientOpts.retryDelayMs ?? 500;

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...opts, signal });
      clearTimeout(timer);

      const headers: Record<string, string> = {};
      response.headers.forEach((v, k) => (headers[k] = v));

      const text = await response.text();
      let data: any = undefined;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch (err) {
        data = text;
      }

      if (!response.ok) {
        // Rate limit handling: surface code
        const code = response.status === 429 ? 'RATE_LIMITED' : 'EXTERNAL_ERROR';
        return {
          ok: false,
          status: response.status,
          error: { code, message: typeof data === 'string' ? data : (data?.message || 'External API error') },
          headers
        };
      }

      return { ok: true, status: response.status, data, headers };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      // AbortError from fetch
      const isTimeout = err?.name === 'AbortError' || err?.type === 'aborted';
      if (attempt > retries) break;

      // Backoff then retry
      await sleep(retryDelayMs * attempt);
      continue;
    }
  }

  return {
    ok: false,
    status: 0,
    error: { code: 'NETWORK_ERROR', message: lastError?.message || 'Network failure' }
  };
}
