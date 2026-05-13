import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import {
  listCommentsController,
  createCommentController,
  patchCommentController,
  deleteCommentController
} from './comments.controller';

export async function registerCommentsRoutes(fastify: FastifyInstance): Promise<void> {
  // List comments for a claim (public or filtered by policy)
  fastify.get('/:id/comments', listCommentsController);

  // Create a comment on a claim (authenticated)
  fastify.post('/:id/comments', { preHandler: [authenticate] }, createCommentController);

  // Update a comment (authenticated)
  fastify.patch('/comments/:id', { preHandler: [authenticate] }, patchCommentController);

  // Delete a comment (authenticated)
  fastify.delete('/comments/:id', { preHandler: [authenticate] }, deleteCommentController);
}
