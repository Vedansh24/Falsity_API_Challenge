"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerV1Routes = registerV1Routes;
const constants_1 = require("../config/constants");
const auth_routes_1 = require("../modules/auth/auth.routes");
const claims_routes_1 = require("../modules/claims/claims.routes");
const evidence_routes_1 = require("../modules/evidence/evidence.routes");
const ping_1 = require("./ping");
async function registerV1Routes(fastify) {
    await fastify.register(async (instance) => {
        (0, ping_1.registerPingRoute)(instance);
        await instance.register(auth_routes_1.registerAuthRoutes, {
            prefix: '/auth'
        });
        await instance.register(claims_routes_1.registerClaimsRoutes, {
            prefix: '/claims'
        });
        await instance.register(evidence_routes_1.registerEvidenceRoutes, {
            prefix: '/claims'
        });
    }, {
        prefix: constants_1.API_PREFIX
    });
}
