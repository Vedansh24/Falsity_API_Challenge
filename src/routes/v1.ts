import type { FastifyInstance } from 'fastify';

import { API_PREFIX } from '../config/constants';
import { registerAuthRoutes } from '../modules/external-sources/auth/auth.routes';
import { registerClaimsRoutes } from '../modules/claims/claims.routes';
import { registerEvidenceRoutes } from '../modules/evidence/evidence.routes';
import { registerVerdictRoutes, registerVerdictModerationRoutes } from '../modules/verdict/verdict.routes';
import { registerInvestigationRoutes } from '../modules/investigations/investigations.routes';
import { registerIntegrationRoutes } from '../modules/integrations/integrations.routes';
import { registerPingRoute } from './ping';

/**
 * Register all v1 API routes.
 * 
 * Structure:
 * /api/v1/auth - Authentication
 * /api/v1/claims - Claims and evidence
 * /api/v1/verdicts - Verdict moderation and statistics
 */
export async function registerV1Routes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(async (instance) => {
    registerPingRoute(instance);
    
    // Auth routes
    await instance.register(registerAuthRoutes, {
      prefix: '/auth'
    });
    
    // Claims routes (includes verdict endpoints nested under claims)
    await instance.register(registerClaimsRoutes, {
      prefix: '/claims'
    });
    
    // Verdict routes (under claims)
    await instance.register(registerVerdictRoutes, {
      prefix: '/claims'
    });
    
    // Evidence routes (under claims)
    await instance.register(registerEvidenceRoutes, {
      prefix: '/claims'
    });
    
    // Investigation routes (under claims)
    await instance.register(registerInvestigationRoutes, {
      prefix: '/claims'
    });
    
    // External integrations (ingest sources)
    await instance.register(registerIntegrationRoutes, { prefix: '/claims' });
    // Comments and timeline routes intentionally not auto-registered here to avoid startup coupling.
    // Verdict moderation routes (standalone)
    await instance.register(registerVerdictModerationRoutes, {
      prefix: '/verdicts'
    });
  }, {
    prefix: API_PREFIX
  });
}
