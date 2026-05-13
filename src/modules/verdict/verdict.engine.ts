import type {
	EvidenceInput,
	ScoreInput,
	VerdictContext,
	VerdictOutput,
	ComputeVerdictResult
} from './verdict.types';

const THRESHOLD = 0.3;

export function computeScores(evidences: EvidenceInput[]): {
	supportScore: number;
	contradictScore: number;
} {
	let supportScore = 0;
	let contradictScore = 0;

	for (const evidence of evidences) {
		// Average the three evidence factors into a single normalized weight.
		const weight = (
			evidence.credibilityScore +
			evidence.relevanceScore +
			evidence.freshnessScore
		) / 3;

		if (evidence.stance === 'SUPPORTS') {
			supportScore += weight;
			continue;
		}

		if (evidence.stance === 'CONTRADICTS') {
			contradictScore += weight;
		}
	}

	return {
		supportScore,
		contradictScore
	};
}

export function computeFinalVerdict(input: ScoreInput): VerdictOutput {
	const { supportScore, contradictScore } = input;
	const finalScore = supportScore - contradictScore;
	const totalScore = supportScore + contradictScore;

	// Keep decision deterministic when no evidence contributes to either side.
	if (totalScore === 0) {
		return {
			verdict: 'UNVERIFIABLE' as any,
			verdictType: 'UNVERIFIABLE',
			confidenceScore: 0,
			confidenceBand: 'LOW',
			finalScore,
			falsityScore: 50
		};
	}

	if (finalScore > THRESHOLD) {
		return {
			verdict: 'TRUE' as any,
			verdictType: 'TRUE',
			confidenceScore: supportScore / totalScore,
			confidenceBand: 'HIGH',
			finalScore,
			falsityScore: 10
		};
	}

	if (finalScore < -THRESHOLD) {
		return {
			verdict: 'FALSE' as any,
			verdictType: 'FALSE',
			confidenceScore: supportScore / totalScore,
			confidenceBand: 'HIGH',
			finalScore,
			falsityScore: 90
		};
	}

	return {
		verdict: 'PARTLY_FALSE' as any,
		verdictType: 'PARTLY_FALSE',
		confidenceScore: supportScore / totalScore,
		confidenceBand: 'MEDIUM',
		finalScore,
		falsityScore: 50
	};
}


export function buildReasoning(
	evidences: EvidenceInput[],
	context: VerdictContext
): string {
	const { supportScore, contradictScore, verdict } = context;

	// Edge Case 1: No evidence
	if (!evidences.length) {
		return 'No evidence available to evaluate the claim.';
	}

	// Count evidences by stance
	let supports = 0;
	let contradicts = 0;
	let neutrals = 0;

	for (const ev of evidences) {
		if (ev.stance === 'SUPPORTS') supports++;
		else if (ev.stance === 'CONTRADICTS') contradicts++;
		else neutrals++;
	}

	const total = evidences.length;

	// Edge Case 2: All neutral
	if (supports === 0 && contradicts === 0) {
		return 'Available evidence does not provide a clear stance toward the claim.';
	}

	// PART 1: Summary
	const summary = `The system analyzed ${total} piece${
		total > 1 ? 's' : ''
	} of evidence, including ${supports} supporting and ${contradicts} contradicting source${
		supports + contradicts !== 1 ? 's' : ''
	}.`;

	// PART 2: Strength Analysis
	let strengthAnalysis = '';

	if (supportScore > contradictScore) {
		strengthAnalysis =
			'Supporting evidence shows higher overall strength based on credibility, relevance, and freshness scores.';
	} else if (contradictScore > supportScore) {
		strengthAnalysis =
			'Contradicting evidence outweighs supporting evidence in combined scoring metrics.';
	} else {
		strengthAnalysis =
			'Supporting and contradicting evidence have comparable strength, indicating a mixed signal.';
	}

	// PART 3: Conflict Awareness
	let conflictNote = '';

	if (supports > 0 && contradicts > 0) {
		conflictNote =
			'However, the presence of conflicting evidence reduces overall confidence in the conclusion.';
	}

	// PART 4: Final Verdict Justification
	let verdictLine = '';

	switch (verdict) {
		case 'TRUE':
			verdictLine = 'Therefore, the claim is likely to be true.';
			break;
		case 'FALSE':
			verdictLine = 'Therefore, the claim is likely to be false.';
			break;
		default:
			verdictLine =
				'Therefore, the claim cannot be conclusively determined based on available evidence.';
	}

	// Combine all parts cleanly
	return [summary, strengthAnalysis, conflictNote, verdictLine]
		.filter(Boolean)
		.join(' ');
}

/**
 * Comprehensive verdict engine that orchestrates scoring, decision-making, and reasoning.
 *
 * This pure function takes evidence inputs and produces a complete, explainable verdict
 * suitable for UI display and fact-checking workflows.
 *
 * @param evidences Array of evidence items with credibility, relevance, and freshness scores
 * @returns Complete verdict result with decision, confidence, scores, and reasoning
 */
export function computeVerdict(evidences: EvidenceInput[]): ComputeVerdictResult {
	// STEP 1: Compute scores from evidence
	const { supportScore, contradictScore } = computeScores(evidences);

	// STEP 2: Apply decision logic with thresholds
	const verdictOutput = computeFinalVerdict({
		supportScore,
		contradictScore
	});
	const { verdict, verdictType, confidenceScore, finalScore, falsityScore, confidenceBand } = verdictOutput;

	// Calculate average credibility and contradiction level (simplified for old engine)
	const averageCredibility = evidences.length > 0 
		? evidences.reduce((sum, e) => sum + e.credibilityScore, 0) / evidences.length
		: 0;
	
	const totalScore = supportScore + contradictScore;
	const contradictionLevel = totalScore > 0 
		? Math.min(supportScore, contradictScore) / Math.max(supportScore, contradictScore || 1)
		: 0;

	// STEP 3: Generate human-readable reasoning
	const reasoning = buildReasoning(evidences, {
		supportScore,
		contradictScore,
		finalScore,
		verdict: verdictType,
		contradictionLevel,
		averageCredibility
	});

	// STEP 4: Return complete, production-ready result
	return {
		verdict: verdictType,
		verdictType,
		confidenceScore,
		supportScore,
		contradictScore,
		contradictionLevel,
		reasoning,
		falsityScore,
		confidenceBand,
		evidenceCount: evidences.length
	};
}
