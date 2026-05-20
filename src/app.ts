import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { requestIdHook } from './common/hooks/request-id.hook';
import { responseTimeHook } from './common/hooks/response-time.hook';
import { createLoggerOptions } from './config/logger';
import { registerPlugins } from './plugins';
import jwtPlugin from './plugins/jwt';
import { registerPrisma } from './plugins/prisma';
import { registerSwagger } from './plugins/swagger';
import { registerRoutes } from './routes';

// Phase 8: Monitoring and performance
import { initializeSentry, registerSentryHook } from './config/monitoring/sentry';
import { registerMetricsEndpoint, registerMetricsHook } from './config/monitoring/prometheus';
import { initializeQueues } from './jobs/bullmq.client';
import { initializeSourceFetchWorker } from './jobs/workers/source-fetch.worker';
import { initializeVerdictWorker } from './jobs/workers/verdict.worker';
import { initializeNotificationWorker } from './jobs/workers/notification.worker';
import { rateLimitConfigs } from './config/rate-limit';

export async function buildApp(): Promise<FastifyInstance> {
  // Initialize Sentry first (before any async operations)
  initializeSentry();

  const app = Fastify({ logger: createLoggerOptions() });

  // Register Helmet for security headers (skip during local development if plugin mismatch occurs)
  if (process.env.NODE_ENV !== 'development') {
    await app.register(helmet);
  }

  // CORS origin from env; support comma-separated list
  const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
  const originOption: string | string[] = origins.length === 1 ? (origins[0] ?? 'http://localhost:5173') : origins;

  await app.register(cors, {
    origin: originOption,
    credentials: true
  });

  // Phase 8: Add rate limiting
  await app.register(rateLimit, {
    max: rateLimitConfigs.PUBLIC_VERDICT!.max,
    timeWindow: rateLimitConfigs.PUBLIC_VERDICT!.timeWindow,
    cache: rateLimitConfigs.PUBLIC_VERDICT!.cache,
    skipOnError: rateLimitConfigs.PUBLIC_VERDICT!.skipOnError,
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

  registerPlugins(app);
  app.addHook('onRequest', requestIdHook);
  app.addHook('onSend', responseTimeHook);
  // Hide sensitive headers
  app.addHook('onSend', async (request, reply, payload) => {
    try {
      reply.header('x-powered-by', '');
      reply.header('server', '');
    } catch (e) {
      // ignore
    }
    return payload;
  });

  // Phase 8: Add Prometheus metrics hooks
  await registerMetricsHook(app);

  await registerPrisma(app);
  await app.register(jwtPlugin);
  await registerSwagger(app);

  // Phase 8: Register metrics endpoint
  await registerMetricsEndpoint(app);

  // Phase 8: Register Sentry error handler
  await registerSentryHook(app);

  await app.register(registerRoutes);

  return app;
}

/**
 * Initialize Phase 8 background infrastructure.
 * Call after app startup.
 */
export async function initializePhase8Infrastructure(): Promise<void> {
  try {
    // Initialize BullMQ queues
    await initializeQueues();

    // Initialize workers
    await initializeSourceFetchWorker();
    await initializeVerdictWorker();
    await initializeNotificationWorker();

    console.log('[Phase 8] Background infrastructure initialized');
  } catch (err) {
    console.error('[Phase 8] Failed to initialize background infrastructure', err);
    // Non-fatal: app continues without workers
  }
}