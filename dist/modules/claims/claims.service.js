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
const audit = __importStar(require("../audit/services/audit-log.service"));
async function createClaimService(input, requester) {
    const claim = await (0, claims_repository_1.createClaim)({
        title: input.statement.trim(),
        statement: input.statement.trim(),
        submittedById: requester.userId
    });
    // Emit audit (non-blocking)
    await audit.log({
        action: 'CLAIM_CREATED',
        entityType: 'CLAIM',
        entityId: claim.id,
        performedById: requester.userId,
        metadata: { title: claim.title }
    });
    return claim;
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
    const updated = await (0, claims_repository_1.updateClaim)(id, { status: 'SUBMITTED' });
    await audit.log({
        action: 'CLAIM_SUBMITTED',
        entityType: 'CLAIM',
        entityId: id,
        performedById: requester.userId,
        metadata: { previousStatus: claim.status, newStatus: updated.status }
    });
    return updated;
}
