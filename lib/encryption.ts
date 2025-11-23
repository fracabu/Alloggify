/**
 * Encryption Library for Sensitive Data
 * Uses AES-256-GCM for encrypting/decrypting WSKEY credentials
 *
 * Security Notes:
 * - ENCRYPTION_KEY must be 32-byte (64 hex chars) random string
 * - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * - Store in .env.local (NEVER commit to git)
 * - GCM mode provides authenticated encryption (prevents tampering)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag
const ENCODING = 'hex';

/**
 * Get encryption key from environment
 * Throws error if not configured (fail-fast on startup)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY not configured. Generate with: ' +
      'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  if (key.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be 64 hex characters (32 bytes). Current length: ${key.length}`
    );
  }

  return Buffer.from(key, ENCODING);
}

/**
 * Encrypt sensitive data (WSKEY, passwords, etc.)
 *
 * Format: iv:authTag:encryptedData (all hex-encoded)
 * Example: "a1b2c3d4...":auth_tag_hex":"encrypted_hex"
 *
 * @param plaintext - Data to encrypt (e.g., WSKEY)
 * @returns Encrypted string in format "iv:authTag:encrypted"
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag().toString(ENCODING);

    // Format: iv:authTag:encrypted
    return `${iv.toString(ENCODING)}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 *
 * @param encryptedData - String in format "iv:authTag:encrypted"
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();

    // Parse encrypted string
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format. Expected "iv:authTag:encrypted"');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    throw new Error('Decryption failed. Data may be corrupted or tampered.');
  }
}

/**
 * Encrypt WSKEY specifically (wrapper for clarity)
 */
export function encryptWskey(wskey: string): string {
  if (!wskey || wskey.trim().length === 0) {
    throw new Error('WSKEY cannot be empty');
  }
  return encrypt(wskey);
}

/**
 * Decrypt WSKEY specifically (wrapper for clarity)
 */
export function decryptWskey(encryptedWskey: string): string {
  if (!encryptedWskey || encryptedWskey.trim().length === 0) {
    throw new Error('Encrypted WSKEY cannot be empty');
  }
  return decrypt(encryptedWskey);
}

/**
 * Hash data for comparison (one-way, non-reversible)
 * Used for detecting WSKEY changes without storing plaintext
 *
 * @param data - Data to hash
 * @returns SHA-256 hash (hex string)
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate encryption key format
 * Call on server startup to fail-fast if misconfigured
 */
export function validateEncryptionConfig(): boolean {
  try {
    getEncryptionKey();

    // Test encryption/decryption round-trip
    const testData = 'test-wskey-validation';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    if (testData !== decrypted) {
      throw new Error('Encryption round-trip validation failed');
    }

    console.log('[Encryption] Configuration validated successfully');
    return true;
  } catch (error) {
    console.error('[Encryption] Configuration validation failed:', error);
    return false;
  }
}
