"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPingRoute = registerPingRoute;
const pingOptions = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                },
                required: ['message'],
                additionalProperties: false
            }
        }
    }
};
const pingHandler = async (_request, reply) => {
    const response = { message: 'pong' };
    return reply.code(200).send(response);
};
function registerPingRoute(fastify) {
    fastify.get('/api/v1/ping', pingOptions, pingHandler);
}
