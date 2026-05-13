import { prisma } from '../../src/plugins/prisma';
import { createClaimService, submitClaimService } from '../../src/modules/claims/claims.service';
import { assignAnalystService } from '../../src/modules/investigations/investigations.service';
import { connectTestDb, disconnectTestDb, resetTestDb, shouldRunDbTests } from '../helpers/db';
import { createUserFactory } from '../helpers/factories';

const describeDb = shouldRunDbTests() ? describe : describe.skip;

describeDb('integration: claim workflow', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('create claim -> submit -> assign analyst -> investigation + audit', async () => {
    const user = await createUserFactory({ name: 'user', email: 'wf-user@example.com', role: 'USER' });
    const reviewer = await createUserFactory({ name: 'reviewer', email: 'wf-reviewer@example.com', role: 'REVIEWER' });
    const analyst = await createUserFactory({ name: 'analyst', email: 'wf-analyst@example.com', role: 'ANALYST' });

    const claim = await createClaimService({ statement: 'Test workflow claim' }, { userId: user.id, role: 'USER' });
    const submitted = await submitClaimService(claim.id, { userId: user.id, role: 'USER' });
    expect(submitted.status).toBe('SUBMITTED');

    const assigned = await assignAnalystService(claim.id, analyst.id, { userId: reviewer.id, role: 'REVIEWER' });
    expect(assigned.status).toBe('UNDER_REVIEW');
    expect(assigned.currentAnalystId).toBe(analyst.id);

    const investigation = await prisma.investigation.findFirst({ where: { claimId: claim.id } });
    expect(investigation).toBeTruthy();
    expect(investigation?.investigatorId).toBe(analyst.id);

    const auditLogs = await prisma.auditLog.findMany({ where: { entityId: claim.id } });
    expect(auditLogs.some((a) => a.action === 'CLAIM_CREATED')).toBe(true);
    expect(auditLogs.some((a) => a.action === 'CLAIM_SUBMITTED')).toBe(true);
    expect(auditLogs.some((a) => a.action === 'ANALYST_ASSIGNED')).toBe(true);
  });
});
