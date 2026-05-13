import { assertTransition, canTransition, getValidNextStates } from '../../src/common/workflow/state-machine';

describe('workflow state machine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(canTransition('READY_FOR_VERDICT', 'PUBLISHED')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(canTransition('PUBLISHED', 'DRAFT')).toBe(false);
    expect(canTransition('ARCHIVED', 'UNDER_REVIEW')).toBe(false);
    expect(() => assertTransition('PUBLISHED', 'DRAFT')).toThrow('Invalid workflow transition');
  });

  it('returns valid next states', () => {
    expect(getValidNextStates('UNDER_REVIEW')).toEqual(['NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT']);
  });
});
