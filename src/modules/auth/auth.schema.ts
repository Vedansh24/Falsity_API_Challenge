// src/modules/auth/auth.schema.ts
import { z } from 'zod';

const roleEnum = ['USER', 'ANALYST', 'REVIEWER', 'ADMIN'] as const;

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
} as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(64),
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
} as const;

export const loginBodyJsonSchema = {
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
} as const;

export const registerResponseJsonSchema = {
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
} as const;

export const loginResponseJsonSchema = {
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
} as const;

export const meResponseJsonSchema = {
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
} as const;
