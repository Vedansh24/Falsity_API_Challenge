"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const app_error_1 = require("./app-error");
class NotFoundError extends app_error_1.AppError {
    constructor(message, details) {
        super(404, message, 'NOT_FOUND_ERROR', details);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
