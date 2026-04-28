import type { FastifyReply, FastifyRequest } from 'fastify';

export async function responseTimeHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.header('x-response-time', `${reply.elapsedTime.toFixed(2)}ms`);
}
