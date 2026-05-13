"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommentsRoutes = registerCommentsRoutes;
const auth_hook_1 = require("../../common/hooks/auth.hook");
const comments_controller_1 = require("./comments.controller");
async function registerCommentsRoutes(fastify) {
    // List comments for a claim (public or filtered by policy)
    fastify.get('/:id/comments', comments_controller_1.listCommentsController);
    // Create a comment on a claim (authenticated)
    fastify.post('/:id/comments', { preHandler: [auth_hook_1.authenticate] }, comments_controller_1.createCommentController);
    // Update a comment (authenticated)
    fastify.patch('/comments/:id', { preHandler: [auth_hook_1.authenticate] }, comments_controller_1.patchCommentController);
    // Delete a comment (authenticated)
    fastify.delete('/comments/:id', { preHandler: [auth_hook_1.authenticate] }, comments_controller_1.deleteCommentController);
}
