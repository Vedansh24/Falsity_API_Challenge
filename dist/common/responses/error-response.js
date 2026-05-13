"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = createErrorResponse;
function createErrorResponse(message, code = 'ERROR', details = []) {
    return {
        success: false,
        message,
        error: {
            code,
            details
        }
    };
}
