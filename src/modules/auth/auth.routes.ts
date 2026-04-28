// src/modules/auth/auth.routes.ts
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions
} from 'fastify';

import { authenticate } from '../../common/hooks/auth.hook';
import {
  loginController,
  meController,
  registerController
} from './auth.controller';
import {
  loginBodyJsonSchema,
  loginResponseJsonSchema,
  meResponseJsonSchema,
  registerBodyJsonSchema,
  registerResponseJsonSchema
} from './auth.schema';
import { createApiResponse } from '../../common/responses/api-response';

function wrapSuccessResponse(payload: unknown): { status: 'ok'; data: unknown } {
  return createApiResponse(payload);
}

const registerRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    description: 'Register a new user account',
    body: registerBodyJsonSchema,
    response: {
      201: registerResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const loginRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    description: 'Login and receive a JWT access token',
    body: loginBodyJsonSchema,
    response: {
      200: loginResponseJsonSchema
    }
  },
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

const meRouteOptions: RouteShorthandOptions = {
  schema: {
    tags: ['Auth'],
    description: 'Get the currently authenticated user (requires Bearer token)',
    security: [{ bearerAuth: [] }],
    response: {
      200: meResponseJsonSchema
    }
  },
  preHandler: [authenticate],
  preSerialization: async (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown
  ): Promise<{ status: 'ok'; data: unknown }> => wrapSuccessResponse(payload)
};

export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/register', registerRouteOptions, registerController);
  fastify.post('/login', loginRouteOptions, loginController);
  fastify.get('/me', meRouteOptions, meController);
}
