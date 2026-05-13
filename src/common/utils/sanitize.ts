/**
 * Lightweight sanitization utilities.
 * - strip HTML tags but preserve inner text
 * - remove <script> tags while preserving inner text
 * - normalize and validate URLs (allow only http/https)
 */

export function stripTagsKeepText(input: string): string {
  if (!input) return input;
  // Remove HTML comments
  let out = input.replace(/<!--([\s\S]*?)-->/g, '');
  // Replace script/style tags but keep inner text
  out = out.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '$1');
  out = out.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '$1');
  // Replace any remaining tags with their inner text removed
  out = out.replace(/<[^>]+>/g, '');
  return out.trim();
}

export function sanitizeString(input: unknown): string {
  if (input === undefined || input === null) return '';
  const s = String(input);
  return stripTagsKeepText(s);
}

export function sanitizeUrl(raw: unknown): string {
  if (!raw) return '';
  let s = String(raw).trim();
  // Reject JavaScript pseudo-URLs
  if (/^javascript:/i.test(s)) return '';
  // Ensure only http/https allowed
  try {
    const u = new URL(s, 'http://localhost');
    if (u.protocol && (u.protocol === 'http:' || u.protocol === 'https:' || u.hostname === 'localhost')) {
      // If only a path was provided, keep it as-is
      if (!/^https?:\/\//i.test(s)) {
        // return pathname + search + hash
        return u.pathname + u.search + u.hash;
      }
      return u.toString();
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Recursively sanitize object/string payloads.
 */
export function sanitizePayload<T>(payload: T): T {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload === 'string') return sanitizeString(payload) as unknown as T;
  if (typeof payload === 'number' || typeof payload === 'boolean') return payload;
  if (Array.isArray(payload)) return payload.map((p) => sanitizePayload(p)) as unknown as T;
  if (typeof payload === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(payload as any)) {
      if (typeof v === 'string') out[k] = sanitizeString(v);
      else out[k] = sanitizePayload(v as any);
    }
    return out as T;
  }
  return payload;
}
