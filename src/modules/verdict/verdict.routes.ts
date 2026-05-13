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

import type { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import {
  getVerdictController,
  recomputeVerdictController,
  getVerdictHistoryController,
  approveVerdictController,
  rejectVerdictController,
  getVerdictStatsController
} from './verdict.controller';

/**
 * Register verdict routes under /api/v1/claims/:id/verdict
 */
export async function registerVerdictRoutes(fastify: FastifyInstance): Promise<void> {
  const authOptions: RouteShorthandOptions = {
    preHandler: [authenticate],
    schema: {
      tags: ['Verdict'],
      security: [{ bearerAuth: [] }]
    }
  };

  // GET - Get current verdict
  fastify.get(
    '/:id/verdict',
    {
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
    },
    getVerdictController
  );

  // POST - Recompute verdict
  fastify.post(
    '/:id/verdict/recompute',
    {
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
    },
    recomputeVerdictController
  );

  // GET - Get verdict history
  fastify.get(
    '/:id/verdict/history',
    {
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
    },
    getVerdictHistoryController
  );
}

/**
 * Register moderation routes under /api/v1/verdicts
 */
export async function registerVerdictModerationRoutes(fastify: FastifyInstance): Promise<void> {
  const authOptions: RouteShorthandOptions = {
    preHandler: [authenticate],
    schema: {
      tags: ['Verdict', 'Moderation'],
      security: [{ bearerAuth: [] }]
    }
  };

  // POST - Approve verdict
  fastify.post(
    '/:verdictId/approve',
    {
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
    },
    approveVerdictController
  );

  // POST - Reject verdict
  fastify.post(
    '/:verdictId/reject',
    {
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
    },
    rejectVerdictController
  );

  // GET - Get verdict statistics
  fastify.get(
    '/stats',
    {
      ...authOptions,
      schema: {
        ...authOptions.schema,
        description: 'Get verdict statistics'
      }
    },
    getVerdictStatsController
  );
}
