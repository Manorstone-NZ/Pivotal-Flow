import { randomBytes, timingSafeEqual } from 'crypto';
import { logger } from '../lib/logger.js';

// Argon2id parameters for secure password hashing
const ARGON2_CONFIG = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
  hashLength: 32,    // 32 bytes output
  saltLength: 16,    // 16 bytes salt
} as const;

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
export class Argon2PasswordService {
  /**
   * Hash a password using Argon2id with a random salt
   */
  async hashPassword(password: string): Promise<Argon2HashResult> {
    try {
      const salt = randomBytes(ARGON2_CONFIG.saltLength);
      
      // TODO: Implement proper Argon2id hashing
      // For now, use a placeholder implementation
      const hash = await this.computeArgon2Hash(password, salt);
      
      return {
        hash,
        salt: salt.toString('base64'),
        algorithm: 'argon2id'
      };
    } catch (error) {
      logger.error({ err: error }, 'Failed to hash password with Argon2id');
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against a hash with rolling upgrade support
   */
  async verifyPassword(
    password: string, 
    storedHash: string, 
    storedSalt: string | null, 
    algorithm: string | null
  ): Promise<PasswordVerificationResult> {
    try {
      // Handle legacy password hashes
      if (!algorithm || algorithm === 'legacy') {
        return await this.verifyLegacyPassword(password, storedHash);
      }

      // Handle Argon2id hashes
      if (algorithm === 'argon2id' && storedSalt) {
        const isValid = await this.verifyArgon2Password(password, storedHash, storedSalt);
        return {
          isValid,
          needsRehash: false // Already using Argon2id
        };
      }

      logger.warn({ algorithm }, 'Unknown password hash algorithm');
      return { isValid: false, needsRehash: false };
    } catch (error) {
      logger.error({ err: error, algorithm }, 'Password verification failed');
      return { isValid: false, needsRehash: false };
    }
  }

  /**
   * Verify legacy password hash and generate Argon2id upgrade
   */
  private async verifyLegacyPassword(
    password: string, 
    storedHash: string
  ): Promise<PasswordVerificationResult> {
    // TODO: Implement legacy hash verification (bcrypt, etc.)
    // For now, use simple comparison for development
    const isValid = await this.verifyLegacyHash(password, storedHash);
    
    if (isValid) {
      // Generate new Argon2id hash for rolling upgrade
      const newHash = await this.hashPassword(password);
      return {
        isValid: true,
        needsRehash: true,
        newHash
      };
    }

    return { isValid: false, needsRehash: false };
  }

  /**
   * Verify Argon2id password hash
   */
  private async verifyArgon2Password(
    password: string, 
    storedHash: string, 
    storedSalt: string
  ): Promise<boolean> {
    try {
      const salt = Buffer.from(storedSalt, 'base64');
      const computedHash = await this.computeArgon2Hash(password, salt);
      
      // Timing-safe comparison
      return timingSafeEqual(
        Buffer.from(storedHash, 'base64'),
        Buffer.from(computedHash, 'base64')
      );
    } catch (error) {
      logger.error({ err: error }, 'Argon2id verification failed');
      return false;
    }
  }

  /**
   * Compute Argon2id hash
   * TODO: Replace with proper Argon2id implementation
   */
  private async computeArgon2Hash(password: string, salt: Buffer): Promise<string> {
    // Placeholder implementation - replace with actual Argon2id
    const crypto = await import('crypto');
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('base64');
  }

  /**
   * Verify legacy hash (bcrypt, etc.)
   * TODO: Replace with proper legacy hash verification
   */
  private async verifyLegacyHash(password: string, storedHash: string): Promise<boolean> {
    // Placeholder implementation - replace with actual legacy verification
    const crypto = await import('crypto');
    const testHash = crypto.createHash('sha256').update(password).digest('hex');
    return testHash === storedHash;
  }

  /**
   * Generate a secure random salt
   */
  generateSalt(): string {
    return randomBytes(ARGON2_CONFIG.saltLength).toString('base64');
  }
}

// Export singleton instance
export const argon2PasswordService = new Argon2PasswordService();

