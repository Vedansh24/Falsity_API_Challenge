import { z } from 'zod';

export const claimIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const assignAnalystBodySchema = z.object({
  analystId: z.string().uuid()
});

export const requestMoreEvidenceBodySchema = z.object({
  notes: z.string().trim().min(1).max(1000).optional()
});

export const publishVerdictBodySchema = z.object({
  verdict: z.string().trim().min(1).max(100),
  falsityScore: z.number().min(0).max(1).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  reasoning: z.string().trim().min(1).max(5000).optional()
});

// JSON Schemas for Swagger/OpenAPI

export const claimIdParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id'],
  additionalProperties: false
} as const;

export const assignAnalystBodyJsonSchema = {
  type: 'object',
  properties: {
    analystId: { type: 'string', format: 'uuid' }
  },
  required: ['analystId'],
  additionalProperties: false
} as const;

export const requestMoreEvidenceBodyJsonSchema = {
  type: 'object',
  properties: {
    notes: { type: 'string', minLength: 1, maxLength: 1000 }
  },
  additionalProperties: false
} as const;

export const publishVerdictBodyJsonSchema = {
  type: 'object',
  properties: {
    verdict: { type: 'string', minLength: 1, maxLength: 100 },
    falsityScore: { type: 'number', minimum: 0, maximum: 1 },
    confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
    reasoning: { type: 'string', minLength: 1, maxLength: 5000 }
  },
  required: ['verdict'],
  additionalProperties: false
} as const;

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
} as const;

export const claimResponseJsonSchema = {
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
} as const;
