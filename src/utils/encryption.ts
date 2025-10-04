import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a plain text secret using AES-256-GCM
 * @param plainText - The secret to encrypt
 * @param encryptionKey - The encryption key (should be 32 bytes/256 bits)
 * @returns Object containing the encrypted data, IV, and auth tag
 */
export function encryptSecret(plainText: string, encryptionKey: string): {
  encryptedData: string;
  iv: string;
  authTag: string;
} {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Ensure the encryption key is 32 bytes (256 bits)
  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest();

  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the auth tag for GCM mode
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts an encrypted secret using AES-256-GCM
 * @param encryptedData - The encrypted secret
 * @param iv - The initialization vector used during encryption
 * @param authTag - The authentication tag from encryption
 * @param encryptionKey - The encryption key (should be 32 bytes/256 bits)
 * @returns The decrypted plain text
 */
export function decryptSecret(
  encryptedData: string,
  iv: string,
  authTag: string,
  encryptionKey: string
): string {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Ensure the encryption key is 32 bytes (256 bits)
  const key = crypto
    .createHash('sha256')
    .update(encryptionKey)
    .digest();

  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  // Set the auth tag
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  // Decrypt the data
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generates a cryptographically secure random token
 * @param length - The length of the token in bytes (default: 32)
 * @returns A hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
