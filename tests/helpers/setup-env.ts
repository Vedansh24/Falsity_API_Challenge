import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Load test env first, then let process env override if provided.
dotenv.config({ path: resolve(process.cwd(), '.env.test') });

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Optional switch for DB-backed tests.
process.env.ENABLE_DB_TESTS = process.env.ENABLE_DB_TESTS || 'false';
