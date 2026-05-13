import { AppError } from '../../common/errors/app-error';
import { ValidationError } from '../../common/errors/validation-error';
import type { AuthenticatedUser } from '../../common/types';
import { createPaginatedResponse, type PaginatedResponse } from '../../common/responses/paginated-response';
import { getPaginationOffset } from '../../common/utils/pagination';

import {
  countMany,
  createClaim,
  findById,
  findMany,
  updateClaim,
  type ClaimRecord,
  type ClaimListFilter
} from './claims.repository';

type ClaimStatus = ClaimRecord['status'];

interface CreateClaimInput {
  statement: string;
}

interface UpdateClaimInput {
  title?: string | undefined;
  statement?: string | undefined;
}

interface ListClaimsInput {
  page: number;
  pageSize: number;
  status?: ClaimStatus | undefined;
  submittedById?: string | undefined;
}

function assertOwner(claim: ClaimRecord, requester: AuthenticatedUser): void {
  if (claim.submittedById !== requester.userId) {
    throw new AppError(403, 'You are not allowed to modify this claim.', 'FORBIDDEN');
  }
}

function assertDraft(claim: ClaimRecord, action: 'update' | 'submit'): void {
  if (claim.status !== 'DRAFT') {
    throw new ValidationError(`Claim must be in DRAFT status to ${action}.`);
  }
}

import * as audit from '../audit/services/audit-log.service';

export async function createClaimService(input: CreateClaimInput, requester: AuthenticatedUser): Promise<ClaimRecord> {
  const claim = await createClaim({
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

export async function listClaimsService(input: ListClaimsInput): Promise<PaginatedResponse<ClaimRecord>> {
  const filter: ClaimListFilter = {
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.submittedById !== undefined ? { submittedById: input.submittedById } : {})
  };

  const skip = getPaginationOffset(input.page, input.pageSize);

  const [items, total] = await Promise.all([
    findMany({
      filter,
      skip,
      take: input.pageSize
    }),
    countMany(filter)
  ]);

  return createPaginatedResponse({
    items,
    page: input.page,
    pageSize: input.pageSize,
    total
  });
}

export async function getClaimByIdService(id: string): Promise<ClaimRecord> {
  const claim = await findById(id);

  if (claim === null) {
    throw new AppError(404, 'Claim not found.', 'NOT_FOUND');
  }

  return claim;
}

export async function updateClaimService(id: string, input: UpdateClaimInput, requester: AuthenticatedUser): Promise<ClaimRecord> {
  const claim = await getClaimByIdService(id);

  assertOwner(claim, requester);
  assertDraft(claim, 'update');

  return updateClaim(id, {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.statement !== undefined ? { statement: input.statement.trim() } : {})
  });
}

export async function submitClaimService(id: string, requester: AuthenticatedUser): Promise<ClaimRecord> {
  const claim = await getClaimByIdService(id);

  assertOwner(claim, requester);
  assertDraft(claim, 'submit');

  const updated = await updateClaim(id, { status: 'SUBMITTED' });

  await audit.log({
    action: 'CLAIM_SUBMITTED',
    entityType: 'CLAIM',
    entityId: id,
    performedById: requester.userId,
    metadata: { previousStatus: claim.status, newStatus: updated.status }
  });

  return updated;
}
