"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const app_error_1 = require("./app-error");
class ForbiddenError extends app_error_1.AppError {
    constructor(message = 'Forbidden', details) {
        super(403, message, 'FORBIDDEN', details);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
