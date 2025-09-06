/**
 * Audit Field Normalizers
 * Utility functions for normalizing audit event fields to match strict types
 */

/**
 * Normalizes user ID for audit events
 * Converts undefined to null for exactOptionalPropertyTypes compatibility
 * @param id - The user ID to normalize
 * @returns The user ID or null if undefined
 */
export const auditUserId = (id: string | undefined | null): string | null => {
  return id ?? null;
};
