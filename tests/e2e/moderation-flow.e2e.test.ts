import { buildApp } from '../../src/app';
import { prisma } from '../../src/plugins/prisma';
import * as commentsService from '../../src/modules/comments/comments.service';
import { connectTestDb, disconnectTestDb, resetTestDb, shouldRunDbTests } from '../helpers/db';

const describeDb = shouldRunDbTests() ? describe : describe.skip;

describeDb('e2e: moderation flow', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('register -> login -> create -> evidence -> assign -> ready -> publish with audit/timeline assertions', async () => {
    const app = await buildApp();
    await app.ready();

    const register = async (name: string, email: string, password = 'Password123!') => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: { name, email, password }
      });
      expect(res.statusCode).toBe(201);
      return res.json().data;
    };

    const login = async (email: string, password = 'Password123!') => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { email, password }
      });
      expect(res.statusCode).toBe(200);
      return res.json().data.accessToken as string;
    };

    const owner = await register('Owner', 'owner-e2e@example.com');
    const analyst = await register('Analyst', 'analyst-e2e@example.com');
    const reviewer = await register('Reviewer', 'reviewer-e2e@example.com');

    await prisma.user.update({ where: { id: analyst.id }, data: { role: 'ANALYST' } });
    await prisma.user.update({ where: { id: reviewer.id }, data: { role: 'REVIEWER' } });

    const ownerToken = await login('owner-e2e@example.com');
    const analystToken = await login('analyst-e2e@example.com');
    const reviewerToken = await login('reviewer-e2e@example.com');

    const createClaimRes = await app.inject({
      method: 'POST',
      url: '/api/v1/claims',
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { statement: 'E2E claim statement' }
    });
    expect(createClaimRes.statusCode).toBe(201);
    const claimId = createClaimRes.json().data.id as string;

    const submitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/submit`,
      headers: { authorization: `Bearer ${ownerToken}` }
    });
    expect(submitRes.statusCode).toBe(200);

    const unauthorizedPublish = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/publish`,
      headers: { authorization: `Bearer ${analystToken}` },
      payload: { verdict: 'FALSE', confidenceScore: 0.8, falsityScore: 0.9, reasoning: 'test' }
    });
    expect(unauthorizedPublish.statusCode).toBe(403);

    const assignRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/assign-analyst`,
      headers: { authorization: `Bearer ${reviewerToken}` },
      payload: { analystId: analyst.id }
    });
    expect(assignRes.statusCode).toBe(200);

    const evidencePayload = {
      sourceType: 'NEWS',
      sourceUrl: 'https://example.com/e2e-source',
      stance: 'CONTRADICTS',
      credibilityScore: 0.9,
      relevanceScore: 0.85,
      freshnessScore: 0.8,
      reviewerConfidence: 0.9
    };

    const addEvidenceRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/evidence`,
      headers: { authorization: `Bearer ${analystToken}` },
      payload: evidencePayload
    });
    expect(addEvidenceRes.statusCode).toBe(201);

    const dupEvidenceRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/evidence`,
      headers: { authorization: `Bearer ${analystToken}` },
      payload: evidencePayload
    });
    expect(dupEvidenceRes.statusCode).toBe(409);

    const readyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/ready-for-verdict`,
      headers: { authorization: `Bearer ${analystToken}` }
    });
    expect(readyRes.statusCode).toBe(200);

    const publishRes = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claimId}/publish`,
      headers: { authorization: `Bearer ${reviewerToken}` },
      payload: {
        verdict: 'FALSE',
        confidenceScore: 0.8,
        falsityScore: 0.9,
        reasoning: 'Published after review'
      }
    });
    expect(publishRes.statusCode).toBe(200);

    await commentsService.addComment(
      claimId,
      { userId: analyst.id, role: 'ANALYST' },
      "<script>alert('xss')</script>",
      'INTERNAL'
    );

    const savedComment = await prisma.comment.findFirst({ where: { claimId }, orderBy: { createdAt: 'desc' } });
    expect(savedComment?.content).toContain("alert('xss')");
    expect(savedComment?.content).not.toContain('<script>');

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    expect(claim?.status).toBe('PUBLISHED');

    const verdict = await prisma.verdict.findFirst({ where: { claimId } });
    expect(verdict).toBeTruthy();

    const auditLogs = await prisma.auditLog.findMany({ where: { entityId: claimId } });
    expect(auditLogs.some((a) => a.action === 'ANALYST_ASSIGNED')).toBe(true);
    expect(auditLogs.some((a) => a.action === 'VERDICT_PUBLISHED')).toBe(true);

    await app.close();
  });
});
