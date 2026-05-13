import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';

import { AuthError } from '../../../common/errors/auth-error';
import { JWT_EXPIRES_IN } from '../../../config/constants';

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
  const payload = await loginUser(body);
  const accessToken = request.server.jwt.sign(payload, { expiresIn: JWT_EXPIRES_IN });

  return reply.code(200).send({
    accessToken,
    expiresIn: JWT_EXPIRES_IN
  });
};

export const meController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  if (request.user === undefined) {
    throw new AuthError(401, 'Invalid or expired token');
  }

  const user = await getCurrentUser(request.user);
  return reply.code(200).send(user);
};
