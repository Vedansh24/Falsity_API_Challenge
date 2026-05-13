import { prisma } from '../../plugins/prisma';

export interface CommentRecord {
  id: string;
  claimId: string;
  userId: string;
  content: string;
  visibility?: 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY';
  createdAt: Date;
  updatedAt: Date;
}

export async function createComment(data: {
  claimId: string;
  userId: string;
  content: string;
  visibility?: 'PUBLIC' | 'INTERNAL' | 'REVIEWER_ONLY';
}): Promise<CommentRecord> {
  const rec = await prisma.comment.create({
    data: {
      claimId: data.claimId,
      userId: data.userId,
      content: data.content,
      // If the schema includes visibility, Prisma will accept it; otherwise it's ignored.
      ...(data.visibility ? { visibility: data.visibility } : {})
    }
  });

  return rec as unknown as CommentRecord;
}

export async function updateComment(id: string, data: { content?: string }): Promise<CommentRecord> {
  const rec = await prisma.comment.update({
    where: { id },
    data: {
      ...(data.content !== undefined ? { content: data.content } : {})
    }
  });

  return rec as unknown as CommentRecord;
}

export async function deleteComment(id: string): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}

export async function findById(id: string): Promise<CommentRecord | null> {
  const rec = await prisma.comment.findUnique({ where: { id } });
  return rec as unknown as CommentRecord | null;
}

export async function listByClaim(claimId: string, options: { limit?: number; offset?: number } = {}) {
  const items = await prisma.comment.findMany({
    where: { claimId },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 50,
    skip: options.offset ?? 0
  });

  return items as unknown as CommentRecord[];
}
