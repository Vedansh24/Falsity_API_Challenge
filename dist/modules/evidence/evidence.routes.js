"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvidenceRoutes = registerEvidenceRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const evidence_controller_1 = require("./evidence.controller");
/**
 * Register evidence routes.
 * POST /api/v1/claims/:id/evidence - Create evidence for a claim
 * GET /api/v1/claims/:id/evidence - List evidence for a claim
 * GET /api/v1/claims/:id/evidence/:evidenceId - Get single evidence
 * PATCH /api/v1/claims/:id/evidence/:evidenceId - Update evidence
 * DELETE /api/v1/claims/:id/evidence/:evidenceId - Delete evidence
 */
async function registerEvidenceRoutes(fastify) {
    const baseProtectedOptions = {
        preHandler: [auth_hook_1.authenticate]
    };
    // POST - Create evidence
    const createEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'Add evidence to a claim. Requires authentication.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'Claim ID' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    sourceType: { type: 'string', enum: ['GOVERNMENT', 'NEWS', 'RESEARCH_PAPER', 'BLOG', 'SOCIAL_MEDIA', 'INTERNAL_REPORT'] },
                    sourceUrl: { type: 'string', format: 'uri' },
                    stance: { type: 'string', enum: ['SUPPORTS', 'CONTRADICTS', 'NEUTRAL'] },
                    credibilityScore: { type: 'number', minimum: 0, maximum: 1 },
                    relevanceScore: { type: 'number', minimum: 0, maximum: 1 },
                    freshnessScore: { type: 'number', minimum: 0, maximum: 1 },
                    reviewerConfidence: { type: 'number', minimum: 0, maximum: 1 }
                },
                required: ['sourceType', 'sourceUrl', 'stance', 'credibilityScore', 'relevanceScore', 'freshnessScore', 'reviewerConfidence']
            },
            response: { 201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } } }
        }
    };
    // GET - List evidence
    const listEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'List all evidence for a claim. Requires authentication.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid', description: 'Claim ID' } },
                required: ['id']
            },
            response: { 200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } } }
        }
    };
    // GET - Get single evidence
    const getEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'Get a single evidence record. Requires authentication.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'Claim ID' },
                    evidenceId: { type: 'string', format: 'uuid', description: 'Evidence ID' }
                },
                required: ['id', 'evidenceId']
            }
        }
    };
    // PATCH - Update evidence
    const updateEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'Update evidence scores and metadata. Requires authentication.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    evidenceId: { type: 'string', format: 'uuid' }
                },
                required: ['id', 'evidenceId']
            },
            body: {
                type: 'object',
                properties: {
                    sourceType: { type: 'string' },
                    stance: { type: 'string' },
                    credibilityScore: { type: 'number' },
                    relevanceScore: { type: 'number' },
                    freshnessScore: { type: 'number' },
                    reviewerConfidence: { type: 'number' }
                }
            }
        }
    };
    // DELETE - Delete evidence
    const deleteEvidenceRouteOptions = {
        ...baseProtectedOptions,
        schema: {
            tags: ['Evidence'],
            description: 'Delete evidence. Requires authentication.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    evidenceId: { type: 'string', format: 'uuid' }
                },
                required: ['id', 'evidenceId']
            }
        }
    };
    // Register routes
    fastify.post('/:id/evidence', createEvidenceRouteOptions, evidence_controller_1.createEvidenceController);
    fastify.get('/:id/evidence', listEvidenceRouteOptions, evidence_controller_1.listEvidenceController);
    fastify.get('/:id/evidence/:evidenceId', getEvidenceRouteOptions, evidence_controller_1.getEvidenceController);
    fastify.patch('/:id/evidence/:evidenceId', updateEvidenceRouteOptions, evidence_controller_1.updateEvidenceController);
    fastify.delete('/:id/evidence/:evidenceId', deleteEvidenceRouteOptions, evidence_controller_1.deleteEvidenceController);
}
