"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseTimeHook = responseTimeHook;
async function responseTimeHook(request, reply) {
    reply.header('x-response-time', `${reply.elapsedTime.toFixed(2)}ms`);
}
