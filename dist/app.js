"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const request_id_hook_1 = require("./common/hooks/request-id.hook");
const response_time_hook_1 = require("./common/hooks/response-time.hook");
const logger_1 = require("./config/logger");
const plugins_1 = require("./plugins");
const jwt_1 = __importDefault(require("./plugins/jwt"));
const prisma_1 = require("./plugins/prisma");
const swagger_1 = require("./plugins/swagger");
const routes_1 = require("./routes");
async function buildApp() {
    const app = (0, fastify_1.default)({ logger: (0, logger_1.createLoggerOptions)() });
    (0, plugins_1.registerPlugins)(app);
    app.addHook('onRequest', request_id_hook_1.requestIdHook);
    app.addHook('onSend', response_time_hook_1.responseTimeHook);
    await (0, prisma_1.registerPrisma)(app);
    await app.register(jwt_1.default);
    await (0, swagger_1.registerSwagger)(app);
    await app.register(routes_1.registerRoutes);
    return app;
}
