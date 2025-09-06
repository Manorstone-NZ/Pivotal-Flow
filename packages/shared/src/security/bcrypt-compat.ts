import { hash as argon2Hash, verify as argon2Verify } from 'argon2';

/**
 * bcrypt compatibility shim using argon2
 * Provides the same API as bcrypt but uses argon2 for better security
 */
export async function hash(data: string, _saltRounds?: number): Promise<string> {
  try {
    // argon2 doesn't use salt rounds, but we'll use a reasonable default
    const options = {
      type: 2 as const, // argon2id
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    };
    
    return await argon2Hash(data, options);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function compare(data: string, encrypted: string): Promise<boolean> {
  try {
    return await argon2Verify(encrypted, data);
  } catch (error) {
    // argon2 throws on invalid hash format, but bcrypt.compare returns false
    return false;
  }
}

// Default export for compatibility
export default {
  hash,
  compare,
};
