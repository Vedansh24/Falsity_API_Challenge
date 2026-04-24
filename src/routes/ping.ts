import type { FastifyInstance, FastifyReply, FastifyRequest, RouteHandlerMethod, RouteShorthandOptions } from 'fastify';

import type { PingResponse } from '../common/types';

const pingOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        required: ['message'],
        additionalProperties: false
      }
    }
  }
};

const pingHandler: RouteHandlerMethod = async (
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const response: PingResponse = { message: 'pong' };
  return reply.code(200).send(response);
};

export function registerPingRoute(fastify: FastifyInstance): void {
  fastify.get('/api/v1/ping', pingOptions, pingHandler);
}