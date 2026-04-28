"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.registerPrisma = registerPrisma;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function registerPrisma(fastify) {
    fastify.decorate('prisma', exports.prisma);
    fastify.addHook('onClose', async () => {
        await exports.prisma.$disconnect();
    });
}
