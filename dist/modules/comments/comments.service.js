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
exports.addComment = addComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
exports.listComments = listComments;
const repository = __importStar(require("./comments.repository"));
const comments_policy_service_1 = require("./comments-policy.service");
const claimsRepo = __importStar(require("../claims/claims.repository"));
const audit = __importStar(require("../audit/services/audit-log.service"));
async function addComment(claimId, user, content, visibility = 'PUBLIC') {
    const claim = await claimsRepo.findById(claimId);
    if (!claim)
        throw new Error('Claim not found');
    (0, comments_policy_service_1.validateCreateCommentVisibility)(visibility, user, claim.submittedById);
    const created = await repository.createComment({
        claimId,
        userId: user.userId,
        content,
        visibility
    });
    // Audit
    await audit.log({
        action: 'COMMENT_ADDED',
        entityType: 'CLAIM',
        entityId: claimId,
        performedById: user.userId,
        metadata: { commentId: created.id, visibility }
    });
    return created;
}
async function updateComment(commentId, user, content) {
    const existing = await repository.findById(commentId);
    if (!existing)
        throw new Error('Comment not found');
    // Only author or admin can edit
    if (existing.userId !== user.userId && user.role !== 'ADMIN') {
        throw new Error('Forbidden');
    }
    const updated = await repository.updateComment(commentId, { content });
    await audit.log({
        action: 'COMMENT_ADDED',
        entityType: 'COMMENT',
        entityId: commentId,
        performedById: user.userId,
        metadata: { updated: true }
    });
    return updated;
}
async function deleteComment(commentId, user) {
    const existing = await repository.findById(commentId);
    if (!existing)
        throw new Error('Comment not found');
    if (existing.userId !== user.userId && user.role !== 'ADMIN') {
        throw new Error('Forbidden');
    }
    await repository.deleteComment(commentId);
    await audit.log({
        action: 'EVIDENCE_DELETED',
        entityType: 'COMMENT',
        entityId: commentId,
        performedById: user.userId,
        metadata: { deleted: true }
    });
}
async function listComments(claimId, requester) {
    const items = await repository.listByClaim(claimId, { limit: 200 });
    if (!requester) {
        // Unauthenticated: filter to PUBLIC only
        return items.filter((i) => (i.visibility || 'PUBLIC') === 'PUBLIC');
    }
    return (0, comments_policy_service_1.filterVisibleCommentsForRequester)(items, requester);
}
