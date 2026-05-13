"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaimTimeline = getClaimTimeline;
const prisma_1 = require("../../../plugins/prisma");
const verdictService = __importStar(require("../../verdict/verdict.service"));
/**
 * Timeline aggregates audit logs, comments, and verdict history into a chronological feed.
 */
async function getClaimTimeline(claimId, options = {}) {
    const limit = options.limit ?? 50;
    const page = options.page ?? 1;
    const offset = (page - 1) * limit;
    // Fetch audit logs
    const audits = await prisma_1.prisma.auditLog.findMany({
        where: { entityType: 'CLAIM', entityId: claimId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });
    // Fetch comments
    const comments = await prisma_1.prisma.comment.findMany({
        where: { claimId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });
    // Fetch verdict history via service (already normalized)
    const verdictHistory = await verdictService.getVerdictHistoryService(claimId, limit);
    const items = [];
    for (const a of audits) {
        items.push({
            id: a.id,
            type: a.action,
            performedBy: a.userId ? { id: a.userId } : null,
            timestamp: a.createdAt,
            metadata: a.metadata
        });
    }
    for (const c of comments) {
        items.push({
            id: c.id,
            type: 'COMMENT',
            performedBy: { id: c.userId },
            timestamp: c.createdAt,
            description: c.content,
            metadata: { visibility: c.visibility }
        });
    }
    for (const v of verdictHistory) {
        items.push({
            id: v.id,
            type: 'VERDICT_HISTORY',
            // Verdict history shape can vary depending on Prisma client version; be defensive.
            performedBy: v.publishedById ? { id: v.publishedById } : null,
            timestamp: v.createdAt ?? new Date(),
            description: `${v.verdictType || v.verdict || 'VERDICT'} (${v.falsityScore ?? ''})`,
            metadata: v
        });
    }
    // Sort chronologically desc
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    // Optional filtering by type
    const filtered = options.type ? items.filter((i) => i.type === options.type) : items;
    // Simple pagination already applied at DB level; return slice up to limit
    return filtered.slice(0, limit);
}
