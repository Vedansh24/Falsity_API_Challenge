"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const prisma_1 = require("../../../plugins/prisma");
/**
 * Centralized audit logging service.
 * All modules should call `log` to record important events.
 * Failures are safe: errors are caught so audit failures won't crash workflows.
 */
async function log(input) {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: input.performedById ?? null,
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                // Prisma JSON typing is strict; cast to any to avoid type incompatibilities at compile time.
                metadata: input.metadata
            }
        });
    }
    catch (err) {
        // Non-fatal: audit failures must not interrupt business logic.
        // Log to console for visibility in server logs.
        // eslint-disable-next-line no-console
        console.error('Failed to write audit log', { err, input });
    }
}
exports.default = { log };
