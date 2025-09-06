/**
 * Strict Type Utilities
 * Helper functions for handling strict TypeScript patterns
 */
/**
 * Ensures a value is not null or undefined, throwing an error if it is
 * @param v - The value to check
 * @param msg - Error message to throw if value is null/undefined
 * @returns The value if it's not null/undefined
 * @throws Error if value is null or undefined
 */
export declare function required<T>(v: T | null | undefined, msg: string): T;
/**
 * Converts undefined to null for exactOptionalPropertyTypes compatibility
 * @param v - The value to convert
 * @returns The value or null if undefined
 */
export declare function toNull(v: string | null | undefined): string | null;
//# sourceMappingURL=strict.d.ts.map