"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidenceController = createEvidenceController;
exports.listEvidenceController = listEvidenceController;
exports.getEvidenceController = getEvidenceController;
exports.updateEvidenceController = updateEvidenceController;
exports.deleteEvidenceController = deleteEvidenceController;
const auth_error_1 = require("../../common/errors/auth-error");
const evidence_schema_1 = require("./evidence.schema");
const service = __importStar(require("./evidence.service"));
const verdict_service_1 = require("../verdict/verdict.service");
function requireAuthenticatedUser(request) {
    if (request.user === undefined) {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
    return request.user;
}
/**
 * Create evidence for a claim.
 * POST /api/v1/claims/:id/evidence
 */
async function createEvidenceController(request, reply) {
    const { id: claimId } = request.params;
    const validatedData = evidence_schema_1.createEvidenceSchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const evidence = await service.addEvidence(claimId, validatedData, currentUser);
    // Recompute verdict after evidence is added
    try {
        await (0, verdict_service_1.recomputeVerdictService)(claimId);
    }
    catch (err) {
        console.error('Failed to recompute verdict:', err);
    }
    reply.status(201).send({
        success: true,
        data: evidence
    });
}
/**
 * List evidence for a claim.
 * GET /api/v1/claims/:id/evidence
 */
async function listEvidenceController(request, reply) {
    const { id: claimId } = request.params;
    requireAuthenticatedUser(request);
    const evidence = await service.getEvidenceForClaim(claimId);
    reply.status(200).send({
        success: true,
        data: evidence
    });
}
/**
 * Get a single evidence record.
 * GET /api/v1/claims/:id/evidence/:evidenceId
 */
async function getEvidenceController(request, reply) {
    const { evidenceId } = request.params;
    requireAuthenticatedUser(request);
    const evidence = await service.getEvidenceById(evidenceId);
    reply.status(200).send({
        success: true,
        data: evidence
    });
}
/**
 * Update evidence.
 * PATCH /api/v1/claims/:id/evidence/:evidenceId
 */
async function updateEvidenceController(request, reply) {
    const { id: claimId, evidenceId } = request.params;
    const validatedData = evidence_schema_1.createEvidenceSchema.partial().parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const evidence = await service.updateEvidenceService(evidenceId, validatedData, currentUser);
    // Recompute verdict after evidence is updated
    try {
        await (0, verdict_service_1.recomputeVerdictService)(claimId);
    }
    catch (err) {
        console.error('Failed to recompute verdict:', err);
    }
    reply.status(200).send({
        success: true,
        data: evidence
    });
}
/**
 * Delete evidence.
 * DELETE /api/v1/claims/:id/evidence/:evidenceId
 */
async function deleteEvidenceController(request, reply) {
    const { id: claimId, evidenceId } = request.params;
    const currentUser = requireAuthenticatedUser(request);
    await service.deleteEvidenceService(evidenceId, currentUser);
    // Recompute verdict after evidence is deleted
    try {
        await (0, verdict_service_1.recomputeVerdictService)(claimId);
    }
    catch (err) {
        console.error('Failed to recompute verdict:', err);
    }
    reply.status(204).send();
}
