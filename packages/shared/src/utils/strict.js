/**
 * Strict type safety helpers
 * Provides utilities for safe type handling without any or non-null assertions
 */
/**
 * Ensures a value is not null or undefined, throwing an error if it is
 * @param v The value to check
 * @param msg Error message to throw if value is null/undefined
 * @returns The non-null value
 */
export function required(v, msg) {
    if (v == null) {
        throw new Error(msg);
    }
    return v;
}
/**
 * Converts undefined to null, keeping null as null
 * @param v The value to normalize
 * @returns null if v is undefined, otherwise v
 */
export function toNull(v) {
    return v ?? null;
}
/**
 * Type guard to check if a value is a non-empty string
 * @param v The value to check
 * @returns true if v is a non-empty string
 */
export function isNonEmptyString(v) {
    return typeof v === 'string' && v.length > 0;
}
//# sourceMappingURL=strict.js.map