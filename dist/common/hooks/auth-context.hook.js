"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authContextHook = authContextHook;
async function authContextHook(request, _reply) {
    if (request.user !== undefined) {
        request.authContext = request.user;
    }
}
