import { buildApp } from '../../src/app';
import { prisma } from '../../src/plugins/prisma';
import { addEvidence } from '../../src/modules/evidence/evidence.service';
import { AppError } from '../../src/common/errors/app-error';
import { connectTestDb, disconnectTestDb, resetTestDb, shouldRunDbTests } from '../helpers/db';
import { createClaimFactory, createUserFactory } from '../helpers/factories';

const describeDb = shouldRunDbTests() ? describe : describe.skip;

describeDb('integration: evidence flow', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('add evidence persists and duplicate detection blocks second insert', async () => {
    const user = await createUserFactory({ name: 'owner', email: 'ev-owner@example.com', role: 'USER' });
    const claim = await createClaimFactory({
      title: 'Evidence claim',
      statement: 'Evidence claim statement',
      submittedById: user.id,
      status: 'UNDER_REVIEW'
    });

    const created = await addEvidence(
      claim.id,
      {
        sourceType: 'NEWS',
        sourceUrl: 'https://example.com/source',
        stance: 'SUPPORTS',
        credibilityScore: 0.7,
        relevanceScore: 0.8,
        freshnessScore: 0.7,
        reviewerConfidence: 0.75
      },
      { userId: user.id, role: 'USER' }
    );

    expect(created.id).toBeTruthy();

    await expect(
      addEvidence(
        claim.id,
        {
          sourceType: 'NEWS',
          sourceUrl: 'https://example.com/source',
          stance: 'SUPPORTS',
          credibilityScore: 0.7,
          relevanceScore: 0.8,
          freshnessScore: 0.7,
          reviewerConfidence: 0.75
        },
        { userId: user.id, role: 'USER' }
      )
    ).rejects.toThrow(AppError);
  });

  it('route-level evidence creation returns success and invokes integrated path', async () => {
    const app = await buildApp();
    await app.ready();

    const user = await createUserFactory({ name: 'route-owner', email: 'ev-route-owner@example.com', role: 'USER', password: 'Password123!' });
    const claim = await createClaimFactory({
      title: 'Route evidence claim',
      statement: 'Route evidence statement',
      submittedById: user.id,
      status: 'UNDER_REVIEW'
    });

    const token = app.jwt.sign({ userId: user.id, role: user.role });

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/claims/${claim.id}/evidence`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        sourceType: 'NEWS',
        sourceUrl: 'https://example.com/route-source',
        stance: 'CONTRADICTS',
        credibilityScore: 0.9,
        relevanceScore: 0.8,
        freshnessScore: 0.8,
        reviewerConfidence: 0.8
      }
    });

    expect(res.statusCode).toBe(201);

    const evidence = await prisma.evidence.findMany({ where: { claimId: claim.id } });
    expect(evidence.length).toBe(1);

    await app.close();
  });
});
