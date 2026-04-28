"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerdict = generateVerdict;
const verdict_engine_1 = require("./verdict.engine");
const evidence_repository_1 = require("../evidence/evidence.repository");
async function generateVerdict(claimId) {
    const evidences = await (0, evidence_repository_1.findByClaimId)(claimId);
    const formatted = evidences.map((e) => ({
        stance: e.stance,
        credibilityScore: e.credibilityScore,
        relevanceScore: e.relevanceScore,
        freshnessScore: e.freshnessScore
    }));
    const result = (0, verdict_engine_1.computeVerdict)(formatted);
    return result;
}
