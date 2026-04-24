import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';

import { registerSchema, loginSchema } from './auth.schema';
import {
  getCurrentUser,
  loginUser,
  registerUser
} from './auth.service';

export const registerController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const body = registerSchema.parse(request.body);
  const user = await registerUser(body);
  return reply.code(201).send(user);
};

export const loginController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const body = loginSchema.parse(request.body);
  const token = await loginUser(body);
  return reply.code(200).send(token);
};

export const meController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  if (request.user === undefined) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }

  const user = await getCurrentUser(request.user);
  return reply.code(200).send(user);
};
