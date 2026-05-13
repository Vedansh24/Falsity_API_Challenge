"use strict";
/**
 * Enhanced Redis cache service for Phase 8.
 * Extends Phase 6 caching with TTLs, patterns, and metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGetWithMetrics = cacheGetWithMetrics;
exports.cacheSetWithTtl = cacheSetWithTtl;
exports.cacheDel = cacheDel;
exports.cacheInvalidatePattern = cacheInvalidatePattern;
exports.warmCache = warmCache;
const redis_client_1 = require("./redis.client");
const prometheus_1 = require("../../config/monitoring/prometheus");
const localFallback = new Map();
/**
 * Get from cache with metrics tracking.
 */
async function cacheGetWithMetrics(key, cacheName = 'redis') {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            const entry = localFallback.get(key);
            if (!entry) {
                prometheus_1.cacheMisses.labels(cacheName).inc();
                return null;
            }
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                localFallback.delete(key);
                prometheus_1.cacheMisses.labels(cacheName).inc();
                return null;
            }
            prometheus_1.cacheHits.labels(cacheName).inc();
            return entry.value;
        }
        const raw = await redis.get(key);
        if (!raw) {
            prometheus_1.cacheMisses.labels(cacheName).inc();
            return null;
        }
        prometheus_1.cacheHits.labels(cacheName).inc();
        return JSON.parse(raw);
    }
    catch (err) {
        console.error('Cache get failed', err);
        prometheus_1.cacheMisses.labels(cacheName).inc();
        return null;
    }
}
/**
 * Set in cache with TTL.
 */
async function cacheSetWithTtl(key, value, opts = {}) {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        const str = JSON.stringify(value);
        if (!redis) {
            const expiresAt = opts.ttlSec ? Date.now() + opts.ttlSec * 1000 : null;
            localFallback.set(key, { value, expiresAt });
            return;
        }
        if (opts.ttlSec) {
            await redis.setEx(key, opts.ttlSec, str);
        }
        else {
            await redis.set(key, str);
        }
    }
    catch (err) {
        console.error('Cache set failed', err);
    }
}
/**
 * Delete from cache.
 */
async function cacheDel(key) {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            localFallback.delete(key);
            return;
        }
        await redis.del(key);
    }
    catch (err) {
        console.error('Cache del failed', err);
    }
}
/**
 * Invalidate cache by pattern (e.g., "verdict:*").
 * Only works with Redis (not local fallback).
 */
async function cacheInvalidatePattern(pattern) {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
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
        if (keys.length === 0)
            return 0;
        await redis.del(...keys);
        return keys.length;
    }
    catch (err) {
        console.error('Cache invalidate pattern failed', err);
        return 0;
    }
}
/**
 * Simple pattern matching for local fallback.
 */
function matchPattern(key, pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(key);
}
/**
 * Warm cache with common queries (periodic refresh).
 * Can be called from a background job.
 */
async function warmCache() {
    // TODO: Implement cache warming for high-traffic queries
    // e.g., trending claims, public verdicts, etc.
    console.log('[Cache] Cache warming not yet implemented');
}
exports.default = {
    cacheGetWithMetrics,
    cacheSetWithTtl,
    cacheDel,
    cacheInvalidatePattern,
    warmCache
};
