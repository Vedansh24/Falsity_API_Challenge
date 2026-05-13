"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCommentVisibility = validateCreateCommentVisibility;
exports.filterVisibleCommentsForRequester = filterVisibleCommentsForRequester;
const forbidden_error_1 = require("../../common/errors/forbidden-error");
/**
 * Centralized comment visibility and permission policy.
 * Keeps rules in one place so controllers/services can enforce consistently.
 */
function validateCreateCommentVisibility(visibility, requester, claimOwnerId) {
    const role = requester.role;
    if (visibility === 'PUBLIC') {
        // Allow claim owner to create public comments; analysts/reviewers/admins can create public anywhere.
        if (requester.userId === claimOwnerId)
            return;
        if (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN')
            return;
        throw new forbidden_error_1.ForbiddenError('Only claim owner or staff can create public comments');
    }
    if (visibility === 'INTERNAL') {
        if (role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN')
            return;
        throw new forbidden_error_1.ForbiddenError('Only analysts, reviewers, or admins can create internal comments');
    }
    if (visibility === 'REVIEWER_ONLY') {
        if (role === 'REVIEWER' || role === 'ADMIN')
            return;
        throw new forbidden_error_1.ForbiddenError('Only reviewers or admins can create reviewer-only comments');
    }
}
function filterVisibleCommentsForRequester(items, requester, claimOwnerId) {
    return items.filter((c) => {
        const v = (c.visibility || 'PUBLIC');
        if (v === 'PUBLIC')
            return true; // public always visible by listing endpoint; higher-level checks might restrict
        if (v === 'INTERNAL')
            return requester.role === 'ANALYST' || requester.role === 'REVIEWER' || requester.role === 'ADMIN';
        if (v === 'REVIEWER_ONLY')
            return requester.role === 'REVIEWER' || requester.role === 'ADMIN';
        return false;
    });
}
