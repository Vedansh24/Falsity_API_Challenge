"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = void 0;
const app_error_1 = require("./app-error");
class ExternalServiceError extends app_error_1.AppError {
    constructor(message = 'External service error', details) {
        super(502, message, 'EXTERNAL_SERVICE_ERROR', details);
        this.name = 'ExternalServiceError';
    }
}
exports.ExternalServiceError = ExternalServiceError;
