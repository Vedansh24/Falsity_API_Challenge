"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meResponseJsonSchema = exports.loginResponseJsonSchema = exports.registerResponseJsonSchema = exports.loginBodyJsonSchema = exports.registerBodyJsonSchema = exports.loginSchema = exports.registerSchema = void 0;
// src/modules/auth/auth.schema.ts
const zod_1 = require("zod");
const roleEnum = ['USER', 'ANALYST', 'REVIEWER', 'ADMIN'];
const userProperties = {
    id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the user.',
    },
    name: {
        type: 'string',
        description: 'Display name of the user.',
    },
    email: {
        type: 'string',
        format: 'email',
        description: 'Email address of the user.',
    },
    role: {
        type: 'string',
        enum: [...roleEnum],
        description: 'Authorization role assigned to the user.',
    },
    createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'ISO timestamp when the user account was created.',
    }
};
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(64),
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
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 64,
            description: 'Name of the user to register.',
        },
        email: {
            type: 'string',
            format: 'email',
            description: 'Email address used for login and notifications.',
        },
        password: {
            type: 'string',
            minLength: 8,
            maxLength: 64,
            description: 'Plain-text password before hashing.',
        }
    },
    required: ['name', 'email', 'password'],
    additionalProperties: false
};
exports.loginBodyJsonSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            description: 'Registered email address.',
        },
        password: {
            type: 'string',
            minLength: 1,
            description: 'Password for the registered account.',
        }
    },
    required: ['email', 'password'],
    additionalProperties: false
};
exports.registerResponseJsonSchema = {
    type: 'object',
    properties: {
        status: {
            type: 'string',
            description: 'Operation status.',
        },
        data: {
            type: 'object',
            properties: userProperties,
            required: ['id', 'name', 'email', 'role', 'createdAt'],
            additionalProperties: false,
            description: 'Registered user details.'
        }
    },
    required: ['status', 'data'],
    additionalProperties: false
};
exports.loginResponseJsonSchema = {
    type: 'object',
    properties: {
        status: {
            type: 'string',
            description: 'Operation status.',
        },
        data: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'Signed JWT access token.',
                },
                expiresIn: {
                    type: 'string',
                    description: 'JWT expiration window.',
                }
            },
            required: ['accessToken', 'expiresIn'],
            additionalProperties: false,
            description: 'Token payload returned after successful login.'
        }
    },
    required: ['status', 'data'],
    additionalProperties: false
};
exports.meResponseJsonSchema = {
    type: 'object',
    properties: {
        status: {
            type: 'string',
            description: 'Operation status.',
        },
        data: {
            type: 'object',
            properties: userProperties,
            required: ['id', 'name', 'email', 'role', 'createdAt'],
            additionalProperties: false,
            description: 'Authenticated user details.'
        }
    },
    required: ['status', 'data'],
    additionalProperties: false
};
