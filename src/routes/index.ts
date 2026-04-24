import type { FastifyInstance } from 'fastify';

import { registerHealthRoute } from './health';
import { registerPingRoute } from './ping';
import { registerAuthRoutes } from '../modules/auth/auth.routes';

export function registerRoutes(fastify: FastifyInstance): void {
  registerHealthRoute(fastify);
  registerPingRoute(fastify);
  registerAuthRoutes(fastify);
}
