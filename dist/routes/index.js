"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const health_1 = require("./health");
const ping_1 = require("./ping");
const auth_routes_1 = require("../modules/auth/auth.routes");
function registerRoutes(fastify) {
    (0, health_1.registerHealthRoute)(fastify);
    (0, ping_1.registerPingRoute)(fastify);
    (0, auth_routes_1.registerAuthRoutes)(fastify);
}
