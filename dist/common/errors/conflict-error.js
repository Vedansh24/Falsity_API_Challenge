"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const app_error_1 = require("./app-error");
class ConflictError extends app_error_1.AppError {
    constructor(message, details) {
        super(409, message, 'CONFLICT_ERROR', details);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
