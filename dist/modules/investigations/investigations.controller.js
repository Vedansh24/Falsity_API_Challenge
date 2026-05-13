"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveClaimController = exports.publishVerdictController = exports.readyForVerdictController = exports.requestMoreEvidenceController = exports.assignAnalystController = void 0;
const auth_error_1 = require("../../common/errors/auth-error");
const investigations_schema_1 = require("./investigations.schema");
const investigations_service_1 = require("./investigations.service");
function requireAuthenticatedUser(request) {
    if (request.user === undefined) {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
    return request.user;
}
const assignAnalystController = async (request, reply) => {
    const params = investigations_schema_1.claimIdParamsSchema.parse(request.params);
    const body = investigations_schema_1.assignAnalystBodySchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, investigations_service_1.assignAnalystService)(params.id, body.analystId, currentUser);
    return reply.code(200).send(claim);
};
exports.assignAnalystController = assignAnalystController;
const requestMoreEvidenceController = async (request, reply) => {
    const params = investigations_schema_1.claimIdParamsSchema.parse(request.params);
    const body = investigations_schema_1.requestMoreEvidenceBodySchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, investigations_service_1.requestMoreEvidenceService)(params.id, body.notes, currentUser);
    return reply.code(200).send(claim);
};
exports.requestMoreEvidenceController = requestMoreEvidenceController;
const readyForVerdictController = async (request, reply) => {
    const params = investigations_schema_1.claimIdParamsSchema.parse(request.params);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, investigations_service_1.readyForVerdictService)(params.id, currentUser);
    return reply.code(200).send(claim);
};
exports.readyForVerdictController = readyForVerdictController;
const publishVerdictController = async (request, reply) => {
    const params = investigations_schema_1.claimIdParamsSchema.parse(request.params);
    const body = investigations_schema_1.publishVerdictBodySchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, investigations_service_1.publishVerdictService)(params.id, {
        verdict: body.verdict,
        falsityScore: body.falsityScore ?? null,
        confidenceScore: body.confidenceScore ?? null,
        reasoning: body.reasoning ?? null
    }, currentUser);
    return reply.code(200).send(claim);
};
exports.publishVerdictController = publishVerdictController;
const archiveClaimController = async (request, reply) => {
    const params = investigations_schema_1.claimIdParamsSchema.parse(request.params);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, investigations_service_1.archiveClaimService)(params.id, currentUser);
    return reply.code(200).send(claim);
};
exports.archiveClaimController = archiveClaimController;
