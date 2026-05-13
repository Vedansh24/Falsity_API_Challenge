import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../common/hooks/auth.hook';
import { getClaimTimeline } from './services/timeline.service';

export async function registerTimelineRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id/timeline', async (request, reply) => {
    const params = request.params as { id: string };
    const q = request.query as { limit?: string; page?: string; type?: string };

    const opts: any = {
      limit: q.limit ? parseInt(q.limit, 10) : undefined,
      page: q.page ? parseInt(q.page, 10) : undefined,
      type: q.type
    };
    const result = await getClaimTimeline(params.id, opts);

    return reply.code(200).send(result);
  });
}
