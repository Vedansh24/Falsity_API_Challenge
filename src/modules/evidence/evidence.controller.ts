import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthError } from '../../common/errors/auth-error';
import { createEvidenceSchema } from './evidence.schema';
import * as service from './evidence.service';
import { recomputeVerdictService } from '../verdict/verdict.service';

interface CreateEvidenceParams {
  id: string;
}

interface EvidenceParams {
  id: string;
  evidenceId: string;
}

interface CreateEvidenceBody {
  sourceType: string;
  sourceUrl: string;
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  reviewerConfidence: number;
}

interface UpdateEvidenceBody {
  sourceType?: string;
  stance?: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
  credibilityScore?: number;
  relevanceScore?: number;
  freshnessScore?: number;
  reviewerConfidence?: number;
}

function requireAuthenticatedUser(request: FastifyRequest) {
  if (request.user === undefined) {
    throw new AuthError(401, 'Invalid or expired token');
  }

  return request.user;
}

/**
 * Create evidence for a claim.
 * POST /api/v1/claims/:id/evidence
 */
export async function createEvidenceController(
  request: FastifyRequest<{
    Params: CreateEvidenceParams;
    Body: CreateEvidenceBody;
  }>,
  reply: FastifyReply
): Promise<void> {
  const { id: claimId } = request.params;
  const validatedData = createEvidenceSchema.parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const evidence = await service.addEvidence(claimId, validatedData, currentUser);

  // Recompute verdict after evidence is added
  try {
    await recomputeVerdictService(claimId);
  } catch (err) {
    console.error('Failed to recompute verdict:', err);
  }

  reply.status(201).send({
    success: true,
    data: evidence
  });
}

/**
 * List evidence for a claim.
 * GET /api/v1/claims/:id/evidence
 */
export async function listEvidenceController(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
): Promise<void> {
  const { id: claimId } = request.params;
  requireAuthenticatedUser(request);

  const evidence = await service.getEvidenceForClaim(claimId);

  reply.status(200).send({
    success: true,
    data: evidence
  });
}

/**
 * Get a single evidence record.
 * GET /api/v1/claims/:id/evidence/:evidenceId
 */
export async function getEvidenceController(
  request: FastifyRequest<{
    Params: EvidenceParams;
  }>,
  reply: FastifyReply
): Promise<void> {
  const { evidenceId } = request.params;
  requireAuthenticatedUser(request);

  const evidence = await service.getEvidenceById(evidenceId);

  reply.status(200).send({
    success: true,
    data: evidence
  });
}

/**
 * Update evidence.
 * PATCH /api/v1/claims/:id/evidence/:evidenceId
 */
export async function updateEvidenceController(
  request: FastifyRequest<{
    Params: EvidenceParams;
    Body: UpdateEvidenceBody;
  }>,
  reply: FastifyReply
): Promise<void> {
  const { id: claimId, evidenceId } = request.params;
  const validatedData = createEvidenceSchema.partial().parse(request.body);
  const currentUser = requireAuthenticatedUser(request);

  const evidence = await service.updateEvidenceService(evidenceId, validatedData as UpdateEvidenceBody, currentUser);

  // Recompute verdict after evidence is updated
  try {
    await recomputeVerdictService(claimId);
  } catch (err) {
    console.error('Failed to recompute verdict:', err);
  }

  reply.status(200).send({
    success: true,
    data: evidence
  });
}

/**
 * Delete evidence.
 * DELETE /api/v1/claims/:id/evidence/:evidenceId
 */
export async function deleteEvidenceController(
  request: FastifyRequest<{
    Params: EvidenceParams;
  }>,
  reply: FastifyReply
): Promise<void> {
  const { id: claimId, evidenceId } = request.params;
  const currentUser = requireAuthenticatedUser(request);

  await service.deleteEvidenceService(evidenceId, currentUser);

  // Recompute verdict after evidence is deleted
  try {
    await recomputeVerdictService(claimId);
  } catch (err) {
    console.error('Failed to recompute verdict:', err);
  }

  reply.status(204).send();
}
