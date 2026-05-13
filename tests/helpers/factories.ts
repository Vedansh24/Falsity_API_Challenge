import { prisma } from '../../src/plugins/prisma';
import { hashPassword } from '../../src/common/utils/hashing';
import type { Role } from '../../src/common/types/auth';

export async function createUserFactory(input: {
  name: string;
  email: string;
  role: Role;
  password?: string;
}) {
  const passwordHash = await hashPassword(input.password || 'Password123!');
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      passwordHash
    }
  });
}

export async function createClaimFactory(input: {
  title: string;
  statement: string;
  submittedById: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_MORE_EVIDENCE' | 'READY_FOR_VERDICT' | 'PUBLISHED' | 'ARCHIVED';
  currentAnalystId?: string;
}) {
  return prisma.claim.create({
    data: {
      title: input.title,
      statement: input.statement,
      submittedById: input.submittedById,
      status: input.status || 'DRAFT',
      currentAnalystId: input.currentAnalystId
    }
  });
}
