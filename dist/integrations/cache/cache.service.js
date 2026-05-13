"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheDel = cacheDel;
const redis_client_1 = require("./redis.client");
const localFallback = new Map();
async function cacheGet(key) {
    try {
        const redis = await (0, redis_client_1.getRedisClient)();
        if (!redis) {
            const entry = localFallback.get(key);
            if (!entry)
                return null;
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                localFallback.delete(key);
                return null;
            }
            return entry.value;
        }
        const raw = await redis.get(key);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch (err) {
        console.error('Cache get failed', err);
        return null;
    }
}
async function cacheSet(key, value, opts = {}) {
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
