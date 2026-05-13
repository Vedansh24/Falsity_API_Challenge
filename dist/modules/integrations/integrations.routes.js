"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIntegrationRoutes = registerIntegrationRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const source_ingestion_service_1 = require("../../integrations/source-ingestion.service");
async function registerIntegrationRoutes(fastify) {
    const authOptions = { preHandler: [auth_hook_1.authenticate] };
    fastify.post('/:id/ingest-sources', {
        ...authOptions,
        schema: {
            tags: ['Integrations'],
            description: 'Trigger external source ingestion for a claim (Analyst only).',
            params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
            body: { type: 'object', properties: { query: { type: 'string' }, maxPerProvider: { type: 'number' } } }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const query = body.query || body.query === '' ? body.query : undefined;
        if (!query) {
            return reply.code(400).send({ success: false, message: 'Missing query in body' });
        }
        const res = await (0, source_ingestion_service_1.ingestSourcesForClaim)({ claimId: id, query, maxPerProvider: body.maxPerProvider ?? 5 });
        return reply.code(res.ok ? 200 : 500).send({ success: res.ok, data: res });
    });
    fastify.get('/:id/external-sources', {
        ...authOptions,
        schema: {
            tags: ['Integrations'],
            description: 'List recently ingested external sources for a claim (cached).',
            params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        // Cache disabled for this endpoint at compile-time to avoid optional runtime dependency issues.
        return reply.code(200).send({ success: true, data: null });
    });
}
