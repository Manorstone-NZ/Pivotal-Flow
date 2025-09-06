export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
}
export declare const defaultPasswordPolicy: PasswordPolicy;
export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Validates password against security policy
 */
export declare function validatePassword(password: string, policy?: PasswordPolicy): PasswordValidationResult;
/**
 * Hashes password using argon2id
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verifies password against hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Checks if password needs rehashing
 */
export declare function needsRehash(hash: string): Promise<boolean>;
//# sourceMappingURL=password.d.ts.map