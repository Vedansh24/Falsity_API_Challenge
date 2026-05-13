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
exports.deleteCommentController = exports.patchCommentController = exports.createCommentController = exports.listCommentsController = void 0;
const auth_error_1 = require("../../common/errors/auth-error");
const service = __importStar(require("./comments.service"));
function requireAuthenticatedUser(request) {
    if (request.user === undefined) {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
    return request.user;
}
const listCommentsController = async (request, reply) => {
    const params = request.params;
    const requester = request.user;
    const items = await service.listComments(params.id, requester);
    return reply.code(200).send(items);
};
exports.listCommentsController = listCommentsController;
const createCommentController = async (request, reply) => {
    const params = request.params;
    const body = request.body;
    const currentUser = requireAuthenticatedUser(request);
    const created = await service.addComment(params.id, currentUser, body.content, body.visibility ?? 'PUBLIC');
    return reply.code(201).send(created);
};
exports.createCommentController = createCommentController;
const patchCommentController = async (request, reply) => {
    const params = request.params;
    const body = request.body;
    const currentUser = requireAuthenticatedUser(request);
    const updated = await service.updateComment(params.id, currentUser, body.content);
    return reply.code(200).send(updated);
};
exports.patchCommentController = patchCommentController;
const deleteCommentController = async (request, reply) => {
    const params = request.params;
    const currentUser = requireAuthenticatedUser(request);
    await service.deleteComment(params.id, currentUser);
    return reply.code(204).send();
};
exports.deleteCommentController = deleteCommentController;
