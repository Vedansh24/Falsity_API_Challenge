"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClaimsRoutes = registerClaimsRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const api_response_1 = require("../../common/responses/api-response");
const claims_schema_1 = require("./claims.schema");
const claims_controller_1 = require("./claims.controller");
function wrapSuccessResponse(payload) {
    return (0, api_response_1.createApiResponse)(payload);
}
const baseProtectedOptions = {
    preHandler: [auth_hook_1.authenticate]
};
const createClaimRouteOptions = {
    ...baseProtectedOptions,
    schema: {
        tags: ['Claims'],
        description: 'Create a new claim with DRAFT status owned by the authenticated user.',
        security: [{ bearerAuth: [] }],
        body: claims_schema_1.createClaimBodyJsonSchema,
        response: {
            201: claims_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const listClaimsRouteOptions = {
    ...baseProtectedOptions,
    schema: {
        tags: ['Claims'],
        description: 'List claims with pagination and optional status/owner filters.',
        security: [{ bearerAuth: [] }],
        querystring: claims_schema_1.listClaimsQueryJsonSchema,
        response: {
            200: claims_schema_1.listClaimsResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const getClaimByIdRouteOptions = {
    ...baseProtectedOptions,
    schema: {
        tags: ['Claims'],
        description: 'Get full claim details by id.',
        security: [{ bearerAuth: [] }],
        params: claims_schema_1.claimIdParamsJsonSchema,
        response: {
            200: claims_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const updateClaimRouteOptions = {
    ...baseProtectedOptions,
    schema: {
        tags: ['Claims'],
        description: 'Update a DRAFT claim owned by the authenticated user.',
        security: [{ bearerAuth: [] }],
        params: claims_schema_1.claimIdParamsJsonSchema,
        body: claims_schema_1.updateClaimBodyJsonSchema,
        response: {
            200: claims_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const submitClaimRouteOptions = {
    ...baseProtectedOptions,
    schema: {
        tags: ['Claims'],
        description: 'Submit a DRAFT claim (DRAFT -> SUBMITTED) for the owner only.',
        security: [{ bearerAuth: [] }],
        params: claims_schema_1.claimIdParamsJsonSchema,
        response: {
            200: claims_schema_1.claimResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
async function registerClaimsRoutes(fastify) {
    fastify.post('/', createClaimRouteOptions, claims_controller_1.createClaimController);
    fastify.get('/', listClaimsRouteOptions, claims_controller_1.listClaimsController);
    fastify.get('/:id', getClaimByIdRouteOptions, claims_controller_1.getClaimByIdController);
    fastify.patch('/:id', updateClaimRouteOptions, claims_controller_1.updateClaimController);
    fastify.post('/:id/submit', submitClaimRouteOptions, claims_controller_1.submitClaimController);
}
