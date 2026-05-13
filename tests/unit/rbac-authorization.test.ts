import { canAnalyze, canPublishVerdicts, isApprover } from '../../src/common/hooks/role.hook';
import {
  validateAnalystAssignment,
  validatePublishVerdict,
  validateReadyForVerdict
} from '../../src/modules/investigations/investigations-policy.service';

const baseClaim = {
  id: 'claim-1',
  title: 'title',
  statement: 'statement',
  status: 'READY_FOR_VERDICT',
  submittedById: 'u1',
  category: null,
  publicSlug: null,
  currentAnalystId: null,
  currentReviewerId: null,
  submittedAt: null,
  publishedAt: null,
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
} as any;

describe('rbac authorization', () => {
  const user = { userId: 'u', role: 'USER' as const };
  const analyst = { userId: 'a', role: 'ANALYST' as const };
  const reviewer = { userId: 'r', role: 'REVIEWER' as const };
  const admin = { userId: 'x', role: 'ADMIN' as const };

  it('USER cannot publish verdicts', () => {
    expect(canPublishVerdicts(user)).toBe(false);
    expect(() => validatePublishVerdict(baseClaim, user)).toThrow();
  });

  it('ANALYST cannot publish verdicts but can analyze', () => {
    expect(canPublishVerdicts(analyst)).toBe(false);
    expect(canAnalyze(analyst)).toBe(true);
    expect(() => validatePublishVerdict(baseClaim, analyst)).toThrow();

    const underReviewClaim = { ...baseClaim, status: 'UNDER_REVIEW' };
    expect(() => validateReadyForVerdict(underReviewClaim, analyst)).not.toThrow();
  });

  it('REVIEWER can publish verdicts', () => {
    expect(canPublishVerdicts(reviewer)).toBe(true);
    expect(isApprover(reviewer)).toBe(true);
    expect(() => validatePublishVerdict(baseClaim, reviewer)).not.toThrow();
  });

  it('ADMIN can perform all operations', () => {
    expect(canPublishVerdicts(admin)).toBe(true);
    expect(canAnalyze(admin)).toBe(true);
    expect(isApprover(admin)).toBe(true);

    expect(() => validatePublishVerdict(baseClaim, admin)).not.toThrow();
    const submittedClaim = { ...baseClaim, status: 'SUBMITTED' };
    expect(() => validateAnalystAssignment(submittedClaim, admin)).not.toThrow();
  });
});
