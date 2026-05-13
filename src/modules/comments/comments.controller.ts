import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { AuthError } from '../../common/errors/auth-error';
import * as service from './comments.service';

function requireAuthenticatedUser(request: FastifyRequest) {
  if (request.user === undefined) {
    throw new AuthError(401, 'Invalid or expired token');
  }

  return request.user;
}

export const listCommentsController: RouteHandlerMethod = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const requester = request.user as any | undefined;

  const items = await service.listComments(params.id, requester);
  return reply.code(200).send(items);
};

export const createCommentController: RouteHandlerMethod = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const body = request.body as { content: string; visibility?: 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY' };
  const currentUser = requireAuthenticatedUser(request);

  const created = await service.addComment(params.id, currentUser, body.content, body.visibility ?? 'PUBLIC');
  return reply.code(201).send(created);
};

export const patchCommentController: RouteHandlerMethod = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const body = request.body as { content: string };
  const currentUser = requireAuthenticatedUser(request);

  const updated = await service.updateComment(params.id, currentUser, body.content);
  return reply.code(200).send(updated);
};

export const deleteCommentController: RouteHandlerMethod = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const currentUser = requireAuthenticatedUser(request);

  await service.deleteComment(params.id, currentUser);
  return reply.code(204).send();
};
