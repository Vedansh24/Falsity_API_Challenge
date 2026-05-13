"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
exports.findById = findById;
exports.listByClaim = listByClaim;
const prisma_1 = require("../../plugins/prisma");
async function createComment(data) {
    const rec = await prisma_1.prisma.comment.create({
        data: {
            claimId: data.claimId,
            userId: data.userId,
            content: data.content,
            // If the schema includes visibility, Prisma will accept it; otherwise it's ignored.
            ...(data.visibility ? { visibility: data.visibility } : {})
        }
    });
    return rec;
}
async function updateComment(id, data) {
    const rec = await prisma_1.prisma.comment.update({
        where: { id },
        data: {
            ...(data.content !== undefined ? { content: data.content } : {})
        }
    });
    return rec;
}
async function deleteComment(id) {
    await prisma_1.prisma.comment.delete({ where: { id } });
}
async function findById(id) {
    const rec = await prisma_1.prisma.comment.findUnique({ where: { id } });
    return rec;
}
async function listByClaim(claimId, options = {}) {
    const items = await prisma_1.prisma.comment.findMany({
        where: { claimId },
        orderBy: { createdAt: 'desc' },
        take: options.limit ?? 50,
        skip: options.offset ?? 0
    });
    return items;
}
