/**
 * Audit normalization utilities
 * Provides helpers for normalizing audit data
 */

/**
 * Normalizes user ID for audit events
 * Converts undefined to null, keeping null as null
 * @param id The user ID to normalize
 * @returns null if id is undefined, otherwise id
 */
export const auditUserId = (id: string | null | undefined): string | null => {
  return id ?? null
}