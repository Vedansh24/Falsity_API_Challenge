import type { FastifyInstance } from 'fastify';
import { prisma } from '../../plugins/prisma';
import { getRedisClient } from '../../integrations/cache/redis.client';
import { closeQueues, closeWorkers } from '../../jobs/bullmq.client';

let shuttingDown = false;

export function registerGracefulShutdown(app?: FastifyInstance) {
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[shutdown] Received ${signal}, shutting down gracefully...`);

    try {
      if (app) {
        console.log('[shutdown] Closing Fastify server...');
        try {
          await app.close();
        } catch (err) {
          console.error('[shutdown] Error closing Fastify', err);
        }
      }

      console.log('[shutdown] Closing BullMQ workers...');
      try {
        await closeWorkers();
      } catch (err) {
        console.error('[shutdown] Error closing workers', err);
      }

      console.log('[shutdown] Closing BullMQ queues...');
      try {
        await closeQueues();
      } catch (err) {
        console.error('[shutdown] Error closing queues', err);
      }

      console.log('[shutdown] Disconnecting Prisma...');
      try {
        await prisma.$disconnect();
      } catch (err) {
        console.error('[shutdown] Error disconnecting Prisma', err);
      }

      console.log('[shutdown] Disconnecting Redis...');
      try {
        const redis = await getRedisClient();
        if (redis && typeof redis.disconnect === 'function') {
          await redis.disconnect();
        } else if (redis && typeof redis.quit === 'function') {
          await redis.quit();
        }
      } catch (err) {
        console.error('[shutdown] Error disconnecting Redis', err);
      }

      console.log('[shutdown] Shutdown complete. Exiting.');
      process.exit(0);
    } catch (err) {
      console.error('[shutdown] Unexpected error during shutdown', err);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
