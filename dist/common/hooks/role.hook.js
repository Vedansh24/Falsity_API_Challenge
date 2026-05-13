"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
exports.isApprover = isApprover;
exports.canAnalyze = canAnalyze;
exports.canPublishVerdicts = canPublishVerdicts;
const forbidden_error_1 = require("../errors/forbidden-error");
/**
 * Requires user to have one of the specified roles.
 */
function requireRole(...allowedRoles) {
    return async (request) => {
        if (!request.user) {
            throw new forbidden_error_1.ForbiddenError('Authentication required');
        }
        if (!allowedRoles.includes(request.user.role)) {
            throw new forbidden_error_1.ForbiddenError(`This operation requires one of: ${allowedRoles.join(', ')}`);
        }
    };
}
/**
 * Check if user has the required role.
 */
function hasRole(user, role) {
    if (!user)
        return false;
    return user.role === role;
}
/**
 * Check if user has any of the required roles.
 */
function hasAnyRole(user, roles) {
    if (!user)
        return false;
    return roles.includes(user.role);
}
/**
 * Check if user is admin or reviewer.
 */
function isApprover(user) {
    return hasAnyRole(user, ['REVIEWER', 'ADMIN']);
}
/**
 * Check if user is analyst, reviewer, or admin.
 */
function canAnalyze(user) {
    return hasAnyRole(user, ['ANALYST', 'REVIEWER', 'ADMIN']);
}
/**
 * Check if user can publish verdicts.
 */
function canPublishVerdicts(user) {
    return hasAnyRole(user, ['REVIEWER', 'ADMIN']);
}
