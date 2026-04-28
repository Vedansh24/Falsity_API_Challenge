import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { requestIdHook } from './common/hooks/request-id.hook';
import { responseTimeHook } from './common/hooks/response-time.hook';
import { createLoggerOptions } from './config/logger';
import { registerPlugins } from './plugins';
import jwtPlugin from './plugins/jwt';
import { registerPrisma } from './plugins/prisma';
import { registerSwagger } from './plugins/swagger';
import { registerRoutes } from './routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: createLoggerOptions() });

  await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true
  });

  registerPlugins(app);
  app.addHook('onRequest', requestIdHook);
  app.addHook('onSend', responseTimeHook);
  await registerPrisma(app);
  await app.register(jwtPlugin);
  await registerSwagger(app);
  await app.register(registerRoutes);

  return app;
}