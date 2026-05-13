"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.assertTransition = assertTransition;
exports.getValidNextStates = getValidNextStates;
const app_error_1 = require("../errors/app-error");
/**
 * Centralized claim workflow state machine.
 * Defines all valid state transitions.
 */
const validTransitions = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['NEEDS_MORE_EVIDENCE', 'READY_FOR_VERDICT'],
    NEEDS_MORE_EVIDENCE: ['UNDER_REVIEW'],
    READY_FOR_VERDICT: ['PUBLISHED'],
    PUBLISHED: ['ARCHIVED'],
    ARCHIVED: [],
    RESOLVED: ['ARCHIVED'],
    REJECTED: ['ARCHIVED']
};
/**
 * Check if a transition from `from` to `to` is valid.
 */
function canTransition(from, to) {
    return validTransitions[from]?.includes(to) ?? false;
}
/**
 * Assert that a transition is valid. Throws if not.
 */
function assertTransition(from, to) {
    if (!canTransition(from, to)) {
        throw new app_error_1.AppError(400, `Invalid workflow transition from ${from} to ${to}`, 'INVALID_WORKFLOW_TRANSITION');
    }
}
/**
 * Get all valid next states for a given state.
 */
function getValidNextStates(status) {
    return validTransitions[status] || [];
}
