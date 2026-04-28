"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugins = registerPlugins;
const zod_1 = require("zod");
const app_error_1 = require("../common/errors/app-error");
const validation_error_1 = require("../common/errors/validation-error");
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
    fastify.setErrorHandler((error, _request, reply) => {
        const statusCode = getStatusCode(error);
        const message = getErrorMessage(error, statusCode);
        fastify.log.error(error);
        void reply.status(statusCode).send({ error: message });
    });
}
