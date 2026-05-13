"use strict";
/**
 * Sentry integration for Phase 8 monitoring.
 * Centralized error tracking and observability.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSentry = initializeSentry;
exports.registerSentryHook = registerSentryHook;
exports.captureException = captureException;
exports.captureMessage = captureMessage;
const Sentry = __importStar(require("@sentry/node"));
function getSentryConfig() {
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
function initializeSentry() {
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
async function registerSentryHook(fastify) {
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
function captureException(err, context) {
    Sentry.captureException(err, context);
}
/**
 * Capture message.
 */
function captureMessage(msg, level = 'info') {
    Sentry.captureMessage(msg, level);
}
exports.default = { initializeSentry, registerSentryHook, captureException, captureMessage };
