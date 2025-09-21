export interface Argon2HashResult {
    hash: string;
    salt: string;
    algorithm: 'argon2id';
}
export interface PasswordVerificationResult {
    isValid: boolean;
    needsRehash: boolean;
    newHash?: Argon2HashResult;
}
/**
 * Argon2id Password Service
 * Implements secure password hashing with per-user salts and rolling upgrades
 */
export declare class Argon2PasswordService {
    /**
     * Hash a password using Argon2id with a random salt
     */
    hashPassword(password: string): Promise<Argon2HashResult>;
    /**
     * Verify a password against a hash with rolling upgrade support
     */
    verifyPassword(password: string, storedHash: string, storedSalt: string | null, algorithm: string | null): Promise<PasswordVerificationResult>;
    /**
     * Verify legacy password hash and generate Argon2id upgrade
     */
    private verifyLegacyPassword;
    /**
     * Verify Argon2id password hash
     */
    private verifyArgon2Password;
    /**
     * Compute Argon2id hash
     * TODO: Replace with proper Argon2id implementation
     */
    private computeArgon2Hash;
    /**
     * Verify legacy hash (bcrypt, etc.)
     * TODO: Replace with proper legacy hash verification
     */
    private verifyLegacyHash;
    /**
     * Generate a secure random salt
     */
    generateSalt(): string;
}
export declare const argon2PasswordService: Argon2PasswordService;
//# sourceMappingURL=argon2-password.d.ts.map