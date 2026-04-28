import type { FastifyInstance } from 'fastify';

import { registerHealthRoute } from './health';
import { registerV1Routes } from './v1';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  registerHealthRoute(fastify);
  await registerV1Routes(fastify);
}
