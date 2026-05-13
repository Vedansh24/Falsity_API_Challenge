"use strict";
/**
 * VERDICT CONTROLLER
 *
 * Handles HTTP requests for verdict endpoints including:
 * - Get current verdict
 * - Recompute verdict
 * - Get verdict history
 * - Approve/reject verdicts (moderation)
 * - Get verdict statistics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerdictStatsController = exports.rejectVerdictController = exports.approveVerdictController = exports.getVerdictHistoryController = exports.recomputeVerdictController = exports.getVerdictController = void 0;
const app_error_1 = require("../../common/errors/app-error");
const verdict_service_1 = require("./verdict.service");
/**
 * Get current verdict for a claim.
 * GET /api/v1/claims/:id/verdict
 */
const getVerdictController = async (request, reply) => {
    try {
        const params = request.params;
        const { id } = params;
        const result = await (0, verdict_service_1.getVerdictService)(id);
        return reply.code(200).send({ success: true, data: result });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.getVerdictController = getVerdictController;
/**
 * Recompute verdict for a claim (trigger recalculation from evidence).
 * POST /api/v1/claims/:id/verdict/recompute
 */
const recomputeVerdictController = async (request, reply) => {
    try {
        const params = request.params;
        const { id } = params;
        const result = await (0, verdict_service_1.recomputeVerdictService)(id);
        return reply.code(200).send({ success: true, data: result, message: 'Verdict recomputed' });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.recomputeVerdictController = recomputeVerdictController;
/**
 * Get verdict history for a claim.
 * GET /api/v1/claims/:id/verdict/history
 */
const getVerdictHistoryController = async (request, reply) => {
    try {
        const params = request.params;
        const query = request.query;
        const { id } = params;
        const limit = query.limit ? parseInt(query.limit) : 50;
        const history = await (0, verdict_service_1.getVerdictHistoryService)(id, limit);
        return reply.code(200).send({ success: true, data: history });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.getVerdictHistoryController = getVerdictHistoryController;
/**
 * Approve a verdict (moderation workflow).
 * POST /api/v1/verdicts/:verdictId/approve
 */
const approveVerdictController = async (request, reply) => {
    try {
        const params = request.params;
        const { verdictId } = params;
        if (!request.user) {
            throw new app_error_1.AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }
        const result = await (0, verdict_service_1.approveVerdictService)(verdictId, request.user.userId);
        return reply.code(200).send({ success: true, data: result, message: 'Verdict approved' });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.approveVerdictController = approveVerdictController;
/**
 * Reject a verdict (moderation workflow).
 * POST /api/v1/verdicts/:verdictId/reject
 */
const rejectVerdictController = async (request, reply) => {
    try {
        const params = request.params;
        const { verdictId } = params;
        if (!request.user) {
            throw new app_error_1.AppError(401, 'Unauthorized', 'UNAUTHORIZED');
        }
        const result = await (0, verdict_service_1.rejectVerdictService)(verdictId);
        return reply.code(200).send({ success: true, data: result, message: 'Verdict rejected' });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.rejectVerdictController = rejectVerdictController;
/**
 * Get verdict statistics.
 * GET /api/v1/verdicts/stats
 */
const getVerdictStatsController = async (request, reply) => {
    try {
        const stats = await (0, verdict_service_1.getVerdictStatsService)();
        return reply.code(200).send({ success: true, data: stats });
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            return reply.code(error.statusCode).send({ success: false, message: error.message });
        }
        throw error;
    }
};
exports.getVerdictStatsController = getVerdictStatsController;
