"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginResponseJsonSchema = exports.meResponseJsonSchema = exports.registerResponseJsonSchema = exports.loginBodyJsonSchema = exports.registerBodyJsonSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../../common/types");
const userJsonSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: [...types_1.roles] },
        createdAt: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'name', 'email', 'role', 'createdAt'],
    additionalProperties: false
};
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2),
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(8).max(64)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(1)
});
exports.registerBodyJsonSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 64 }
    },
    required: ['name', 'email', 'password'],
    additionalProperties: false
};
exports.loginBodyJsonSchema = {
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 }
    },
    required: ['email', 'password'],
    additionalProperties: false
};
exports.registerResponseJsonSchema = userJsonSchema;
exports.meResponseJsonSchema = userJsonSchema;
exports.loginResponseJsonSchema = {
    type: 'object',
    properties: {
        accessToken: { type: 'string' },
        expiresIn: { type: 'string', enum: ['1d'] }
    },
    required: ['accessToken', 'expiresIn'],
    additionalProperties: false
};
