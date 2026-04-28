import type { FastifyInstance } from 'fastify';

import { API_PREFIX } from '../config/constants';
import { registerAuthRoutes } from '../modules/auth/auth.routes';
import { registerClaimsRoutes } from '../modules/claims/claims.routes';
import { registerEvidenceRoutes } from '../modules/evidence/evidence.routes';
import { registerVerdictRoutes } from '../modules/verdict/verdict.routes';
import { registerPingRoute } from './ping';

export async function registerV1Routes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(async (instance) => {
    registerPingRoute(instance);
    await instance.register(registerAuthRoutes, {
      prefix: '/auth'
    });
    await instance.register(registerClaimsRoutes, {
      prefix: '/claims'
    });
    await instance.register(registerVerdictRoutes, {
      prefix: '/claims'
    });
    await instance.register(registerEvidenceRoutes, {
      prefix: '/claims'
    });
  }, {
    prefix: API_PREFIX
  });
}
