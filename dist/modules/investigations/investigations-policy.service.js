"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalystAssignment = validateAnalystAssignment;
exports.validateRequestMoreEvidence = validateRequestMoreEvidence;
exports.validateReadyForVerdict = validateReadyForVerdict;
exports.validatePublishVerdict = validatePublishVerdict;
exports.validateArchive = validateArchive;
exports.isAssignedAnalyst = isAssignedAnalyst;
exports.canViewInvestigation = canViewInvestigation;
exports.canComment = canComment;
const app_error_1 = require("../../common/errors/app-error");
const forbidden_error_1 = require("../../common/errors/forbidden-error");
const role_hook_1 = require("../../common/hooks/role.hook");
/**
 * INVESTIGATION POLICY SERVICE
 *
 * This is the CENTRAL POLICY ENGINE for all workflow-related authorization and validation.
 * All workflow decisions are centralized here to avoid scattered authorization logic.
 */
/**
 * Validate that the analyst can be assigned exists (checked by caller with user lookup).
 * This just validates the workflow rules.
 */
function validateAnalystAssignment(claim, requester) {
    // Only REVIEWER or ADMIN can assign analysts
    if (!(0, role_hook_1.isApprover)(requester)) {
        throw new forbidden_error_1.ForbiddenError('Only reviewers and admins can assign analysts');
    }
    // Claim must be in SUBMITTED status
    if (claim.status !== 'SUBMITTED') {
        throw new app_error_1.AppError(400, `Claim must be in SUBMITTED status to assign analyst. Current status: ${claim.status}`, 'INVALID_WORKFLOW_STATE');
    }
}
/**
 * Validate that requesting more evidence is allowed.
 */
function validateRequestMoreEvidence(claim, requester) {
    // ANALYST, REVIEWER, or ADMIN can request more evidence
    if (!(0, role_hook_1.canAnalyze)(requester)) {
        throw new forbidden_error_1.ForbiddenError('Only analysts and reviewers can request more evidence');
    }
    // Claim must be in UNDER_REVIEW status
    if (claim.status !== 'UNDER_REVIEW') {
        throw new app_error_1.AppError(400, `Claim must be in UNDER_REVIEW status. Current status: ${claim.status}`, 'INVALID_WORKFLOW_STATE');
    }
}
/**
 * Validate that moving to ready-for-verdict is allowed.
 */
function validateReadyForVerdict(claim, requester) {
    // ANALYST, REVIEWER, or ADMIN can move to ready-for-verdict
    if (!(0, role_hook_1.canAnalyze)(requester)) {
        throw new forbidden_error_1.ForbiddenError('Only analysts and reviewers can mark claim as ready for verdict');
    }
    // Claim must be in UNDER_REVIEW status
    if (claim.status !== 'UNDER_REVIEW') {
        throw new app_error_1.AppError(400, `Claim must be in UNDER_REVIEW status. Current status: ${claim.status}`, 'INVALID_WORKFLOW_STATE');
    }
}
/**
 * Validate that publishing a verdict is allowed.
 */
function validatePublishVerdict(claim, requester) {
    // Only REVIEWER or ADMIN can publish verdicts
    if (!(0, role_hook_1.canPublishVerdicts)(requester)) {
        throw new forbidden_error_1.ForbiddenError('Only reviewers and admins can publish verdicts');
    }
    // Claim must be in READY_FOR_VERDICT status
    if (claim.status !== 'READY_FOR_VERDICT') {
        throw new app_error_1.AppError(400, `Claim must be in READY_FOR_VERDICT status. Current status: ${claim.status}`, 'INVALID_WORKFLOW_STATE');
    }
}
/**
 * Validate that archiving is allowed.
 */
function validateArchive(claim, requester) {
    // Only REVIEWER or ADMIN can archive
    if (!(0, role_hook_1.isApprover)(requester)) {
        throw new forbidden_error_1.ForbiddenError('Only reviewers and admins can archive claims');
    }
    // Can only archive from certain states
    const archivableStates = ['PUBLISHED', 'REJECTED', 'RESOLVED'];
    if (!archivableStates.includes(claim.status)) {
        throw new app_error_1.AppError(400, `Claim cannot be archived from status: ${claim.status}`, 'INVALID_WORKFLOW_STATE');
    }
}
/**
 * Check if a user is the assigned analyst for a claim.
 */
function isAssignedAnalyst(claim, userId) {
    return claim.currentAnalystId === userId;
}
/**
 * Check if a user should have visibility over a claim's investigation.
 */
function canViewInvestigation(claim, requester) {
    // Claim owner can always view
    if (claim.submittedById === requester.userId)
        return true;
    // Assigned analyst can view their own investigation
    if (isAssignedAnalyst(claim, requester.userId))
        return true;
    // Reviewers and admins can view all
    return (0, role_hook_1.isApprover)(requester);
}
/**
 * Check if a user can add comments on a claim.
 */
function canComment(claim, requester) {
    // Claim owner can comment
    if (claim.submittedById === requester.userId)
        return true;
    // Analysts, reviewers, admins can comment
    return (0, role_hook_1.canAnalyze)(requester);
}
