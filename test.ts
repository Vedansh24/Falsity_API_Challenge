import { computeVerdict } from './src/modules/verdict/verdict.engine';
import type { EvidenceInput } from './src/modules/verdict/verdict.types';

type Verdict = 'TRUE' | 'FALSE' | 'INCONCLUSIVE';

const testCases: Array<{ name: string; expected: Verdict; data: EvidenceInput[] }> = [
  {
    name: 'Case 1: Only SUPPORTS',
    expected: 'TRUE',
    data: [
      {
        stance: 'SUPPORTS',
        credibilityScore: 0.9,
        relevanceScore: 0.8,
        freshnessScore: 0.7
      }
    ]
  },
  {
    name: 'Case 2: Only CONTRADICTS',
    expected: 'FALSE',
    data: [
      {
        stance: 'CONTRADICTS',
        credibilityScore: 0.9,
        relevanceScore: 0.8,
        freshnessScore: 0.7
      }
    ]
  },
  {
    name: 'Case 3: Mixed',
    expected: 'INCONCLUSIVE',
    data: [
      {
        stance: 'SUPPORTS',
        credibilityScore: 0.8,
        relevanceScore: 0.7,
        freshnessScore: 0.6
      },
      {
        stance: 'CONTRADICTS',
        credibilityScore: 0.8,
        relevanceScore: 0.7,
        freshnessScore: 0.6
      }
    ]
  },
  {
    name: 'Case 4: Empty',
    expected: 'INCONCLUSIVE',
    data: []
  }
];

for (const test of testCases) {
  console.log(`\n=== ${test.name} ===`);

  const result = computeVerdict(test.data);

  console.log('Output:', result);
  console.log('Expected Verdict:', test.expected);

  const verdictCheck = result.verdict === test.expected;

  let confidenceCheck = true;

  if (test.name === 'Case 4: Empty') {
    confidenceCheck = result.confidenceScore === 0;
  }

  console.log('Verdict Correct:', verdictCheck);
  console.log('Confidence Check:', confidenceCheck);

  if (!verdictCheck || !confidenceCheck) {
    console.error('❌ TEST FAILED');
  } else {
    console.log('✅ TEST PASSED');
  }
}
