import type { FastifyInstance } from 'fastify';

import { authenticate } from '../../common/hooks/auth.hook';
import { getVerdictController } from './verdict.controller';

export async function registerVerdictRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/:id/verdict', { preHandler: [authenticate] }, getVerdictController);
}
