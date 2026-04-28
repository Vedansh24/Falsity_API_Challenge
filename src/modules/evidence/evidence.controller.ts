import type { FastifyRequest, FastifyReply } from 'fastify';
import { createEvidenceSchema } from './evidence.schema';
import * as service from './evidence.service';

interface CreateEvidenceParams {
  id: string;
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
  try {
    // Extract claimId from route params
    const { id: claimId } = request.params;

    // Validate request body using Zod schema
    const validatedData = createEvidenceSchema.parse(request.body);

    // Call service to add evidence
    const evidence = await service.addEvidence(claimId, validatedData);

    // Return 201 Created response
    reply.status(201).send({
      success: true,
      data: evidence
    });
  } catch (error) {
    // Zod validation errors or service errors will be handled by Fastify error hooks
    throw error;
  }
}
