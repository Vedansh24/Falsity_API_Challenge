"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaimService = createClaimService;
exports.listClaimsService = listClaimsService;
exports.getClaimByIdService = getClaimByIdService;
exports.updateClaimService = updateClaimService;
exports.submitClaimService = submitClaimService;
const app_error_1 = require("../../common/errors/app-error");
const validation_error_1 = require("../../common/errors/validation-error");
const paginated_response_1 = require("../../common/responses/paginated-response");
const pagination_1 = require("../../common/utils/pagination");
const claims_repository_1 = require("./claims.repository");
function assertOwner(claim, requester) {
    if (claim.submittedById !== requester.userId) {
        throw new app_error_1.AppError(403, 'You are not allowed to modify this claim.', 'FORBIDDEN');
    }
}
function assertDraft(claim, action) {
    if (claim.status !== 'DRAFT') {
        throw new validation_error_1.ValidationError(`Claim must be in DRAFT status to ${action}.`);
    }
}
async function createClaimService(input, requester) {
    return (0, claims_repository_1.createClaim)({
        title: input.title.trim(),
        statement: input.statement.trim(),
        submittedById: requester.userId
    });
}
async function listClaimsService(input) {
    const filter = {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.submittedById !== undefined ? { submittedById: input.submittedById } : {})
    };
    const skip = (0, pagination_1.getPaginationOffset)(input.page, input.pageSize);
    const [items, total] = await Promise.all([
        (0, claims_repository_1.findMany)({
            filter,
            skip,
            take: input.pageSize
        }),
        (0, claims_repository_1.countMany)(filter)
    ]);
    return (0, paginated_response_1.createPaginatedResponse)({
        items,
        page: input.page,
        pageSize: input.pageSize,
        total
    });
}
async function getClaimByIdService(id) {
    const claim = await (0, claims_repository_1.findById)(id);
    if (claim === null) {
        throw new app_error_1.AppError(404, 'Claim not found.', 'NOT_FOUND');
    }
    return claim;
}
async function updateClaimService(id, input, requester) {
    const claim = await getClaimByIdService(id);
    assertOwner(claim, requester);
    assertDraft(claim, 'update');
    return (0, claims_repository_1.updateClaim)(id, {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.statement !== undefined ? { statement: input.statement.trim() } : {})
    });
}
async function submitClaimService(id, requester) {
    const claim = await getClaimByIdService(id);
    assertOwner(claim, requester);
    assertDraft(claim, 'submit');
    return (0, claims_repository_1.updateClaim)(id, {
        status: 'SUBMITTED'
    });
}
