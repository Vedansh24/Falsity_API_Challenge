import { prisma } from '../../plugins/prisma';

export interface InvestigationRecord {
  id: string;
  claimId: string;
  investigatorId: string | null;
  status: string;
  notes: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findInvestigationByClaim(claimId: string): Promise<InvestigationRecord | null> {
  return (await prisma.investigation.findFirst({
    where: { claimId }
  })) as InvestigationRecord | null;
}

export async function findInvestigationById(id: string): Promise<InvestigationRecord | null> {
  return (await prisma.investigation.findUnique({
    where: { id }
  })) as InvestigationRecord | null;
}

export async function createInvestigation(data: {
  claimId: string;
  investigatorId?: string | null;
  status?: string;
  notes?: string | null;
  startedAt?: Date | null;
}): Promise<InvestigationRecord> {
  return (await prisma.investigation.create({
    data: {
      claimId: data.claimId,
      investigatorId: data.investigatorId,
      status: data.status || 'ACTIVE',
      notes: data.notes,
      startedAt: data.startedAt
    } as any
  })) as InvestigationRecord;
}

export async function updateInvestigation(
  id: string,
  data: {
    status?: string;
    notes?: string | null;
    investigatorId?: string | null;
    completedAt?: Date | null;
    startedAt?: Date | null;
  }
): Promise<InvestigationRecord> {
  return (await prisma.investigation.update({
    where: { id },
    data: data as any
  })) as InvestigationRecord;
}
