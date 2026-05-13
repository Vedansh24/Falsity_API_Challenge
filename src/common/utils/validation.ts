import { ZodError, ZodIssue } from 'zod';

export function formatZodErrors(error: unknown) {
  if (error instanceof ZodError) {
    return (error.issues as ZodIssue[]).map(e => ({ path: Array.isArray(e.path) ? e.path.join('.') : String(e.path), message: e.message }));
  }

  // Fallback: unknown validation shape
  return [] as Array<{ path?: string; message?: string }>;
}
