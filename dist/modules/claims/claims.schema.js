"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClaimsResponseJsonSchema = exports.claimResponseJsonSchema = exports.listClaimsQueryJsonSchema = exports.claimIdParamsJsonSchema = exports.updateClaimBodyJsonSchema = exports.createClaimBodyJsonSchema = exports.listClaimsQuerySchema = exports.claimIdParamsSchema = exports.updateClaimSchema = exports.createClaimSchema = void 0;
const zod_1 = require("zod");
const claimStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
const claimProperties = {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    statement: { type: 'string' },
    status: { type: 'string', enum: [...claimStatuses] },
    submittedById: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};
exports.createClaimSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3).max(200),
    statement: zod_1.z.string().trim().min(10).max(5000)
});
exports.updateClaimSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3).max(200).optional(),
    statement: zod_1.z.string().trim().min(10).max(5000).optional()
}).refine((value) => value.title !== undefined || value.statement !== undefined, {
    message: 'At least one field must be provided for update.'
});
exports.claimIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
exports.listClaimsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(claimStatuses).optional(),
    submittedById: zod_1.z.string().uuid().optional()
});
exports.createClaimBodyJsonSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 3, maxLength: 200 },
        statement: { type: 'string', minLength: 10, maxLength: 5000 }
    },
    required: ['title', 'statement'],
    additionalProperties: false
};
exports.updateClaimBodyJsonSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', minLength: 3, maxLength: 200 },
        statement: { type: 'string', minLength: 10, maxLength: 5000 }
    },
    additionalProperties: false,
    anyOf: [
        { required: ['title'] },
        { required: ['statement'] }
    ]
};
exports.claimIdParamsJsonSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' }
    },
    required: ['id'],
    additionalProperties: false
};
exports.listClaimsQueryJsonSchema = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        status: { type: 'string', enum: [...claimStatuses] },
        submittedById: { type: 'string', format: 'uuid' }
    },
    additionalProperties: false
};
exports.claimResponseJsonSchema = {
    type: 'object',
    properties: {
        status: { type: 'string' },
        data: {
            type: 'object',
            properties: claimProperties,
            required: ['id', 'title', 'statement', 'status', 'submittedById', 'createdAt', 'updatedAt'],
            additionalProperties: false
        }
    },
    required: ['status', 'data'],
    additionalProperties: false
};
exports.listClaimsResponseJsonSchema = {
    type: 'object',
    properties: {
        status: { type: 'string' },
        data: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: claimProperties,
                        required: ['id', 'title', 'statement', 'status', 'submittedById', 'createdAt', 'updatedAt'],
                        additionalProperties: false
                    }
                },
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
            },
            required: ['items', 'page', 'pageSize', 'total', 'totalPages'],
            additionalProperties: false
        }
    },
    required: ['status', 'data'],
    additionalProperties: false
};
