"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdHook = requestIdHook;
async function requestIdHook(request, _reply) {
    _reply.header('x-request-id', request.id);
}
