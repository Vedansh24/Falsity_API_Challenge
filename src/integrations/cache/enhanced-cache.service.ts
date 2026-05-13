/**
 * Enhanced Redis cache service for Phase 8.
 * Extends Phase 6 caching with TTLs, patterns, and metrics.
 */

import { getRedisClient } from './redis.client';
import { cacheHits, cacheMisses } from '../../config/monitoring/prometheus';

type CacheOptions = { ttlSec?: number };

const localFallback = new Map<string, { value: any; expiresAt: number | null }>();

/**
 * Get from cache with metrics tracking.
 */
export async function cacheGetWithMetrics<T = any>(key: string, cacheName: string = 'redis'): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      const entry = localFallback.get(key);
      if (!entry) {
        cacheMisses.labels(cacheName).inc();
        return null;
      }
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        localFallback.delete(key);
        cacheMisses.labels(cacheName).inc();
        return null;
      }
      cacheHits.labels(cacheName).inc();
      return entry.value as T;
    }

    const raw = await redis.get(key);
    if (!raw) {
      cacheMisses.labels(cacheName).inc();
      return null;
    }
    cacheHits.labels(cacheName).inc();
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error('Cache get failed', err);
    cacheMisses.labels(cacheName).inc();
    return null;
  }
}

/**
 * Set in cache with TTL.
 */
export async function cacheSetWithTtl(
  key: string,
  value: any,
  opts: CacheOptions = {}
): Promise<void> {
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

/**
 * Delete from cache.
 */
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

/**
 * Invalidate cache by pattern (e.g., "verdict:*").
 * Only works with Redis (not local fallback).
 */
export async function cacheInvalidatePattern(pattern: string): Promise<number> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      // Local fallback: delete matching keys
      let count = 0;
      for (const [key] of localFallback) {
        if (matchPattern(key, pattern)) {
          localFallback.delete(key);
          count++;
        }
      }
      return count;
    }

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (err) {
    console.error('Cache invalidate pattern failed', err);
    return 0;
  }
}

/**
 * Simple pattern matching for local fallback.
 */
function matchPattern(key: string, pattern: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  return regex.test(key);
}

/**
 * Warm cache with common queries (periodic refresh).
 * Can be called from a background job.
 */
export async function warmCache(): Promise<void> {
  // TODO: Implement cache warming for high-traffic queries
  // e.g., trending claims, public verdicts, etc.
  console.log('[Cache] Cache warming not yet implemented');
}

export default {
  cacheGetWithMetrics,
  cacheSetWithTtl,
  cacheDel,
  cacheInvalidatePattern,
  warmCache
};
