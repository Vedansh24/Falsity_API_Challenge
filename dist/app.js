"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
exports.initializePhase8Infrastructure = initializePhase8Infrastructure;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const request_id_hook_1 = require("./common/hooks/request-id.hook");
const response_time_hook_1 = require("./common/hooks/response-time.hook");
const logger_1 = require("./config/logger");
const plugins_1 = require("./plugins");
const jwt_1 = __importDefault(require("./plugins/jwt"));
const prisma_1 = require("./plugins/prisma");
const swagger_1 = require("./plugins/swagger");
const routes_1 = require("./routes");
// Phase 8: Monitoring and performance
const sentry_1 = require("./config/monitoring/sentry");
const prometheus_1 = require("./config/monitoring/prometheus");
const bullmq_client_1 = require("./jobs/bullmq.client");
const source_fetch_worker_1 = require("./jobs/workers/source-fetch.worker");
const verdict_worker_1 = require("./jobs/workers/verdict.worker");
const notification_worker_1 = require("./jobs/workers/notification.worker");
const rate_limit_2 = require("./config/rate-limit");
async function buildApp() {
    // Initialize Sentry first (before any async operations)
    (0, sentry_1.initializeSentry)();
    const app = (0, fastify_1.default)({ logger: (0, logger_1.createLoggerOptions)() });
    await app.register(cors_1.default, {
        origin: 'http://localhost:5173',
        credentials: true
    });
    // Phase 8: Add rate limiting
    await app.register(rate_limit_1.default, {
        max: rate_limit_2.rateLimitConfigs.PUBLIC_VERDICT.max,
        timeWindow: rate_limit_2.rateLimitConfigs.PUBLIC_VERDICT.timeWindow,
        cache: rate_limit_2.rateLimitConfigs.PUBLIC_VERDICT.cache,
        skipOnError: rate_limit_2.rateLimitConfigs.PUBLIC_VERDICT.skipOnError,
        keyGenerator: (request) => {
            // Use IP address as rate limit key
            return request.ip || 'unknown';
        },
        errorResponseBuilder: () => ({
            success: false,
            message: 'Too many requests',
            error: { code: 'RATE_LIMITED' }
        })
    });
    (0, plugins_1.registerPlugins)(app);
    app.addHook('onRequest', request_id_hook_1.requestIdHook);
    app.addHook('onSend', response_time_hook_1.responseTimeHook);
    // Phase 8: Add Prometheus metrics hooks
    await (0, prometheus_1.registerMetricsHook)(app);
    await (0, prisma_1.registerPrisma)(app);
    await app.register(jwt_1.default);
    await (0, swagger_1.registerSwagger)(app);
    // Phase 8: Register metrics endpoint
    await (0, prometheus_1.registerMetricsEndpoint)(app);
    // Phase 8: Register Sentry error handler
    await (0, sentry_1.registerSentryHook)(app);
    await app.register(routes_1.registerRoutes);
    return app;
}
/**
 * Initialize Phase 8 background infrastructure.
 * Call after app startup.
 */
async function initializePhase8Infrastructure() {
    try {
        // Initialize BullMQ queues
        await (0, bullmq_client_1.initializeQueues)();
        // Initialize workers
        await (0, source_fetch_worker_1.initializeSourceFetchWorker)();
        await (0, verdict_worker_1.initializeVerdictWorker)();
        await (0, notification_worker_1.initializeNotificationWorker)();
        console.log('[Phase 8] Background infrastructure initialized');
    }
    catch (err) {
        console.error('[Phase 8] Failed to initialize background infrastructure', err);
        // Non-fatal: app continues without workers
    }
}
