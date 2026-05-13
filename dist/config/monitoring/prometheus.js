"use strict";
/**
 * Prometheus metrics integration for Phase 8.
 * Exposes metrics for monitoring and dashboarding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalApiErrors = exports.externalApiLatency = exports.cacheMisses = exports.cacheHits = exports.queueJobsProcessed = exports.queueSize = exports.httpRequestsTotal = exports.httpRequestDuration = void 0;
exports.registerMetricsEndpoint = registerMetricsEndpoint;
exports.registerMetricsHook = registerMetricsHook;
const prom_client_1 = require("prom-client");
/**
 * Define metrics for the application.
 */
// Request metrics
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});
// Queue metrics
exports.queueSize = new prom_client_1.Gauge({
    name: 'queue_size',
    help: 'Number of jobs in queue',
    labelNames: ['queue_name']
});
exports.queueJobsProcessed = new prom_client_1.Counter({
    name: 'queue_jobs_processed_total',
    help: 'Total jobs processed',
    labelNames: ['queue_name', 'status']
});
// Cache metrics
exports.cacheHits = new prom_client_1.Counter({
    name: 'cache_hits_total',
    help: 'Total cache hits',
    labelNames: ['cache_name']
});
exports.cacheMisses = new prom_client_1.Counter({
    name: 'cache_misses_total',
    help: 'Total cache misses',
    labelNames: ['cache_name']
});
// Integration metrics
exports.externalApiLatency = new prom_client_1.Histogram({
    name: 'external_api_latency_seconds',
    help: 'External API call latency',
    labelNames: ['api_name'],
    buckets: [0.5, 1, 2, 5, 10]
});
exports.externalApiErrors = new prom_client_1.Counter({
    name: 'external_api_errors_total',
    help: 'External API errors',
    labelNames: ['api_name', 'error_type']
});
/**
 * Register metrics endpoint with Fastify.
 */
async function registerMetricsEndpoint(fastify) {
    fastify.get('/metrics', async (request, reply) => {
        reply.type('text/plain');
        return prom_client_1.register.metrics();
    });
    console.log('[Prometheus] Metrics endpoint registered at GET /metrics');
}
/**
 * Middleware to track HTTP request metrics.
 */
async function registerMetricsHook(fastify) {
    fastify.addHook('onRequest', async (request) => {
        request.metricsStartTime = Date.now();
    });
    fastify.addHook('onResponse', async (request, reply) => {
        const startTime = request.metricsStartTime || Date.now();
        const duration = (Date.now() - startTime) / 1000;
        const url = request.url || 'unknown';
        const route = (url.split('?')[0] || 'unknown'); // Remove query string
        const method = request.method || 'UNKNOWN';
        exports.httpRequestDuration
            .labels(method, route, String(reply.statusCode))
            .observe(duration);
        exports.httpRequestsTotal
            .labels(method, route, String(reply.statusCode))
            .inc();
    });
    console.log('[Prometheus] Metrics hook registered');
}
exports.default = {
    registerMetricsEndpoint,
    registerMetricsHook,
    httpRequestDuration: exports.httpRequestDuration,
    httpRequestsTotal: exports.httpRequestsTotal,
    queueSize: exports.queueSize,
    queueJobsProcessed: exports.queueJobsProcessed,
    cacheHits: exports.cacheHits,
    cacheMisses: exports.cacheMisses,
    externalApiLatency: exports.externalApiLatency,
    externalApiErrors: exports.externalApiErrors
};
