import * as commentsService from '../../src/modules/comments/comments.service';
import { getClaimTimeline } from '../../src/modules/timeline/services/timeline.service';
import { connectTestDb, disconnectTestDb, resetTestDb, shouldRunDbTests } from '../helpers/db';
import { createClaimFactory, createUserFactory } from '../helpers/factories';

const describeDb = shouldRunDbTests() ? describe : describe.skip;

describeDb('integration: comment/timeline flow', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('create internal comment -> timeline includes comment and visibility rules enforced', async () => {
    const owner = await createUserFactory({ name: 'owner', email: 'ct-owner@example.com', role: 'USER' });
    const analyst = await createUserFactory({ name: 'analyst', email: 'ct-analyst@example.com', role: 'ANALYST' });

    const claim = await createClaimFactory({
      title: 'Timeline claim',
      statement: 'Timeline statement',
      submittedById: owner.id,
      status: 'UNDER_REVIEW'
    });

    const created = await commentsService.addComment(
      claim.id,
      { userId: analyst.id, role: analyst.role },
      'Internal note <script>alert(1)</script>',
      'INTERNAL'
    );

    expect(created.content).toContain('alert(1)');
    expect(created.content).not.toContain('<script>');

    await expect(
      commentsService.addComment(
        claim.id,
        { userId: owner.id, role: 'USER' },
        'Not allowed internal comment',
        'INTERNAL'
      )
    ).rejects.toThrow();

    const timeline = await getClaimTimeline(claim.id, { limit: 20 });
    expect(timeline.some((item) => item.type === 'COMMENT')).toBe(true);
    expect(timeline.some((item) => item.type === 'COMMENT_ADDED')).toBe(true);
  });
});
