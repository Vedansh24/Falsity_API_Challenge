import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions
} from 'fastify';

import { authenticate } from '../../common/hooks/auth.hook';
import { createApiResponse } from '../../common/responses/api-response';
import {
  claimIdParamsJsonSchema,
  claimResponseJsonSchema,
  createClaimBodyJsonSchema,
  listClaimsQueryJsonSchema,
  listClaimsResponseJsonSchema,
  updateClaimBodyJsonSchema
} from './claims.schema';
import {
  createClaimController,
  getClaimByIdController,
  listClaimsController,
  submitClaimController,
  updateClaimController
} from './claims.controller';

function wrapSuccessResponse(payload: unknown): { status: 'ok'; data: unknown } {
  return createApiResponse(payload);
}

const baseProtectedOptions: Pick<RouteShorthandOptions, 'preHandler'> = {
  preHandler: [authenticate]
};

const createClaimRouteOptions: RouteShorthandOptions = {
  ...baseProtectedOptions,
  schema: {
    tags: ['Claims'],
    description: 'Create a new claim with DRAFT status owned by the authenticated user.',
    security: [{ bearerAuth: [] }],
    body: createClaimBodyJsonSchema,
    response: {
      201: claimResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const listClaimsRouteOptions: RouteShorthandOptions = {
  ...baseProtectedOptions,
  schema: {
    tags: ['Claims'],
    description: 'List claims with pagination and optional status/owner filters.',
    security: [{ bearerAuth: [] }],
    querystring: listClaimsQueryJsonSchema,
    response: {
      200: listClaimsResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const getClaimByIdRouteOptions: RouteShorthandOptions = {
  ...baseProtectedOptions,
  schema: {
    tags: ['Claims'],
    description: 'Get full claim details by id.',
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

const updateClaimRouteOptions: RouteShorthandOptions = {
  ...baseProtectedOptions,
  schema: {
    tags: ['Claims'],
    description: 'Update a DRAFT claim owned by the authenticated user.',
    security: [{ bearerAuth: [] }],
    params: claimIdParamsJsonSchema,
    body: updateClaimBodyJsonSchema,
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

const submitClaimRouteOptions: RouteShorthandOptions = {
  ...baseProtectedOptions,
  schema: {
    tags: ['Claims'],
    description: 'Submit a DRAFT claim (DRAFT -> SUBMITTED) for the owner only.',
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

export async function registerClaimsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/', createClaimRouteOptions, createClaimController);
  fastify.get('/', listClaimsRouteOptions, listClaimsController);
  fastify.get('/:id', getClaimByIdRouteOptions, getClaimByIdController);
  fastify.patch('/:id', updateClaimRouteOptions, updateClaimController);
  fastify.post('/:id/submit', submitClaimRouteOptions, submitClaimController);
}
