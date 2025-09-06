/**
 * Time utilities
 * Provides timing and date functions
 */
/**
 * Creates a high-resolution timer
 * @returns A function that returns elapsed time in milliseconds
 */
export function startTimer() {
    const start = process.hrtime.bigint();
    return () => Number(process.hrtime.bigint() - start) / 1e6;
}
/**
 * Gets current ISO timestamp
 * @returns Current time as ISO string
 */
export function nowIso() {
    return new Date().toISOString();
}
//# sourceMappingURL=time.js.map