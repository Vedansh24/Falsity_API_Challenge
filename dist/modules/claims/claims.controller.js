"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitClaimController = exports.updateClaimController = exports.getClaimByIdController = exports.listClaimsController = exports.createClaimController = void 0;
const auth_error_1 = require("../../common/errors/auth-error");
const claims_schema_1 = require("./claims.schema");
const claims_service_1 = require("./claims.service");
function requireAuthenticatedUser(request) {
    if (request.user === undefined) {
        throw new auth_error_1.AuthError(401, 'Invalid or expired token');
    }
    return request.user;
}
const createClaimController = async (request, reply) => {
    const body = claims_schema_1.createClaimSchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, claims_service_1.createClaimService)(body, currentUser);
    return reply.code(201).send(claim);
};
exports.createClaimController = createClaimController;
const listClaimsController = async (request, reply) => {
    const query = claims_schema_1.listClaimsQuerySchema.parse(request.query);
    const claims = await (0, claims_service_1.listClaimsService)(query);
    return reply.code(200).send(claims);
};
exports.listClaimsController = listClaimsController;
const getClaimByIdController = async (request, reply) => {
    const params = claims_schema_1.claimIdParamsSchema.parse(request.params);
    const claim = await (0, claims_service_1.getClaimByIdService)(params.id);
    return reply.code(200).send(claim);
};
exports.getClaimByIdController = getClaimByIdController;
const updateClaimController = async (request, reply) => {
    const params = claims_schema_1.claimIdParamsSchema.parse(request.params);
    const body = claims_schema_1.updateClaimSchema.parse(request.body);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, claims_service_1.updateClaimService)(params.id, body, currentUser);
    return reply.code(200).send(claim);
};
exports.updateClaimController = updateClaimController;
const submitClaimController = async (request, reply) => {
    const params = claims_schema_1.claimIdParamsSchema.parse(request.params);
    const currentUser = requireAuthenticatedUser(request);
    const claim = await (0, claims_service_1.submitClaimService)(params.id, currentUser);
    return reply.code(200).send(claim);
};
exports.submitClaimController = submitClaimController;
