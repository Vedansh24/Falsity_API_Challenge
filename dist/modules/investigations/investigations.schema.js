"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimResponseJsonSchema = exports.publishVerdictBodyJsonSchema = exports.requestMoreEvidenceBodyJsonSchema = exports.assignAnalystBodyJsonSchema = exports.claimIdParamsJsonSchema = exports.publishVerdictBodySchema = exports.requestMoreEvidenceBodySchema = exports.assignAnalystBodySchema = exports.claimIdParamsSchema = void 0;
const zod_1 = require("zod");
exports.claimIdParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
exports.assignAnalystBodySchema = zod_1.z.object({
    analystId: zod_1.z.string().uuid()
});
exports.requestMoreEvidenceBodySchema = zod_1.z.object({
    notes: zod_1.z.string().trim().min(1).max(1000).optional()
});
exports.publishVerdictBodySchema = zod_1.z.object({
    verdict: zod_1.z.string().trim().min(1).max(100),
    falsityScore: zod_1.z.number().min(0).max(1).optional(),
    confidenceScore: zod_1.z.number().min(0).max(1).optional(),
    reasoning: zod_1.z.string().trim().min(1).max(5000).optional()
});
// JSON Schemas for Swagger/OpenAPI
exports.claimIdParamsJsonSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' }
    },
    required: ['id'],
    additionalProperties: false
};
exports.assignAnalystBodyJsonSchema = {
    type: 'object',
    properties: {
        analystId: { type: 'string', format: 'uuid' }
    },
    required: ['analystId'],
    additionalProperties: false
};
exports.requestMoreEvidenceBodyJsonSchema = {
    type: 'object',
    properties: {
        notes: { type: 'string', minLength: 1, maxLength: 1000 }
    },
    additionalProperties: false
};
exports.publishVerdictBodyJsonSchema = {
    type: 'object',
    properties: {
        verdict: { type: 'string', minLength: 1, maxLength: 100 },
        falsityScore: { type: 'number', minimum: 0, maximum: 1 },
        confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
        reasoning: { type: 'string', minLength: 1, maxLength: 5000 }
    },
    required: ['verdict'],
    additionalProperties: false
};
const claimProperties = {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    statement: { type: 'string' },
    status: { type: 'string' },
    submittedById: { type: 'string', format: 'uuid' },
    category: { type: 'string' },
    publicSlug: { type: 'string' },
    currentAnalystId: { type: 'string', format: 'uuid' },
    currentReviewerId: { type: 'string', format: 'uuid' },
    submittedAt: { type: 'string', format: 'date-time' },
    publishedAt: { type: 'string', format: 'date-time' },
    archivedAt: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};
exports.claimResponseJsonSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
            type: 'object',
            properties: claimProperties,
            required: ['id', 'title', 'statement', 'status', 'submittedById', 'createdAt', 'updatedAt']
        }
    },
    required: ['success', 'message', 'data']
};
