import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { swaggerDocumentOptions, swaggerUiOptions } from '../config/docs';

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger as never, swaggerDocumentOptions as never);
  await fastify.register(swaggerUi as never, swaggerUiOptions as never);
}
