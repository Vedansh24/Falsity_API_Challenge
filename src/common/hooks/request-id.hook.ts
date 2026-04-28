import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requestIdHook(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  _reply.header('x-request-id', request.id);
}
