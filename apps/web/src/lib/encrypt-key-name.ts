import CryptoJS from "crypto-js";
import { env } from "@/config/env";

/**
 * Encrypts/hashes the key name for obfuscation in production
 * Uses consistent hashing so the same key always produces the same encrypted key
 *
 * @param keyName - The original key name to encrypt/hash
 * @returns The encrypted/hashed key name in production, or the original key name in development
 *
 * @example
 * ```ts
 * const encryptedKey = encryptKeyName("admin");
 * // Development: "user"
 * // Production: "a1b2c3d4e5f6..." (SHA256 hash)
 * // Encrypted Key: "a1b2c3d4e5f6..."
 * // Decrypted Key: "user"
 * // Encrypted Key: "a1b2c3d4e5f6..."
 * // Decrypted Key: "user"
 * ```
 */
export const encryptKeyName = (keyName: string): string => {
  if (import.meta.env.NODE_ENV === "development") {
    return keyName;
  }

  // Use SHA256 hash for consistent, one-way encryption of key names
  // This ensures the same key always produces the same encrypted key name
  // The encryption key is included to make the hash unique to this application
  return CryptoJS.SHA256(
    `${keyName}_${env.VITE_ENCRYPTION_KEY}`
  ).toString();
};
