"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
const app_error_1 = require("./app-error");
class AuthError extends app_error_1.AppError {
    constructor(statusCode, message, details) {
        super(statusCode, message, 'AUTH_ERROR', details);
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
