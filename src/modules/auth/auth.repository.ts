import { prisma } from '../../plugins/prisma';
import type { AuthUserRecord } from './auth.types';
import type { Role } from '../../common/types';

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Promise<AuthUserRecord> {
  return prisma.user.create({
    data
  });
}

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
}

export async function findUserById(id: string): Promise<AuthUserRecord | null> {
  return prisma.user.findUnique({
    where: {
      id
    }
  });
}
