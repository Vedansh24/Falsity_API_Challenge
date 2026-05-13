import { z } from 'zod';

const claimStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT', 'PUBLISHED', 'ARCHIVED', 'RESOLVED', 'REJECTED'] as const;

const claimProperties = {
  id: { type: 'string', format: 'uuid' },
  title: { type: 'string' },
  statement: { type: 'string' },
  status: { type: 'string', enum: [...claimStatuses] },
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

export const createClaimSchema = z.object({
  statement: z.string()
});

export const updateClaimSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  statement: z.string().trim().min(10).max(5000).optional()
}).refine((value) => value.title !== undefined || value.statement !== undefined, {
  message: 'At least one field must be provided for update.'
});

export const claimIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const listClaimsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(claimStatuses).optional(),
  submittedById: z.string().uuid().optional()
});

export const createClaimBodyJsonSchema = {
  type: 'object',
  required: ['statement'],
  properties: {
    statement: { type: 'string' }
  }
} as const;

export const updateClaimBodyJsonSchema = {
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
} as const;

export const claimIdParamsJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' }
  },
  required: ['id'],
  additionalProperties: false
} as const;

export const listClaimsQueryJsonSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    status: { type: 'string', enum: [...claimStatuses] },
    submittedById: { type: 'string', format: 'uuid' }
  },
  additionalProperties: false
} as const;

export const claimResponseJsonSchema = {
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
} as const;

export const listClaimsResponseJsonSchema = {
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
} as const;
