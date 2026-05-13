/**
 * Prometheus metrics integration for Phase 8.
 * Exposes metrics for monitoring and dashboarding.
 */

import { register, Counter, Histogram, Gauge } from 'prom-client';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Define metrics for the application.
 */

// Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Queue metrics
export const queueSize = new Gauge({
  name: 'queue_size',
  help: 'Number of jobs in queue',
  labelNames: ['queue_name']
});

export const queueJobsProcessed = new Counter({
  name: 'queue_jobs_processed_total',
  help: 'Total jobs processed',
  labelNames: ['queue_name', 'status']
});

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['cache_name']
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['cache_name']
});

// Integration metrics
export const externalApiLatency = new Histogram({
  name: 'external_api_latency_seconds',
  help: 'External API call latency',
  labelNames: ['api_name'],
  buckets: [0.5, 1, 2, 5, 10]
});

export const externalApiErrors = new Counter({
  name: 'external_api_errors_total',
  help: 'External API errors',
  labelNames: ['api_name', 'error_type']
});

/**
 * Register metrics endpoint with Fastify.
 */
export async function registerMetricsEndpoint(fastify: FastifyInstance): Promise<void> {
  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain');
    return register.metrics();
  });

  console.log('[Prometheus] Metrics endpoint registered at GET /metrics');
}

/**
 * Middleware to track HTTP request metrics.
 */
export async function registerMetricsHook(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', async (request) => {
    (request as any).metricsStartTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const startTime = (request as any).metricsStartTime || Date.now();
    const duration = (Date.now() - startTime) / 1000;
    const url = request.url || 'unknown';
    const route: string = (url.split('?')[0] || 'unknown'); // Remove query string
    const method: string = request.method || 'UNKNOWN';

    httpRequestDuration
      .labels(method, route, String(reply.statusCode))
      .observe(duration);

    httpRequestsTotal
      .labels(method, route, String(reply.statusCode))
      .inc();
  });

  console.log('[Prometheus] Metrics hook registered');
}

export default {
  registerMetricsEndpoint,
  registerMetricsHook,
  httpRequestDuration,
  httpRequestsTotal,
  queueSize,
  queueJobsProcessed,
  cacheHits,
  cacheMisses,
  externalApiLatency,
  externalApiErrors
};
