import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions
} from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import { requireRole } from '../../common/hooks/role.hook';
import { createApiResponse } from '../../common/responses/api-response';
import {
  claimIdParamsJsonSchema,
  assignAnalystBodyJsonSchema,
  requestMoreEvidenceBodyJsonSchema,
  publishVerdictBodyJsonSchema,
  claimResponseJsonSchema
} from './investigations.schema';
import {
  assignAnalystController,
  requestMoreEvidenceController,
  readyForVerdictController,
  publishVerdictController,
  archiveClaimController
} from './investigations.controller';

function wrapSuccessResponse(payload: unknown): { status: 'ok'; data: unknown } {
  return createApiResponse(payload);
}

const baseProtectedOptions: Pick<RouteShorthandOptions, 'preHandler'> = {
  preHandler: [authenticate]
};

const assignAnalystRouteOptions: RouteShorthandOptions = {
  preHandler: [authenticate, requireRole('REVIEWER', 'ADMIN')],
  schema: {
    tags: ['Investigations'],
    description: 'Assign an analyst to investigate a claim. Only REVIEWER or ADMIN.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    body: assignAnalystBodyJsonSchema,
    response: {
      200: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const requestMoreEvidenceRouteOptions: RouteShorthandOptions = {
  preHandler: [authenticate, requireRole('ANALYST', 'REVIEWER', 'ADMIN')],
  schema: {
    tags: ['Investigations'],
    description: 'Request more evidence for a claim. Only ANALYST, REVIEWER, or ADMIN.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    body: requestMoreEvidenceBodyJsonSchema,
    response: {
      200: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const readyForVerdictRouteOptions: RouteShorthandOptions = {
  preHandler: [authenticate, requireRole('ANALYST', 'REVIEWER', 'ADMIN')],
  schema: {
    tags: ['Investigations'],
    description: 'Mark claim as ready for verdict. Only ANALYST, REVIEWER, or ADMIN.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    response: {
      200: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const publishVerdictRouteOptions: RouteShorthandOptions = {
  preHandler: [authenticate, requireRole('REVIEWER', 'ADMIN')],
  schema: {
    tags: ['Investigations'],
    description: 'Publish a final verdict for a claim. Only REVIEWER or ADMIN.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    body: publishVerdictBodyJsonSchema,
    response: {
      200: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const archiveClaimRouteOptions: RouteShorthandOptions = {
  preHandler: [authenticate, requireRole('REVIEWER', 'ADMIN')],
  schema: {
    tags: ['Investigations'],
    description: 'Archive a published claim. Only REVIEWER or ADMIN.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    response: {
      200: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

export async function registerInvestigationRoutes(fastify: FastifyInstance): Promise<void> {
  // Workflow endpoints
  fastify.post('/:id/assign-analyst', assignAnalystRouteOptions, assignAnalystController);
  fastify.post('/:id/request-more-evidence', requestMoreEvidenceRouteOptions, requestMoreEvidenceController);
  fastify.post('/:id/ready-for-verdict', readyForVerdictRouteOptions, readyForVerdictController);
  fastify.post('/:id/publish', publishVerdictRouteOptions, publishVerdictController);
  fastify.post('/:id/archive', archiveClaimRouteOptions, archiveClaimController);
}
