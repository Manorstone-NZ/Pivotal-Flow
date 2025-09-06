/**
 * Time utilities
 * Provides timing and date functions
 */

/**
 * Creates a high-resolution timer
 * @returns A function that returns elapsed time in milliseconds
 */
export function startTimer(): () => number {
  const start = process.hrtime.bigint()
  return () => Number(process.hrtime.bigint() - start) / 1e6
}

/**
 * Gets current ISO timestamp
 * @returns Current time as ISO string
 */
export function nowIso(): string {
  return new Date().toISOString()
}