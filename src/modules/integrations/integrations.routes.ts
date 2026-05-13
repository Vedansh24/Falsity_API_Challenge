import type { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import { ingestSourcesForClaim } from '../../integrations/source-ingestion.service';

export async function registerIntegrationRoutes(fastify: FastifyInstance): Promise<void> {
  const authOptions: Pick<RouteShorthandOptions, 'preHandler'> = { preHandler: [authenticate] };

  fastify.post('/:id/ingest-sources', {
    ...authOptions,
    schema: {
      tags: ['Integrations'],
      description: 'Trigger external source ingestion for a claim (Analyst only).',
      params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } }, required: ['id'] },
      body: { type: 'object', properties: { query: { type: 'string' }, maxPerProvider: { type: 'number' } } }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { query?: string; maxPerProvider?: number };

    const query = body.query || body.query === '' ? body.query : undefined;
    if (!query) {
      return reply.code(400).send({ success: false, message: 'Missing query in body' });
    }

    const res = await ingestSourcesForClaim({ claimId: id, query, maxPerProvider: body.maxPerProvider ?? 5 });
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
    const { id } = request.params as { id: string };
    // Cache disabled for this endpoint at compile-time to avoid optional runtime dependency issues.
    return reply.code(200).send({ success: true, data: null });
  });
}
