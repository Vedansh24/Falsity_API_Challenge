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

import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { AppError } from '../../common/errors/app-error';
import {
  getVerdictService,
  recomputeVerdictService,
  getVerdictHistoryService,
  approveVerdictService,
  rejectVerdictService,
  getVerdictStatsService
} from './verdict.service';
import type { AuthenticatedUser } from '../../common/types/auth';

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

/**
 * Get current verdict for a claim.
 * GET /api/v1/claims/:id/verdict
 */
export const getVerdictController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const params = request.params as { id: string };
    const { id } = params;

    const result = await getVerdictService(id);
    return reply.code(200).send({ success: true, data: result });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};

/**
 * Recompute verdict for a claim (trigger recalculation from evidence).
 * POST /api/v1/claims/:id/verdict/recompute
 */
export const recomputeVerdictController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const params = request.params as { id: string };
    const { id } = params;

    const result = await recomputeVerdictService(id);
    return reply.code(200).send({ success: true, data: result, message: 'Verdict recomputed' });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};

/**
 * Get verdict history for a claim.
 * GET /api/v1/claims/:id/verdict/history
 */
export const getVerdictHistoryController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const params = request.params as { id: string };
    const query = request.query as { limit?: string };
    const { id } = params;
    const limit = query.limit ? parseInt(query.limit) : 50;

    const history = await getVerdictHistoryService(id, limit);
    return reply.code(200).send({ success: true, data: history });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};

/**
 * Approve a verdict (moderation workflow).
 * POST /api/v1/verdicts/:verdictId/approve
 */
export const approveVerdictController: RouteHandlerMethod = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const params = request.params as { verdictId: string };
    const { verdictId } = params;

    if (!request.user) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const result = await approveVerdictService(verdictId, request.user.userId);
    return reply.code(200).send({ success: true, data: result, message: 'Verdict approved' });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};

/**
 * Reject a verdict (moderation workflow).
 * POST /api/v1/verdicts/:verdictId/reject
 */
export const rejectVerdictController: RouteHandlerMethod = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const params = request.params as { verdictId: string };
    const { verdictId } = params;

    if (!request.user) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const result = await rejectVerdictService(verdictId);
    return reply.code(200).send({ success: true, data: result, message: 'Verdict rejected' });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};

/**
 * Get verdict statistics.
 * GET /api/v1/verdicts/stats
 */
export const getVerdictStatsController: RouteHandlerMethod = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  try {
    const stats = await getVerdictStatsService();
    return reply.code(200).send({ success: true, data: stats });
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ success: false, message: error.message });
    }
    throw error;
  }
};
