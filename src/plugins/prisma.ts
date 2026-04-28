import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

export const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export async function registerPrisma(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}
