"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerV1Routes = registerV1Routes;
const constants_1 = require("../config/constants");
const auth_routes_1 = require("../modules/external-sources/auth/auth.routes");
const claims_routes_1 = require("../modules/claims/claims.routes");
const evidence_routes_1 = require("../modules/evidence/evidence.routes");
const verdict_routes_1 = require("../modules/verdict/verdict.routes");
const investigations_routes_1 = require("../modules/investigations/investigations.routes");
const integrations_routes_1 = require("../modules/integrations/integrations.routes");
const ping_1 = require("./ping");
/**
 * Register all v1 API routes.
 *
 * Structure:
 * /api/v1/auth - Authentication
 * /api/v1/claims - Claims and evidence
 * /api/v1/verdicts - Verdict moderation and statistics
 */
async function registerV1Routes(fastify) {
    await fastify.register(async (instance) => {
        (0, ping_1.registerPingRoute)(instance);
        // Auth routes
        await instance.register(auth_routes_1.registerAuthRoutes, {
            prefix: '/auth'
        });
        // Claims routes (includes verdict endpoints nested under claims)
        await instance.register(claims_routes_1.registerClaimsRoutes, {
            prefix: '/claims'
        });
        // Verdict routes (under claims)
        await instance.register(verdict_routes_1.registerVerdictRoutes, {
            prefix: '/claims'
        });
        // Evidence routes (under claims)
        await instance.register(evidence_routes_1.registerEvidenceRoutes, {
            prefix: '/claims'
        });
        // Investigation routes (under claims)
        await instance.register(investigations_routes_1.registerInvestigationRoutes, {
            prefix: '/claims'
        });
        // External integrations (ingest sources)
        await instance.register(integrations_routes_1.registerIntegrationRoutes, { prefix: '/claims' });
        // Comments and timeline routes intentionally not auto-registered here to avoid startup coupling.
        // Verdict moderation routes (standalone)
        await instance.register(verdict_routes_1.registerVerdictModerationRoutes, {
            prefix: '/verdicts'
        });
    }, {
        prefix: constants_1.API_PREFIX
    });
}
