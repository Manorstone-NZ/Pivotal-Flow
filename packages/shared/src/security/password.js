import * as argon2 from "argon2";
export const defaultPasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
};
/**
 * Validates password against security policy
 */
export function validatePassword(password, policy = defaultPasswordPolicy) {
    const errors = [];
    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
/**
 * Hashes password using argon2id
 */
export async function hashPassword(password) {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MiB
        timeCost: 3, // 3 iterations
        parallelism: 1,
    });
}
/**
 * Verifies password against hash
 */
export async function verifyPassword(password, hash) {
    try {
        return await argon2.verify(hash, password);
    }
    catch (error) {
        // Log error but don't expose details
        console.error('Password verification error:', error);
        return false;
    }
}
/**
 * Checks if password needs rehashing
 */
export async function needsRehash(hash) {
    try {
        return await argon2.needsRehash(hash);
    }
    catch (error) {
        console.error('Rehash check error:', error);
        return true; // Default to requiring rehash on error
    }
}
//# sourceMappingURL=password.js.map