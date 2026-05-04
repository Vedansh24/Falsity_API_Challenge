import type { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import { createEvidenceSchema } from './evidence.schema';
import { createEvidenceController } from './evidence.controller';

/**
 * Register evidence routes.
 * POST /api/v1/claims/:id/evidence - Create evidence for a claim
 */
export async function registerEvidenceRoutes(fastify: FastifyInstance): Promise<void> {
  const baseProtectedOptions: Pick<RouteShorthandOptions, 'preHandler'> = {
    preHandler: [authenticate]
  };

  const createEvidenceRouteOptions: RouteShorthandOptions = {
    ...baseProtectedOptions,
    schema: {
      tags: ['Evidence'],
      description:
        'Add evidence to a claim for testing the verdict engine. Requires authentication.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Claim ID'
          }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          sourceType: {
            type: 'string',
            enum: ['GOVERNMENT', 'NEWS', 'RESEARCH', 'BLOG', 'SOCIAL', 'INTERNAL']
          },
          sourceUrl: {
            type: 'string',
            format: 'uri'
          },
          stance: {
            type: 'string',
            enum: ['SUPPORTS', 'CONTRADICTS', 'NEUTRAL']
          },
          credibilityScore: {
            type: 'number',
            minimum: 0,
            maximum: 1
          },
          relevanceScore: {
            type: 'number',
            minimum: 0,
            maximum: 1
          },
          freshnessScore: {
            type: 'number',
            minimum: 0,
            maximum: 1
          },
          reviewerConfidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          }
        },
        required: [
          'sourceType',
          'sourceUrl',
          'stance',
          'credibilityScore',
          'relevanceScore',
          'freshnessScore',
          'reviewerConfidence'
        ]
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object'
            }
          }
        }
      }
    }
  };

  fastify.post<{
    Params: { id: string };
    Body: {
      sourceType: string;
      sourceUrl: string;
      stance: 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';
      credibilityScore: number;
      relevanceScore: number;
      freshnessScore: number;
      reviewerConfidence: number;
    };
  }>(
    '/:id/evidence',
    createEvidenceRouteOptions,
    createEvidenceController
  );
}
