"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
exports.hasPermission = hasPermission;
function hasRole(userRoles, role) {
    if (!userRoles)
        return false;
    return userRoles.includes(role);
}
function hasPermission(userRoles, allowed = []) {
    if (!userRoles)
        return false;
    return allowed.some(r => userRoles.includes(r));
}
