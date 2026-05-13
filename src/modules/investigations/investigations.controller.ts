import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { AuthError } from '../../common/errors/auth-error';
import {
  assignAnalystBodySchema,
  requestMoreEvidenceBodySchema,
  publishVerdictBodySchema,
  claimIdParamsSchema
} from './investigations.schema';
import {
  assignAnalystService,
  requestMoreEvidenceService,
  readyForVerdictService,
  publishVerdictService,
  archiveClaimService
} from './investigations.service';

function requireAuthenticatedUser(request: FastifyRequest) {
  if (request.user === undefined) {
    throw new AuthError(401, 'Invalid or expired token');
  }

  return request.user;
}

export const assignAnalystController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const body = assignAnalystBodySchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await assignAnalystService(params.id, body.analystId, currentUser);
  return reply.code(200).send(claim);
};

export const requestMoreEvidenceController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const body = requestMoreEvidenceBodySchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await requestMoreEvidenceService(params.id, body.notes, currentUser);
  return reply.code(200).send(claim);
};

export const readyForVerdictController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await readyForVerdictService(params.id, currentUser);
  return reply.code(200).send(claim);
};

export const publishVerdictController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const body = publishVerdictBodySchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await publishVerdictService(
    params.id,
    {
      verdict: body.verdict,
      falsityScore: body.falsityScore ?? null,
      confidenceScore: body.confidenceScore ?? null,
      reasoning: body.reasoning ?? null
    },
    currentUser
  );
  return reply.code(200).send(claim);
};

export const archiveClaimController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const params = claimIdParamsSchema.parse(request.params);
  const currentUser = requireAuthenticatedUser(request);

  const claim = await archiveClaimService(params.id, currentUser);
  return reply.code(200).send(claim);
};
