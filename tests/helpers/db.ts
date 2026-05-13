import { prisma } from '../../src/plugins/prisma';

export function shouldRunDbTests(): boolean {
  const enabled = process.env.ENABLE_DB_TESTS === 'true';
  const db = process.env.DATABASE_URL || '';
  return enabled && db.includes('test');
}

export async function resetTestDb(): Promise<void> {
  // Safety guard: never truncate non-test database.
  const db = process.env.DATABASE_URL || '';
  if (!db.includes('test')) {
    throw new Error('Refusing to reset non-test database. DATABASE_URL must contain "test".');
  }

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Notification",
      "AuditLog",
      "Comment",
      "VerdictHistory",
      "Verdict",
      "Investigation",
      "Evidence",
      "Claim",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}

export async function connectTestDb(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectTestDb(): Promise<void> {
  await prisma.$disconnect();
}
