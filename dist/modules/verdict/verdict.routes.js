"use strict";
/**
 * VERDICT ROUTES
 *
 * Registers all verdict-related endpoints:
 * - Get current verdict
 * - Recompute verdict
 * - Get verdict history
 * - Approve/reject verdicts (moderation)
 * - Get verdict statistics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVerdictRoutes = registerVerdictRoutes;
exports.registerVerdictModerationRoutes = registerVerdictModerationRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const verdict_controller_1 = require("./verdict.controller");
/**
 * Register verdict routes under /api/v1/claims/:id/verdict
 */
async function registerVerdictRoutes(fastify) {
    const authOptions = {
        preHandler: [auth_hook_1.authenticate],
        schema: {
            tags: ['Verdict'],
            security: [{ bearerAuth: [] }]
        }
    };
    // GET - Get current verdict
    fastify.get('/:id/verdict', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Get current verdict for a claim',
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, verdict_controller_1.getVerdictController);
    // POST - Recompute verdict
    fastify.post('/:id/verdict/recompute', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Recompute verdict from current evidence',
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, verdict_controller_1.recomputeVerdictController);
    // GET - Get verdict history
    fastify.get('/:id/verdict/history', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Get verdict history for a claim',
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            },
            querystring: {
                type: 'object',
                properties: { limit: { type: 'string', default: '50' } }
            }
        }
    }, verdict_controller_1.getVerdictHistoryController);
}
/**
 * Register moderation routes under /api/v1/verdicts
 */
async function registerVerdictModerationRoutes(fastify) {
    const authOptions = {
        preHandler: [auth_hook_1.authenticate],
        schema: {
            tags: ['Verdict', 'Moderation'],
            security: [{ bearerAuth: [] }]
        }
    };
    // POST - Approve verdict
    fastify.post('/:verdictId/approve', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Approve a verdict (moderation workflow)',
            params: {
                type: 'object',
                properties: { verdictId: { type: 'string', format: 'uuid' } },
                required: ['verdictId']
            }
        }
    }, verdict_controller_1.approveVerdictController);
    // POST - Reject verdict
    fastify.post('/:verdictId/reject', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Reject a verdict (moderation workflow)',
            params: {
                type: 'object',
                properties: { verdictId: { type: 'string', format: 'uuid' } },
                required: ['verdictId']
            }
        }
    }, verdict_controller_1.rejectVerdictController);
    // GET - Get verdict statistics
    fastify.get('/stats', {
        ...authOptions,
        schema: {
            ...authOptions.schema,
            description: 'Get verdict statistics'
        }
    }, verdict_controller_1.getVerdictStatsController);
}
