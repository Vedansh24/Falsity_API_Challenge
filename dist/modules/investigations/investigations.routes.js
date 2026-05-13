"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInvestigationRoutes = registerInvestigationRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const role_hook_1 = require("../../common/hooks/role.hook");
const api_response_1 = require("../../common/responses/api-response");
const investigations_schema_1 = require("./investigations.schema");
const investigations_controller_1 = require("./investigations.controller");
function wrapSuccessResponse(payload) {
    return (0, api_response_1.createApiResponse)(payload);
}
const baseProtectedOptions = {
    preHandler: [auth_hook_1.authenticate]
};
const assignAnalystRouteOptions = {
    preHandler: [auth_hook_1.authenticate, (0, role_hook_1.requireRole)('REVIEWER', 'ADMIN')],
    schema: {
        tags: ['Investigations'],
        description: 'Assign an analyst to investigate a claim. Only REVIEWER or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: investigations_schema_1.claimIdParamsJsonSchema,
        body: investigations_schema_1.assignAnalystBodyJsonSchema,
        response: {
            200: investigations_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const requestMoreEvidenceRouteOptions = {
    preHandler: [auth_hook_1.authenticate, (0, role_hook_1.requireRole)('ANALYST', 'REVIEWER', 'ADMIN')],
    schema: {
        tags: ['Investigations'],
        description: 'Request more evidence for a claim. Only ANALYST, REVIEWER, or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: investigations_schema_1.claimIdParamsJsonSchema,
        body: investigations_schema_1.requestMoreEvidenceBodyJsonSchema,
        response: {
            200: investigations_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const readyForVerdictRouteOptions = {
    preHandler: [auth_hook_1.authenticate, (0, role_hook_1.requireRole)('ANALYST', 'REVIEWER', 'ADMIN')],
    schema: {
        tags: ['Investigations'],
        description: 'Mark claim as ready for verdict. Only ANALYST, REVIEWER, or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: investigations_schema_1.claimIdParamsJsonSchema,
        response: {
            200: investigations_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const publishVerdictRouteOptions = {
    preHandler: [auth_hook_1.authenticate, (0, role_hook_1.requireRole)('REVIEWER', 'ADMIN')],
    schema: {
        tags: ['Investigations'],
        description: 'Publish a final verdict for a claim. Only REVIEWER or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: investigations_schema_1.claimIdParamsJsonSchema,
        body: investigations_schema_1.publishVerdictBodyJsonSchema,
        response: {
            200: investigations_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const archiveClaimRouteOptions = {
    preHandler: [auth_hook_1.authenticate, (0, role_hook_1.requireRole)('REVIEWER', 'ADMIN')],
    schema: {
        tags: ['Investigations'],
        description: 'Archive a published claim. Only REVIEWER or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: investigations_schema_1.claimIdParamsJsonSchema,
        response: {
            200: investigations_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
async function registerInvestigationRoutes(fastify) {
    // Workflow endpoints
    fastify.post('/:id/assign-analyst', assignAnalystRouteOptions, investigations_controller_1.assignAnalystController);
    fastify.post('/:id/request-more-evidence', requestMoreEvidenceRouteOptions, investigations_controller_1.requestMoreEvidenceController);
    fastify.post('/:id/ready-for-verdict', readyForVerdictRouteOptions, investigations_controller_1.readyForVerdictController);
    fastify.post('/:id/publish', publishVerdictRouteOptions, investigations_controller_1.publishVerdictController);
    fastify.post('/:id/archive', archiveClaimRouteOptions, investigations_controller_1.archiveClaimController);
}
