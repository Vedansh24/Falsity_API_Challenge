"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvidenceRoutes = registerEvidenceRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const evidence_controller_1 = require("./evidence.controller");
/**
 * Register evidence routes.
 * POST /api/v1/claims/:id/evidence - Create evidence for a claim
 */
async function registerEvidenceRoutes(fastify) {
    const baseProtectedOptions = {
        preHandler: [auth_hook_1.authenticate]
    };
    const createEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'Add evidence to a claim for testing the verdict engine. Requires authentication.',
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
    fastify.post('/claims/:id/evidence', createEvidenceRouteOptions, evidence_controller_1.createEvidenceController);
}
