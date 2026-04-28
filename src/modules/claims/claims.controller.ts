import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';

import { AuthError } from '../../common/errors/auth-error';
import {
  claimIdParamsSchema,
  createClaimSchema,
  listClaimsQuerySchema,
  updateClaimSchema
} from './claims.schema';
import {
  createClaimService,
  getClaimByIdService,
  listClaimsService,
  submitClaimService,
  updateClaimService
} from './claims.service';

function requireAuthenticatedUser(request: FastifyRequest) {
  if (request.user === undefined) {
    throw new AuthError(401, 'Invalid or expired token');
  }

  return request.user;
}

export const createClaimController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const body = createClaimSchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await createClaimService({ statement: body.statement } as any, currentUser);
  return reply.code(201).send(claim);
};

export const listClaimsController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const query = listClaimsQuerySchema.parse(request.query);
  const claims = await listClaimsService(query);

  return reply.code(200).send(claims);
};

export const getClaimByIdController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const claim = await getClaimByIdService(params.id);

  return reply.code(200).send(claim);
};

export const updateClaimController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const body = updateClaimSchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await updateClaimService(params.id, body, currentUser);
  return reply.code(200).send(claim);
};

export const submitClaimController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await submitClaimService(params.id, currentUser);
  return reply.code(200).send(claim);
};
