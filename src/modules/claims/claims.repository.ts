import { prisma } from '../../plugins/prisma';

export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface ClaimRecord {
  id: string;
  title: string;
  statement: string;
  status: ClaimStatus;
  submittedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimListFilter {
  status?: ClaimStatus;
  submittedById?: string;
}

export async function createClaim(data: {
  title: string;
  statement: string;
  submittedById: string;
}): Promise<ClaimRecord> {
  return prisma.claim.create({
    data: {
      title: data.title,
      statement: data.statement,
      submittedById: data.submittedById,
      status: 'DRAFT'
    }
  });
}

export async function findById(id: string): Promise<ClaimRecord | null> {
  return prisma.claim.findUnique({
    where: { id }
  });
}

export async function findMany(input: {
  filter: ClaimListFilter;
  skip: number;
  take: number;
}): Promise<ClaimRecord[]> {
  const where = {
    ...(input.filter.status !== undefined ? { status: input.filter.status } : {}),
    ...(input.filter.submittedById !== undefined ? { submittedById: input.filter.submittedById } : {})
  };

  return prisma.claim.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: input.skip,
    take: input.take
  });
}

export async function countMany(filter: ClaimListFilter): Promise<number> {
  const where = {
    ...(filter.status !== undefined ? { status: filter.status } : {}),
    ...(filter.submittedById !== undefined ? { submittedById: filter.submittedById } : {})
  };

  return prisma.claim.count({ where });
}

export async function updateClaim(id: string, data: {
  title?: string;
  statement?: string;
  status?: ClaimStatus;
}): Promise<ClaimRecord> {
  return prisma.claim.update({
    where: { id },
    data
  });
}
