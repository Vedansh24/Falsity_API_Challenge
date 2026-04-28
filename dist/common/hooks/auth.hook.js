"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const auth_error_1 = require("../errors/auth-error");
async function authenticate(request) {
    try {
        await request.jwtVerify();
    }
    catch {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
}
