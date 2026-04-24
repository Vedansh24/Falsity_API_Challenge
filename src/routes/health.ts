import type { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod, RouteShorthandOptions } from 'fastify';

import type { HealthResponse } from '../common/types';

const healthOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' }
        },
        required: ['status'],
        additionalProperties: false
      }
    }
  }
};

const healthHandler: RouteHandlerMethod = async (
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const response: HealthResponse = { status: 'ok' };
  return reply.code(200).send(response);
};

export function registerHealthRoute(fastify: FastifyInstance): void {
  fastify.get('/health', healthOptions, healthHandler);
}