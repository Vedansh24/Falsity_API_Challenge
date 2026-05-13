/**
 * Rate limiting configuration for Phase 8.
 * Protects API endpoints from abuse while allowing admin/internal access.
 */

export interface RateLimitConfig {
  max: number;
  timeWindow: string;
  cache: number;
  skipOnError: boolean;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Strict: auth endpoints - 5 requests per 15 minutes
  AUTH: {
    max: 5,
    timeWindow: '15 minutes',
    cache: 10000,
    skipOnError: false
  },

  // Public: verdict endpoints - 30 requests per minute
  PUBLIC_VERDICT: {
    max: 30,
    timeWindow: '1 minute',
    cache: 10000,
    skipOnError: true
  },

  // Moderate: ingestion endpoints - 10 requests per minute
  INGESTION: {
    max: 10,
    timeWindow: '1 minute',
    cache: 10000,
    skipOnError: true
  },

  // Internal: analyst/admin - relaxed or bypassed
  INTERNAL: {
    max: 1000,
    timeWindow: '1 minute',
    cache: 10000,
    skipOnError: true
  }
};

/**
 * Returns true if user should bypass rate limiting.
 * ADMIN and REVIEWER roles bypass all limits.
 */
export function shouldBypassRateLimit(role?: string): boolean {
  return role === 'ADMIN' || role === 'REVIEWER';
}
