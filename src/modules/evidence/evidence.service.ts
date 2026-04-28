import * as repository from './evidence.repository';
import type { EvidenceRecord, CreateEvidenceInput } from './evidence.repository';

/**
 * Add a new evidence record to a claim.
 * This service layer validates data flow and applies business logic.
 */
export async function addEvidence(
  claimId: string,
  data: Omit<CreateEvidenceInput, 'claimId'>
): Promise<EvidenceRecord> {
  // Merge claimId into the data
  const evidenceData: CreateEvidenceInput = {
    claimId,
    ...data
  };

  // Delegate to repository
  return repository.createEvidence(evidenceData);
}

/**
 * Retrieve all evidence records for a specific claim.
 */
export async function getEvidenceForClaim(claimId: string): Promise<EvidenceRecord[]> {
  return repository.findByClaimId(claimId);
}
