"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = registerPlugins;
const zod_1 = require("zod");
const app_error_1 = require("../common/errors/app-error");
const validation_error_1 = require("../common/errors/validation-error");
const error_response_1 = require("../common/responses/error-response");
const api_response_1 = require("../common/responses/api-response");
const validation_1 = require("../common/utils/validation");
function getStatusCode(error) {
    if (error instanceof app_error_1.AppError) {
        return error.statusCode;
    }
    if (error instanceof zod_1.ZodError) {
        return 400;
    }
    if (typeof error === 'object' && error !== null && 'validation' in error) {
        return 400;
    }
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const statusCode = error.statusCode;
        if (typeof statusCode === 'number') {
            return statusCode;
        }
    }
    return 500;
}
function getErrorMessage(error, statusCode) {
    if (error instanceof zod_1.ZodError) {
        return 'Validation failure';
    }
    if (error instanceof validation_error_1.ValidationError) {
        return error.message;
    }
    if (statusCode >= 500) {
        return 'Internal server error';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Internal server error';
}
function registerPlugins(fastify) {
    // Standardize successful responses when controllers return raw payloads.
    fastify.addHook('onSend', async (_request, reply, payload) => {
        try {
            // Only wrap successful non-error responses
            const statusCode = reply.statusCode ?? 200;
            if (statusCode >= 400)
                return payload;
            // If payload is a string, try to parse JSON
            let parsed = payload;
            if (typeof payload === 'string') {
                try {
                    parsed = JSON.parse(payload);
                }
                catch {
                    // leave as-is (could be HTML or plain text)
                    return payload;
                }
            }
            // If already standardized, do nothing
            if (parsed && typeof parsed === 'object' && 'success' in parsed) {
                return payload;
            }
            // Build standardized success envelope
            const envelope = (0, api_response_1.createApiResponse)(parsed, 'Operation successful', null);
            return JSON.stringify(envelope);
        }
        catch (e) {
            fastify.log.error(e);
            return payload;
        }
    });
    fastify.setErrorHandler((error, _request, reply) => {
        const statusCode = getStatusCode(error);
        let message = getErrorMessage(error, statusCode);
        let code = 'ERROR';
        let details = [];
        if (error instanceof app_error_1.AppError) {
            code = error.code ?? code;
            details = error.details ? [error.details] : [];
        }
        if (error instanceof zod_1.ZodError) {
            details = (0, validation_1.formatZodErrors)(error);
            code = 'VALIDATION_ERROR';
            message = 'Validation failed';
        }
        if (typeof error === 'object' && error !== null && 'validation' in error) {
            // fastify-validator style
            // Include raw validation if present
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            details = error.validation || [];
            code = 'VALIDATION_ERROR';
            message = 'Validation failed';
        }
        fastify.log.error(error);
        const payload = (0, error_response_1.createErrorResponse)(message, String(code), Array.isArray(details) ? details : []);
        void reply.status(statusCode).send(payload);
    });
}
