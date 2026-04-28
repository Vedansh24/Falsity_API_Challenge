import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';

import { getVerdictService } from './verdict.service';

export const getVerdictController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = request.params as { id: string };
  const { id } = params;

  const result = await getVerdictService(id);
  return reply.code(200).send(result);
};
