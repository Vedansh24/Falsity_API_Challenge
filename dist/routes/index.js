"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const health_1 = require("./health");
const v1_1 = require("./v1");
async function registerRoutes(fastify) {
    (0, health_1.registerHealthRoute)(fastify);
    await (0, v1_1.registerV1Routes)(fastify);
}
