/**
 * Sentry integration for Phase 8 monitoring.
 * Centralized error tracking and observability.
 */

import * as Sentry from '@sentry/node';
import type { FastifyInstance } from 'fastify';

interface SentryConfig {
  environment: string;
  tracesSampleRate: number;
  enabled: boolean;
}

function getSentryConfig(): SentryConfig {
  const env = process.env.NODE_ENV || 'development';
  const dsn = process.env.SENTRY_DSN;

  return {
    environment: env,
    tracesSampleRate: env === 'production' ? 0.1 : 1.0,
    enabled: !!dsn
  };
}

/**
 * Initialize Sentry for error tracking.
 * Call early in app startup (before any async operations).
 */
export function initializeSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('[Sentry] Disabled (no SENTRY_DSN)');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate
  });

  console.log(`[Sentry] Initialized for env: ${config.environment}`);
}

/**
 * Register Sentry error handler as Fastify hook.
 */
export async function registerSentryHook(fastify: FastifyInstance): Promise<void> {
  // Request error hook
  fastify.setErrorHandler((err, request, reply) => {
    Sentry.captureException(err, {
      tags: {
        path: request.url,
        method: request.method
      }
    });

    // Continue with error handling
    reply.status(500).send({
      success: false,
      message: 'Internal server error',
      error: { code: 'INTERNAL_ERROR' }
    });
  });

  console.log('[Sentry] Error handler registered');
}

/**
 * Capture exception manually.
 */
export function captureException(err: Error, context?: Record<string, any>): void {
  Sentry.captureException(err, context);
}

/**
 * Capture message.
 */
export function captureMessage(msg: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  Sentry.captureMessage(msg, level);
}

export default { initializeSentry, registerSentryHook, captureException, captureMessage };
