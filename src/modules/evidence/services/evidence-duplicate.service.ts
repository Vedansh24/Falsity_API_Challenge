import { AppError } from '../../../common/errors/app-error';
import { prisma } from '../../../plugins/prisma';

/**
 * Normalize a URL for comparison.
 * Removes trailing slashes, standardizes protocol.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Return normalized URL without trailing slash
    let normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, return trimmed URL
    return url.trim().toLowerCase();
  }
}

/**
 * Check if evidence with the same source URL already exists for the claim.
 */
export async function checkDuplicate(claimId: string, sourceUrl: string): Promise<boolean> {
  const normalizedInput = normalizeUrl(sourceUrl);

  // Find all evidence for this claim
  const existingEvidence = await prisma.evidence.findMany({
    where: { claimId },
    select: { id: true, sourceUrl: true }
  });

  // Check if any have matching normalized URL
  return existingEvidence.some((evidence: { id: string; sourceUrl: string }) => normalizeUrl(evidence.sourceUrl) === normalizedInput);
}

/**
 * Assert that no duplicate evidence exists.
 * Throws if duplicate found.
 */
export async function assertNoDuplicate(claimId: string, sourceUrl: string): Promise<void> {
  const isDuplicate = await checkDuplicate(claimId, sourceUrl);

  if (isDuplicate) {
    throw new AppError(
      409,
      'Evidence from this source already exists for this claim',
      'DUPLICATE_EVIDENCE'
    );
  }
}
