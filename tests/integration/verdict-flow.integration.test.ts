import { prisma } from '../../src/plugins/prisma';
import { publishVerdictService } from '../../src/modules/investigations/investigations.service';
import { connectTestDb, disconnectTestDb, resetTestDb, shouldRunDbTests } from '../helpers/db';
import { createClaimFactory, createUserFactory } from '../helpers/factories';

const describeDb = shouldRunDbTests() ? describe : describe.skip;

describeDb('integration: verdict flow', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('publish verdict -> verdict persisted and audit log created', async () => {
    const owner = await createUserFactory({ name: 'owner', email: 'vf-owner@example.com', role: 'USER' });
    const reviewer = await createUserFactory({ name: 'reviewer', email: 'vf-reviewer@example.com', role: 'REVIEWER' });

    const claim = await createClaimFactory({
      title: 'Verdict claim',
      statement: 'Verdict statement',
      submittedById: owner.id,
      status: 'READY_FOR_VERDICT'
    });

    const updated = await publishVerdictService(
      claim.id,
      {
        verdict: 'FALSE',
        falsityScore: 0.9,
        confidenceScore: 0.8,
        reasoning: 'Contradicted by multiple sources'
      },
      { userId: reviewer.id, role: 'REVIEWER' }
    );

    expect(updated.status).toBe('PUBLISHED');

    const verdict = await prisma.verdict.findFirst({ where: { claimId: claim.id } });
    expect(verdict).toBeTruthy();
    expect(verdict?.publishedById).toBe(reviewer.id);

    const audit = await prisma.auditLog.findFirst({
      where: { entityId: claim.id, action: 'VERDICT_PUBLISHED' }
    });
    expect(audit).toBeTruthy();
  });
});
