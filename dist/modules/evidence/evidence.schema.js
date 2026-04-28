"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidenceSchema = void 0;
const zod_1 = require("zod");
exports.createEvidenceSchema = zod_1.z.object({
    sourceType: zod_1.z.enum([
        'GOVERNMENT',
        'NEWS',
        'RESEARCH',
        'BLOG',
        'SOCIAL',
        'INTERNAL'
    ]),
    sourceUrl: zod_1.z.string().url(),
    stance: zod_1.z.enum(['SUPPORTS', 'CONTRADICTS', 'NEUTRAL']),
    credibilityScore: zod_1.z.number().min(0).max(1),
    relevanceScore: zod_1.z.number().min(0).max(1),
    freshnessScore: zod_1.z.number().min(0).max(1),
    reviewerConfidence: zod_1.z.number().min(0).max(1)
});
