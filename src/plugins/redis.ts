import type { FastifyInstance } from 'fastify';

export async function registerRedis(_fastify: FastifyInstance): Promise<void> {
  // Redis can be wired here when the project needs caching or pub/sub.
}
