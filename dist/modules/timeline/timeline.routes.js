"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTimelineRoutes = registerTimelineRoutes;
const timeline_service_1 = require("./services/timeline.service");
async function registerTimelineRoutes(fastify) {
    fastify.get('/:id/timeline', async (request, reply) => {
        const params = request.params;
        const q = request.query;
        const opts = {
            limit: q.limit ? parseInt(q.limit, 10) : undefined,
            page: q.page ? parseInt(q.page, 10) : undefined,
            type: q.type
        };
        const result = await (0, timeline_service_1.getClaimTimeline)(params.id, opts);
        return reply.code(200).send(result);
    });
}
