"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
const api_response_1 = require("../../common/responses/api-response");
function wrapSuccessResponse(payload) {
    return (0, api_response_1.createApiResponse)(payload);
}
const registerRouteOptions = {
    schema: {
        tags: ['Auth'],
        description: 'Register a new user account',
        body: auth_schema_1.registerBodyJsonSchema,
        response: {
            201: auth_schema_1.registerResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const loginRouteOptions = {
    schema: {
        tags: ['Auth'],
        description: 'Login and receive a JWT access token',
        body: auth_schema_1.loginBodyJsonSchema,
        response: {
            200: auth_schema_1.loginResponseJsonSchema
        }
    },
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
const meRouteOptions = {
    schema: {
        tags: ['Auth'],
        description: 'Get the currently authenticated user (requires Bearer token)',
        security: [{ bearerAuth: [] }],
        response: {
            200: auth_schema_1.meResponseJsonSchema
        }
    },
    preHandler: [auth_hook_1.authenticate],
    preSerialization: async (_request, _reply, payload) => wrapSuccessResponse(payload)
};
async function registerAuthRoutes(fastify) {
    fastify.post('/register', registerRouteOptions, auth_controller_1.registerController);
    fastify.post('/login', loginRouteOptions, auth_controller_1.loginController);
    fastify.get('/me', meRouteOptions, auth_controller_1.meController);
}
