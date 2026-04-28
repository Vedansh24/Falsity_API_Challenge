import { z } from 'zod';

export const createEvidenceSchema = z.object({
  sourceType: z.enum([
    'GOVERNMENT',
    'NEWS',
    'RESEARCH',
    'BLOG',
    'SOCIAL',
    'INTERNAL'
  ]),
  sourceUrl: z.string().url(),
  stance: z.enum(['SUPPORTS', 'CONTRADICTS', 'NEUTRAL']),
  credibilityScore: z.number().min(0).max(1),
  relevanceScore: z.number().min(0).max(1),
  freshnessScore: z.number().min(0).max(1),
  reviewerConfidence: z.number().min(0).max(1)
});

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
