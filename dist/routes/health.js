"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoute = registerHealthRoute;
const healthOptions = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    status: { type: 'string' }
                },
                required: ['status'],
                additionalProperties: false
            }
        }
    }
};
const healthHandler = async (_request, reply) => {
    const response = { status: 'ok' };
    return reply.code(200).send(response);
};
function registerHealthRoute(fastify) {
    fastify.get('/health', healthOptions, healthHandler);
}
