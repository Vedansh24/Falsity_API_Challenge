import { z } from 'zod';

import { roles } from '../../common/types';

const userJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: [...roles] },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'email', 'role', 'createdAt'],
  additionalProperties: false
} as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8).max(64)
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const registerBodyJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 64 }
  },
  required: ['name', 'email', 'password'],
  additionalProperties: false
} as const;

export const loginBodyJsonSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 }
  },
  required: ['email', 'password'],
  additionalProperties: false
} as const;

export const registerResponseJsonSchema = userJsonSchema;
export const meResponseJsonSchema = userJsonSchema;

export const loginResponseJsonSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    expiresIn: { type: 'string', enum: ['1d'] }
  },
  required: ['accessToken', 'expiresIn'],
  additionalProperties: false
} as const;
