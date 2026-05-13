import { buildApp, initializePhase8Infrastructure } from './app';
import { config } from './config/env';
import { registerGracefulShutdown } from './common/system/graceful-shutdown';

const start = async () => {
  const app = await buildApp();

  // Initialize Phase 8: background jobs and workers
  await initializePhase8Infrastructure();

  // Register graceful shutdown handlers
  registerGracefulShutdown(app);

  await app.listen({ host: config.HOST, port: config.PORT });
};

start();