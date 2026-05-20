import { z } from 'zod';

export const createClaimSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title must be 200 characters or less'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be 5000 characters or less'),
  category: z.string().trim().max(120, 'Category must be 120 characters or less').optional().default(''),
  sourceUrl: z.string().trim().max(2048, 'Source URL must be 2048 characters or less').optional().default(''),
  tags: z.string().trim().optional().default(''),
  initialMetadata: z.string().trim().optional().default('')
});

export type CreateClaimDto = z.infer<typeof createClaimSchema>;
