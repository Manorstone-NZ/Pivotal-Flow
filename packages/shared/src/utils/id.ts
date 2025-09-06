/**
 * ID generation utilities
 * Provides secure ID generation functions
 */

/**
 * Generates a secure random UUID
 * @returns A UUID string
 */
export function generateId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  
  // Fallback for environments without crypto.randomUUID
  return require('node:crypto').randomUUID()
}