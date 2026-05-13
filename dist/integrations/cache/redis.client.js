"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisClient = createRedisClient;
exports.getRedisClient = getRedisClient;
let Redis = null;
let client = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Redis = require('redis');
}
catch (err) {
    Redis = null;
}
async function createRedisClient(url) {
    if (!Redis)
        return null;
    const client = Redis.createClient({ url: url || process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis error', err));
    await client.connect();
    return client;
}
async function getRedisClient() {
    if (client)
        return client;
    client = await createRedisClient();
    return client;
}
