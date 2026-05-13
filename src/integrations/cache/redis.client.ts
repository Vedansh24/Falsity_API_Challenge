let Redis: any = null;
let client: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Redis = require('redis');
} catch (err) {
  Redis = null;
}

export async function createRedisClient(url?: string) {
  if (!Redis) return null;
  const client = Redis.createClient({ url: url || process.env.REDIS_URL });
  client.on('error', (err: any) => console.error('Redis error', err));
  await client.connect();
  return client;
}

export async function getRedisClient() {
  if (client) return client;
  client = await createRedisClient();
  return client;
}
