"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../lib/jwt");
function isRole(value) {
    return value === 'USER' || value === 'ANALYST' || value === 'REVIEWER' || value === 'ADMIN';
}
function extractToken(authorizationHeader) {
    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return null;
    }
    const token = match[1]?.trim();
    return token && token.length > 0 ? token : null;
}
function isAuthenticatedPayload(payload) {
    return (payload !== null &&
        typeof payload.userId === 'string' &&
        typeof payload.role === 'string' &&
        isRole(payload.role));
}
async function authenticate(request, reply) {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader === undefined) {
        void reply.code(401).send({ error: 'Authorization header missing' });
        return;
    }
    const token = extractToken(authorizationHeader);
    if (token === null) {
        void reply.code(401).send({ error: 'Invalid or expired token' });
        return;
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (!isAuthenticatedPayload(payload)) {
        void reply.code(401).send({ error: 'Invalid or expired token' });
        return;
    }
    request.user = {
        userId: payload.userId,
        role: payload.role
    };
}
