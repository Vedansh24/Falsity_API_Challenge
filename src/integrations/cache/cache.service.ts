import { getRedisClient } from './redis.client';

type CacheOptions = { ttlSec?: number };

const localFallback = new Map<string, { value: any; expiresAt: number | null }>();

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      const entry = localFallback.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        localFallback.delete(key);
        return null;
      }
      return entry.value as T;
    }

    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error('Cache get failed', err);
    return null;
  }
}

export async function cacheSet(key: string, value: any, opts: CacheOptions = {}): Promise<void> {
  try {
    const redis = await getRedisClient();
    const str = JSON.stringify(value);
    if (!redis) {
      const expiresAt = opts.ttlSec ? Date.now() + opts.ttlSec * 1000 : null;
      localFallback.set(key, { value, expiresAt });
      return;
    }

    if (opts.ttlSec) {
      await redis.setEx(key, opts.ttlSec, str);
    } else {
      await redis.set(key, str);
    }
  } catch (err) {
    console.error('Cache set failed', err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      localFallback.delete(key);
      return;
    }
    await redis.del(key);
  } catch (err) {
    console.error('Cache del failed', err);
  }
}
